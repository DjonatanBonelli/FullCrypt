use std::sync::Arc;

use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    Json,
};
use deadpool_postgres::{Client, Pool};
use serde::{Deserialize, Serialize};

use crate::{db::queries, middleware::jwt::AuthUser};

#[derive(Deserialize)]
pub struct RenamePayload {
    pub nome: String,
}

#[derive(Serialize)]
pub struct RenameResponse {
    pub id: i32,
    pub nome: String,
}

pub async fn rename_file(
    Path(file_id): Path<i32>,
    Extension(auth_user): Extension<AuthUser>,
    State(pool): State<Arc<Pool>>,
    Json(payload): Json<RenamePayload>,
) -> Result<Json<RenameResponse>, (StatusCode, Json<serde_json::Value>)> {
    let novo_nome = payload.nome.trim();

    if novo_nome.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Nome inválido" })),
        ));
    }

    let client: Client = pool.get().await.map_err(|err| {
        eprintln!("Erro ao pegar conexão para rename: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let stmt = client
        .prepare(queries::UPDATE_ARQUIVO_NOME)
        .await
        .map_err(|err| {
            eprintln!("Erro ao preparar UPDATE_ARQUIVO_NOME: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erro no banco" })),
            )
        })?;

    let row = client
        .query_opt(&stmt, &[&novo_nome, &file_id, &auth_user.user_id])
        .await
        .map_err(|err| {
            eprintln!("Erro ao atualizar nome do arquivo: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erro no banco" })),
            )
        })?;

    let row = match row {
        Some(r) => r,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(serde_json::json!({ "error": "Arquivo não encontrado" })),
            ))
        }
    };

    Ok(Json(RenameResponse {
        id: row.get("id"),
        nome: row.get("nome_arquivo"),
    }))
}

