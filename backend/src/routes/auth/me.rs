use axum::{
    extract::{Extension, State},
    http::StatusCode,
    Json,
};
use deadpool_postgres::Pool;
use serde::Serialize;
use std::sync::Arc;

use crate::middleware::jwt::AuthUser;

#[derive(Serialize)]
pub struct UserResponse {
    pub id: i32,
    pub nome: String,
    pub email: String,
}

pub async fn me(
    Extension(auth_user): Extension<AuthUser>,
    State(pool): State<Arc<Pool>>,
) -> Result<Json<UserResponse>, (StatusCode, Json<serde_json::Value>)> {
    let client = pool.get().await.map_err(|err| {
        eprintln!("Erro ao pegar conexão para buscar usuário: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let row = client
        .query_opt(
            "SELECT id, nome, email FROM usuarios WHERE id = $1",
            &[&auth_user.user_id],
        )
        .await
        .map_err(|err| {
            eprintln!("Erro ao buscar usuário: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erro ao buscar usuário" })),
            )
        })?;

    match row {
        Some(r) => {
            Ok(Json(UserResponse {
                id: r.get("id"),
                nome: r.get("nome"),
                email: r.get("email"),
            }))
        }
        None => Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Usuário não encontrado" })),
        )),
    }
}

