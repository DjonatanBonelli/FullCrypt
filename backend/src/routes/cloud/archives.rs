use axum::{extract::State, response::Json, http::StatusCode};
use deadpool_postgres::Pool;
use serde::Serialize;
use std::sync::Arc;

use crate::db::queries;

#[derive(Serialize)]
pub struct Archives {
    id: i32,
    nome_arquivo: String,
    criado_em: chrono::DateTime<chrono::Utc>,
}

pub async fn archives(
    State(pool): State<Arc<Pool>>,
) -> Result<Json<Vec<Archives>>, (StatusCode, String)> {
    let client = pool.get().await.map_err(|e| {
        eprintln!("Erro ao pegar conexão: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco".to_string())
    })?;

    let stmt = client
        .prepare(queries::SELECT_ARQUIVOS)
        .await
        .map_err(|e| {
            eprintln!("Erro no prepare: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco".to_string())
        })?;

    let rows = client.query(&stmt, &[]).await.map_err(|e| {
        eprintln!("Erro no query: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco".to_string())
    })?;

    let arquivos = rows
        .into_iter()
        .map(|row| Archives {
            id: row.get("id"),
            nome_arquivo: row.get("nome_arquivo"),
            criado_em: row.get("criado_em"),
        })
        .collect();

    Ok(Json(arquivos))
}
