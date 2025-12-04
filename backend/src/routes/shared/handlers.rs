use axum::{
    extract::{Extension, Path, State},
    Json,
    http::StatusCode,
    response::IntoResponse,
};
use deadpool_postgres::Pool;
use std::sync::Arc;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use serde::Deserialize;
use crate::middleware::jwt::AuthUser;
use crate::routes::shared::models::Compartilhamento;
use crate::db::queries;

#[derive(Deserialize)]
pub struct ShareRequest {
    pub email: String,
    pub enveloped_key: String, 
}

pub async fn listar(
    State(pool): State<Arc<Pool>>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Compartilhamento>>, (StatusCode, Json<serde_json::Value>)> {
    let client = pool.get().await.map_err(|err| {
        eprintln!("Erro ao pegar conexão para listar compartilhamentos: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Erro no banco" })),
        )
    })?;

    let rows = client
        .query(
            queries::SELECT_COMPARTILHAMENTOS,
            &[&auth_user.user_id],
        )
        .await
        .map_err(|err| {
            eprintln!("Erro ao buscar compartilhamentos: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Erro ao buscar compartilhamentos" })),
            )
        })?;

    let compartilhamentos: Vec<Compartilhamento> = rows.iter().map(|r| Compartilhamento {
        id: r.get("id"),
        arquivo_id: r.get("arquivo_id"),
        arquivo_nome: r.get("nome_arquivo"),
        sender_id: r.get("sender_id"),
        sender_nome: r.get("sender_nome"),
        receiver_id: r.get("receiver_id"),
        sender_email: r.get("sender_email"),
        receiver_email: r.get("receiver_email"),
        chave_encrypted: r.get::<_, String>("chave_encrypted"),
        signature: r.get::<_, String>("signature"),
        status: r.get("status"),
        criado_em: r.get("criado_em"),
    }).collect();
    Ok(Json(compartilhamentos))
}

pub async fn aceitar(
    State(pool): State<Arc<Pool>>,
    Path(id): Path<i32>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows_updated = client
        .execute(
            queries::ACEITAR_COMPARTILHAMENTO,
            &[&id, &auth_user.user_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if rows_updated == 1 {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn recusar(
    State(pool): State<Arc<Pool>>,
    Path(id): Path<i32>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let client = pool.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let rows_updated = client
        .execute(
            queries::RECUSAR_COMPARTILHAMENTO,
            &[&id, &auth_user.user_id],
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if rows_updated == 1 {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
