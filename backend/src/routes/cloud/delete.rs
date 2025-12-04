use std::sync::Arc;

use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    Json,
};
use deadpool_postgres::{Client, Pool};
use serde::Serialize;

use crate::{db::queries, middleware::jwt::AuthUser};

#[derive(Serialize)]
pub struct DeleteResponse {
    pub message: &'static str,
}

pub async fn delete_file(
    Path(file_id): Path<i32>,
    Extension(auth_user): Extension<AuthUser>,
    State(pool): State<Arc<Pool>>,
) -> Result<Json<DeleteResponse>, (StatusCode, Json<serde_json::Value>)> {
    let client: Client = pool.get().await.map_err(|err| {
        eprintln!("Erro ao pegar conexão para delete: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let stmt = client.prepare(queries::DELETE_ARQUIVO).await.map_err(|err| {
        eprintln!("Erro ao preparar DELETE_ARQUIVO: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let row = client
        .query_opt(&stmt, &[&file_id, &auth_user.user_id])
        .await
        .map_err(|err| {
            eprintln!("Erro ao executar DELETE_ARQUIVO: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erro no banco" })),
            )
        })?;

    if row.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Arquivo não encontrado" })),
        ));
    }

    Ok(Json(DeleteResponse {
        message: "Arquivo excluído",
    }))
}

