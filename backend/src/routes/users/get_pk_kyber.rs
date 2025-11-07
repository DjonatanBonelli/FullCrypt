use axum::{
    extract::{State, Query},
    http::StatusCode,
    response::IntoResponse,
    Json as AxumJson,
};
use std::sync::Arc;
use deadpool_postgres::{Pool, Client};
use serde_json::json;
use tokio_postgres::types::ToSql;

use crate::db::queries;

#[derive(serde::Deserialize)]
pub struct PkQuery {
    pub email: String,
}

pub async fn get_user_pk(
    State(pool): State<Arc<Pool>>,
    Query(params): Query<PkQuery>,
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

    // prepara query
    let stmt = match client.prepare(queries::GET_USER_PK).await {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Erro ao preparar query: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({ "error": "Erro no banco" })),
            );
        } 
    };

    // executa query
    let row = match client.query_opt(&stmt, &[&params.email as &(dyn ToSql + Sync)]).await {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Erro ao executar query: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                AxumJson(json!({ "error": "Erro no banco" })),
            );
        }
    };

    if let Some(r) = row {
        let pk_kyber: String = r.get("pk_kyber");
        let pk_dilithium: String = r.get("pk_dilithium");

        (
            StatusCode::OK,
            AxumJson(json!({ "pk_kyber": pk_kyber })),
        )
    } else {
        (
            StatusCode::UNPROCESSABLE_ENTITY,
            AxumJson(json!({ "error": "Usuário não encontrado" })),
        )
    }
    }
