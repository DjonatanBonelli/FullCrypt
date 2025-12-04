use axum::{
    extract::{State, Extension},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use deadpool_postgres::Pool;
use std::sync::Arc;
use serde::Deserialize;
use crate::middleware::jwt::AuthUser;

#[derive(Deserialize)]
pub struct ShareStoredRequest {
    pub arquivo_id: i32,
    pub nome_arquivo: String,
    pub email: String,
    pub chave_encrypted: String,
    pub signature: String,
}

pub async fn compartilhar_armazenado(
    State(pool): State<Arc<Pool>>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<ShareStoredRequest>,
) -> impl IntoResponse {
    println!("🔹 Iniciando compartilhamento de arquivo armazenado, sender_id = {}, arquivo_id = {}", auth_user.user_id, req.arquivo_id);

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

    // Verificar se o arquivo existe e pertence ao usuário
    let arquivo_row = match tx.query_opt(
        "SELECT id, usuario_id FROM arquivos WHERE id = $1 AND usuario_id = $2",
        &[&req.arquivo_id, &auth_user.user_id],
    ).await {
        Ok(r) => r,
        Err(err) => {
            eprintln!("❌ Erro buscando arquivo: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro DB".to_string());
        }
    };

    if arquivo_row.is_none() {
        eprintln!("❌ Arquivo não encontrado ou não pertence ao usuário");
        return (StatusCode::NOT_FOUND, "Arquivo não encontrado ou sem permissão".to_string());
    }

    // Buscar id do destinatário
    let receiver_row = match tx.query_opt("SELECT id FROM usuarios WHERE email=$1", &[&req.email]).await {
        Ok(r) => r,
        Err(err) => {
            eprintln!("❌ Erro buscando usuário: {:?}", err);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro DB".to_string());
        }
    };

    let receiver_id: i32 = match receiver_row {
        Some(r) => r.get("id"),
        None => {
            eprintln!("❌ Usuário não encontrado: {}", req.email);
            return (StatusCode::NOT_FOUND, "Usuário não encontrado".to_string());
        }
    };

    println!("🔹 receiver_id encontrado: {}", receiver_id);

    // Inserir compartilhamento (o arquivo já existe, só criar o compartilhamento)
    if let Err(err) = tx.execute(
        "INSERT INTO compartilhamentos (arquivo_id, sender_id, receiver_id, status, criado_em, chave_encrypted, signature)
         VALUES ($1, $2, $3, 'pendente', NOW(), $4, $5)",
        &[&req.arquivo_id, &auth_user.user_id, &receiver_id, &req.chave_encrypted, &req.signature],
    ).await {
        eprintln!("❌ Erro inserindo compartilhamento: {:?}", err);
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
    }

    if let Err(err) = tx.commit().await {
        eprintln!("❌ Erro no commit da transação: {:?}", err);
        return (StatusCode::INTERNAL_SERVER_ERROR, format!("Erro DB: {:?}", err));
    }

    println!("✅ Compartilhamento concluído com sucesso!");
    (StatusCode::OK, "✅ Arquivo compartilhado com sucesso!".to_string())
}

