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
}

pub async fn archives(
    Extension(auth_user): Extension<AuthUser>, // já vem do middleware
    State(pool): State<Arc<Pool>>,
) -> Result<Json<Vec<Archive>>, (StatusCode, Json<serde_json::Value>)> {
    let user_id = auth_user.user_id;

    // pega conexão do pool
    let client: Client = pool.get().await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    // prepara query
    let stmt = client.prepare(queries::SELECT_ARQUIVOS).await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    // executa query
    let rows = client.query(&stmt, &[&user_id]).await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro ao buscar arquivos" })),
        )
    })?;

    // mapeia para struct Archive
    let arquivos: Vec<Archive> = rows
        .into_iter()
        .map(|r| Archive {
            id: r.get("id"),
            nome: r.get("nome_arquivo"),
        })
        .collect();

    Ok(Json(arquivos))
}
