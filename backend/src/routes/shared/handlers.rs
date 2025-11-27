use axum::{
    extract::{Extension, Path, State},
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use deadpool_postgres::Pool;
use std::sync::Arc;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use serde::Deserialize;
use crate::middleware::jwt::AuthUser;
use crate::routes::shared::models::Compartilhamento;

#[derive(Deserialize)]
pub struct ShareRequest {
    pub email: String,
    pub enveloped_key: String, 
}

pub async fn listar(
    State(pool): State<Arc<Pool>>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Compartilhamento>>, (StatusCode, Json<serde_json::Value>)> {
    let client = pool.get().await.map_err(|err| {
        eprintln!("Erro ao pegar conexão para listar compartilhamentos: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let rows = client
        .query(
            "
            SELECT c.id, c.arquivo_id, a.nome_arquivo, c.sender_id, u1.nome as sender_nome, u1.email AS sender_email, u2.email AS receiver_email, c.receiver_id, c.chave_encrypted, c.assinatura, c.status, c.criado_em
            FROM compartilhamentos c
            JOIN arquivos a ON c.arquivo_id = a.id
            JOIN usuarios u1 ON c.sender_id = u1.id
            JOIN usuarios u2 ON c.receiver_id = u2.id 
            WHERE c.receiver_id = $1
            ",
            &[&auth_user.user_id],
        )
        .await
        .map_err(|err| {
            eprintln!("Erro ao buscar compartilhamentos: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erro ao buscar compartilhamentos" })),
            )
        })?;

    let compartilhamentos: Vec<Compartilhamento> = rows.iter().map(|r| Compartilhamento {
        id: r.get("id"),
        arquivo_id: r.get("arquivo_id"),
        arquivo_nome: r.get("nome_arquivo"),
        sender_id: r.get("sender_id"),
        sender_nome: r.get("sender_nome"),
        receiver_id: r.get("receiver_id"),
        sender_email: r.get("sender_email"),
        receiver_email: r.get("receiver_email"),
        chave_encrypted: r.get::<_, String>("chave_encrypted"),
        signature: r.get::<_, String>("signature"),
        status: r.get("status"),
        criado_em: r.get("criado_em"),
    }).collect();
    Ok(Json(compartilhamentos))
}

pub async fn aceitar(
    State(pool): State<Arc<Pool>>,
    Path(id): Path<i32>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows_updated = client
        .execute(
            "UPDATE compartilhamentos SET status='aceito' WHERE id=$1 AND receiver_id=$2",
            &[&id, &auth_user.user_id],
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
    Extension(auth_user): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows_updated = client
        .execute(
            "UPDATE compartilhamentos SET status='recusado' WHERE id=$1 AND receiver_id=$2",
            &[&id, &auth_user.user_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if rows_updated == 1 {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
