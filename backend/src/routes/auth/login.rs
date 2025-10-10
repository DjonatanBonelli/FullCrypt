use axum::{
    extract::{State},
    http::StatusCode,
    response::IntoResponse,
    Json as AxumJson,
};
use std::sync::Arc;
use deadpool_postgres::{Pool, Client};
use serde::Deserialize;
use serde_json::json;
use tokio_postgres::types::ToSql;

use crate::{db::queries, routes::auth::auth::create_jwt};

#[derive(Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub senha: String,
}

pub async fn login(
    State(pool): State<Arc<Pool>>,
    AxumJson(input): AxumJson<LoginInput>,
) -> impl IntoResponse {
    let client: Client = match pool.get().await {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, AxumJson(json!({"error": "Erro no banco"}))),
    };

    let stmt = match client.prepare(queries::GET_USER_BY_EMAIL).await {
        Ok(s) => s,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, AxumJson(json!({"error": "Erro no banco"}))),
    };

    // sua query deve retornar o id se o email/senha baterem
    match client
        .query_opt(&stmt, &[&input.email as &(dyn ToSql + Sync), &input.senha])
        .await
    {
        Ok(Some(row)) => {
            let user_id: i32 = row.get("id");
            let token = create_jwt(user_id);
            (StatusCode::OK, AxumJson(json!({ "token": token, "user_id": user_id })))
        }
        Ok(None) => (StatusCode::UNAUTHORIZED, AxumJson(json!({"error": "Credenciais inválidas"}))),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, AxumJson(json!({"error": "Erro ao executar query"}))),
    }
}
