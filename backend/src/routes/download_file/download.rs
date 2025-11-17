use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct FileResponse {
    encrypted: String,
    nonce: String,
    nome_arquivo: String,
}
use std::sync::Arc;
use deadpool_postgres::Pool;

pub async fn download(
    Path(file_id): Path<i32>,
    State(pool): State<Arc<Pool>>,
) -> Result<Json<FileResponse>, StatusCode> {

    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let row = client
        .query_opt(
            "SELECT nome_arquivo, nonce, conteudo FROM arquivos WHERE id = $1",
            &[&file_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if let Some(row) = row {
        let nome: String = row.get("nome_arquivo");
        let conteudo: Vec<u8> = row.get("conteudo");
        let nonce: Vec<u8> = row.get("nonce");

        Ok(Json(FileResponse {
            encrypted: base64::encode(conteudo),
            nonce: base64::encode(nonce),
            nome_arquivo: nome,
        }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
