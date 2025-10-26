use axum::{
    extract::{Path, State, Extension, Multipart},
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use deadpool_postgres::Pool;
use std::sync::Arc;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use serde::Deserialize;
use crate::routes::auth::auth_user::AuthUser;
use crate::routes::shared::models::Compartilhamento;

#[derive(Deserialize)]
pub struct ShareRequest {
    pub email: String,
    pub enveloped_key: Vec<u8>,
}

#[axum::debug_handler]
pub async fn compartilhar(
    State(pool): State<Arc<Pool>>,
    Extension(AuthUser(sender_id)): Extension<AuthUser>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    println!("🔹 Iniciando compartilhamento, sender_id = {}", sender_id);

    let mut client = match pool.get().await {
        Ok(c) => c,
        Err(err) => {
            eprintln!("❌ Erro ao pegar client do pool: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no pool".to_string());
        }
    };

    let mut nome_arquivo: Option<String> = None;
    let mut conteudo: Option<Vec<u8>> = None;
    let mut nonce: Option<Vec<u8>> = None;
    let mut email: Option<String> = None;
    let mut chave_encrypted: Option<Vec<u8>> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();
        let bytes = match field.bytes().await {
            Ok(b) => b.to_vec(),
            Err(err) => {
                eprintln!("❌ Erro lendo bytes do field {}: {:?}", name, err);
                continue;
            }
        };

        println!("📦 Field recebido: {} ({} bytes)", name, bytes.len());

        match name.as_str() {
            "file" => conteudo = Some(bytes),
            "nome_arquivo" => nome_arquivo = Some(String::from_utf8_lossy(&bytes).to_string()),
            "nonce_file" => match URL_SAFE_NO_PAD.decode(&bytes) {
                Ok(n) => nonce = Some(n),
                Err(err) => eprintln!("❌ Erro decodificando nonce: {:?}", err),
            },
            "email" => email = Some(String::from_utf8_lossy(&bytes).to_string()),
            "chave_encrypted" => match URL_SAFE_NO_PAD.decode(&bytes) {
                Ok(k) => chave_encrypted = Some(k),
                Err(err) => eprintln!("❌ Erro decodificando chave_encrypted: {:?}", err),
            },
            _ => println!("⚠ Field desconhecido: {}", name),
        }
    }

    println!(
        "🔹 Campos extraídos - nome_arquivo: {:?}, conteudo: {} bytes, nonce: {} bytes, email: {:?}, chave_encrypted: {} bytes",
        nome_arquivo,
        conteudo.as_ref().map(|c| c.len()).unwrap_or(0),
        nonce.as_ref().map(|n| n.len()).unwrap_or(0),
        email,
        chave_encrypted.as_ref().map(|k| k.len()).unwrap_or(0)
    );

    if conteudo.is_none() || nome_arquivo.is_none() || nonce.is_none() || email.is_none() || chave_encrypted.is_none() {
        eprintln!("❌ Campos ausentes no multipart");
        return (StatusCode::BAD_REQUEST, "Campos ausentes".to_string());
    }

    let email = email.unwrap();

    let mut tx = match client.transaction().await {
        Ok(t) => t,
        Err(err) => {
            eprintln!("❌ Erro iniciando transação: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro na transação".to_string());
        }
    };

    let receiver_row = match tx.query_opt("SELECT id FROM usuarios WHERE email=$1", &[&email]).await {
        Ok(r) => r,
        Err(err) => {
            eprintln!("❌ Erro buscando usuário: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro DB".to_string());
        }
    };

    let receiver_id: i32 = match receiver_row {
        Some(r) => r.get("id"),
        None => {
            eprintln!("❌ Usuário não encontrado: {}", email);
            return (StatusCode::NOT_FOUND, "Usuário não encontrado".to_string());
        }
    };

    println!("🔹 receiver_id encontrado: {}", receiver_id);

    // Inserir arquivo
    let row = match tx.query_one(
        "INSERT INTO arquivos (usuario_id, nome_arquivo, conteudo, nonce, criado_em)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id",
        &[
            &sender_id,
            &nome_arquivo.as_ref().unwrap(),
            &conteudo.as_ref().unwrap(),
            &nonce.as_ref().unwrap(),
        ],
    ).await {
        Ok(r) => r,
        Err(err) => {
            eprintln!("❌ Erro inserindo arquivo: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
        }
    };

    let arquivo_id: i32 = row.get("id");
    println!("🔹 Arquivo inserido com id {}", arquivo_id);

    // Inserir compartilhamento
    if let Err(err) = tx.query_one(
        "INSERT INTO compartilhamentos (arquivo_id, sender_id, receiver_id, status, criado_em, chave_encrypted)
         VALUES ($1, $2, $3, 'pendente', NOW(), $4)",
        &[
            &arquivo_id,
            &sender_id,
            &receiver_id,
            &chave_encrypted.as_ref().unwrap(),
        ],
    ).await {
        eprintln!("❌ Erro inserindo compartilhamento: {:?}", err);
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
    }

    // Commit
    if let Err(err) = tx.commit().await {
        eprintln!("❌ Erro no commit da transação: {:?}", err);
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
    }

    println!("✅ Compartilhamento concluído com sucesso!");

    (StatusCode::OK, "✅ Arquivo enviado e compartilhado com sucesso!".to_string())
}


pub async fn listar(
    State(pool): State<Arc<Pool>>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<Vec<Compartilhamento>>, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let rows = client
        .query(
            "
            SELECT c.id, c.arquivo_id, a.nome_arquivo, c.sender_id, u.nome as sender_nome, c.receiver_id, c.status, c.criado_em
            FROM compartilhamentos c
            JOIN arquivos a ON c.arquivo_id = a.id
            JOIN usuarios u ON c.sender_id = u.id
            WHERE c.receiver_id = $1
            ",
            &[&user_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let compartilhamentos: Vec<Compartilhamento> = rows.iter().map(|r| Compartilhamento {
        id: r.get("id"),
        arquivo_id: r.get("arquivo_id"),
        arquivo_nome: r.get("nome_arquivo"),
        sender_id: r.get("sender_id"),
        sender_nome: r.get("sender_nome"),
        receiver_id: r.get("receiver_id"),
        chave_encrypted: r.get("chave_encrypted"),
        status: r.get("status"),
        criado_em: r.get("criado_em"),
    }).collect();

    Ok(Json(compartilhamentos))
}

pub async fn aceitar(
    State(pool): State<Arc<Pool>>,
    Path(id): Path<i32>,
    AuthUser(user_id): AuthUser,
) -> Result<StatusCode, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows_updated = client
        .execute(
            "UPDATE compartilhamentos SET status='aceito' WHERE id=$1 AND receiver_id=$2",
            &[&id, &user_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if rows_updated == 1 {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn recusar(
    State(pool): State<Arc<Pool>>,
    Path(id): Path<i32>,
    AuthUser(user_id): AuthUser,
) -> Result<StatusCode, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows_updated = client
        .execute(
            "UPDATE compartilhamentos SET status='recusado' WHERE id=$1 AND receiver_id=$2",
            &[&id, &user_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if rows_updated == 1 {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
