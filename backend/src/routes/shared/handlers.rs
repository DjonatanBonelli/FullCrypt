use axum::{
    extract::{Path, State},
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
    pub enveloped_key: String, // agora é String
}

pub async fn listar(
    State(pool): State<Arc<Pool>>,
    AuthUser(user_id): AuthUser,
) -> Result<Json<Vec<Compartilhamento>>, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let rows = client
        .query(
            "
            SELECT c.id, c.arquivo_id, a.nome_arquivo, c.sender_id, u.nome as sender_nome, c.receiver_id, c.chave_encrypted, c.status, c.criado_em
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
        chave_encrypted: r.get::<_, String>("chave_encrypted"),
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
