use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::Json,
};
use std::sync::Arc;
use deadpool_postgres::{Pool, Client};
use serde::Serialize;
use crate::db::queries;
use crate::middleware::jwt::AuthUser;

#[derive(Serialize)]
pub struct Archive {
    pub id: i32,
    pub nome: String,
    pub tamanho: i64, // <-- novo campo
}

pub async fn archives(
    Extension(auth_user): Extension<AuthUser>, 
    State(pool): State<Arc<Pool>>,
) -> Result<Json<Vec<Archive>>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = auth_user.user_id;

    let client: Client = pool.get().await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let stmt = client.prepare(queries::SELECT_ARQUIVOS).await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let rows = client.query(&stmt, &[&user_id]).await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro ao buscar arquivos" })),
        )
    })?;

    let arquivos: Vec<Archive> = rows
        .into_iter()
        .map(|r| Archive {
            id: r.get("id"),
            nome: r.get("nome_arquivo"),
            tamanho: r.get("tamanho"), // <-- pega do banco
        })
        .collect();

    Ok(Json(arquivos))
}
