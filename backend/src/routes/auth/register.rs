use axum::{
    extract::{State},
    http::StatusCode,
    response::IntoResponse,
    Json as AxumJson,
};
use std::sync::Arc;
use deadpool_postgres::{Pool, Client};
use serde_json::json;
use tokio_postgres::types::ToSql;

use crate::{
    db::queries,
    routes::auth::auth::create_jwt, 
};

#[derive(serde::Deserialize)]
pub struct RegisterInput {
    pub nome: String,
    pub email: String,
    pub senha: String,
    pub pk_kyber: String,
    pub pk_dilithium: String,
}

pub async fn register(
    State(pool): State<Arc<Pool>>,
    AxumJson(input): AxumJson<RegisterInput>,
) -> impl IntoResponse {
    // pega client do pool
    let client: Client = match pool.get().await {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Erro ao pegar client do pool: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({ "error": "Erro no banco" })),
            );
        }
    };

    // prepara e executa a query
    let stmt = match client.prepare(queries::REGISTER_USER).await {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Erro ao preparar query: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({ "error": "Erro no banco" })),
            );
        }
    };

    let row = match client
        .query_one(
            &stmt,
            &[&input.nome as &(dyn ToSql + Sync), &input.email, &input.senha, &input.pk_kyber, &input.pk_dilithium],
        )
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Erro ao executar query: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({ "error": "Erro no banco" })),
            );
        }
    };

    // id vindo da query
    let user_id: i32 = row.get("id");

    // cria JWT
    let token = create_jwt(user_id);

    (
        StatusCode::OK,
        AxumJson(json!({
            "token": token,
            "user_id": user_id
        })),
    )
}
