use axum::{
    extract::{State, Json},
    http::StatusCode,
    response::IntoResponse,
};
use std::sync::Arc;
use deadpool_postgres::Pool;
use serde_json::Value;

use crate::db::queries;

#[derive(serde::Deserialize)]
pub struct RegisterInput {
    pub nome: String,
    pub email: String,
    pub senha: String,
}

pub async fn register(
    Json(input): Json<RegisterInput>,
    State(pool): State<Arc<Pool>>,
) -> impl IntoResponse {

    let client: Client = pool.get().await.map_err(|e| {
        eprintln!("Erro ao pegar client do pool: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco")
    })?;

    // executa insert e retorna o id e criado_em
    let stmt = client
        .prepare(queries::REGISTER_USER)
        .await
        .map_err(|e| {
            eprintln!("Erro ao preparar query: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco")
        })?;

    let row = client
        .query_one(&stmt, &[&input.nome as &(dyn ToSql + Sync), &input.email, &input.senha])
        .await
        .map_err(|e| {
            eprintln!("Erro ao executar query: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco")
        })?;

        match insert_user(&pool, input).await {
                Ok(user_id) => {
                    // cria JWT (assumindo função create_jwt)
                    let token = create_jwt(user_id);
                    (StatusCode::OK, Json(serde_json::json!({ "token": token })))
                }
                Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Erro no banco" }))),
            }
}
