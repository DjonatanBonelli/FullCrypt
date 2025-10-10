use axum::{
    extract::{State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use std::sync::Arc;
use deadpool_postgres::{Pool, Client};
use serde::Serialize;
use crate::db::queries;

#[derive(Serialize)]
pub struct Archive {
    pub id: i32,
    pub nome: String,
    pub caminho: String,
}

pub async fn archives(
    State(pool): State<Arc<Pool>>,
    headers: HeaderMap,
) -> impl IntoResponse {
    // pega token do header Authorization
    let token = match headers.get("Authorization") {
        Some(val) => val.to_str().unwrap_or("").trim_start_matches("Bearer ").to_string(),
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Token ausente" }))),
    };

    // decodifica o JWT para pegar user_id
    let user_id = match decode_jwt(&token) {
        Ok(id) => id,
        Err(_) => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Token inválido" }))),
    };

    let client: Client = match pool.get().await {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Erro no banco" }))),
    };

    let stmt = match client.prepare(queries::SELECT_ARQUIVOS).await {
        Ok(s) => s,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Erro no banco" }))),
    };

    let rows = match client.query(&stmt, &[&user_id]).await {
        Ok(r) => r,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Erro ao buscar arquivos" }))),
    };

    let arquivos: Vec<Archive> = rows
        .into_iter()
        .map(|r| Archive {
            id: r.get("id"),
            nome: r.get("nome"),
            caminho: r.get("caminho"),
        })
        .collect();

    (StatusCode::OK, Json(serde_json::to_value(arquivos).unwrap()))
}

// Função fictícia de decodificação de JWT
fn decode_jwt(token: &str) -> Result<i32, ()> {
    // sua lógica aqui para decodificar JWT e retornar user_id
    Ok(123) // exemplo fixo
}
