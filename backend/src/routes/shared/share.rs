use axum::{
    extract::{State, Extension, Multipart},
    http::StatusCode,
    response::IntoResponse,
};
use deadpool_postgres::Pool;
use std::sync::Arc;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use crate::middleware::jwt::AuthUser;

pub async fn compartilhar(
    State(pool): State<Arc<Pool>>,
    Extension(auth_user): Extension<AuthUser>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    println!("🔹 Iniciando compartilhamento, sender_id = {}", auth_user.user_id);

    let mut nome_arquivo = None;
    let mut conteudo = None;
    let mut nonce = None;
    let mut email = None;
    let mut chave_encrypted = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or_default().to_string(); // já copia para String
        let bytes = match field.bytes().await {
            Ok(b) => b.to_vec(),
            Err(err) => {
                eprintln!("❌ Erro lendo field {}: {:?}", name, err);
                continue;
            }
        };

        match name.as_str() {
            "file" => conteudo = Some(bytes),
            "nome_arquivo" => nome_arquivo = Some(String::from_utf8_lossy(&bytes).to_string()),
            "nonce_file" => match URL_SAFE_NO_PAD.decode(&bytes) {
                Ok(n) => nonce = Some(n),
                Err(err) => eprintln!("❌ Erro decodificando nonce: {:?}", err),
            },
            "email" => email = Some(String::from_utf8_lossy(&bytes).to_string()),
            "chave_encrypted" => chave_encrypted = Some(String::from_utf8_lossy(&bytes).to_string()),
            _ => println!("⚠ Field desconhecido: {}", name),
        }
    }

    // valida campos obrigatórios
    let (nome_arquivo, conteudo, email, chave_encrypted) = match (
        nome_arquivo, conteudo, email, chave_encrypted,
    ) {
        (Some(nf), Some(c), Some(e), Some(k)) => (nf, c, e, k),
        _ => {
            eprintln!("❌ Campos ausentes no multipart");
            return (StatusCode::BAD_REQUEST, "Campos ausentes".to_string());
        }
    };

    let mut client = match pool.get().await {
        Ok(c) => c,
        Err(err) => {
            eprintln!("❌ Erro ao pegar client do pool: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no pool".to_string());
        }
    };

    let mut tx = match client.transaction().await {
        Ok(tx) => tx,
        Err(err) => {
            eprintln!("❌ Erro iniciando transação: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro na transação".to_string());
        }
    };

    // pega id do destinatário
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
    let arquivo_id: i32 = match tx.query_one(
        "INSERT INTO arquivos (usuario_id, nome_arquivo, conteudo, nonce, criado_em)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id",
        &[&auth_user.user_id, &nome_arquivo, &conteudo, &nonce],
    ).await {
        Ok(r) => r.get("id"),
        Err(err) => {
            eprintln!("❌ Erro inserindo arquivo: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
        }
    };

    // Inserir compartilhamento
    if let Err(err) = tx.execute(
        "INSERT INTO compartilhamentos (arquivo_id, sender_id, receiver_id, status, criado_em, chave_encrypted)
         VALUES ($1, $2, $3, 'pendente', NOW(), $4)",
        &[&arquivo_id, &auth_user.user_id, &receiver_id, &chave_encrypted],
    ).await {
        eprintln!("❌ Erro inserindo compartilhamento: {:?}", err);
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
    }

    if let Err(err) = tx.commit().await {
        eprintln!("❌ Erro no commit da transação: {:?}", err);
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
    }

    println!("✅ Compartilhamento concluído com sucesso!");
    (StatusCode::OK, "✅ Arquivo enviado e compartilhado com sucesso!".to_string())
}
