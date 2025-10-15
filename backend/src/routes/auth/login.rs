use axum::{
    extract::State,
    http::{header, StatusCode},
    response::Response,
    body::Body,
    Json,
};
use deadpool_postgres::Pool;
use std::sync::Arc;
use serde_json::json;

use super::auth::create_jwt;
use crate::db::queries;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub senha: String,
}

pub async fn login(
    State(pool): State<Arc<Pool>>,
    Json(input): Json<LoginInput>,
) -> Response<Body> {
    let client = match pool.get().await {
        Ok(c) => c,
        Err(_) => {
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(json!({"error": "Erro no banco"}).to_string()))
                .unwrap();
        }
    };

    let stmt = match client.prepare(queries::GET_USER_BY_EMAIL).await {
        Ok(s) => s,
        Err(_) => {
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(json!({"error": "Erro no banco"}).to_string()))
                .unwrap();
        }
    };

    match client
        .query_opt(&stmt, &[&input.email as &(dyn tokio_postgres::types::ToSql + Sync), &input.senha])
        .await
    {
        Ok(Some(row)) => {
            let user_id: i32 = row.get("id");
            let token = create_jwt(user_id);

            // Retorna o cookie HttpOnly + JSON mínimo
            Response::builder()
                .status(StatusCode::OK)
                .header(
                    header::SET_COOKIE,
                    format!(
                        "jwt={}; HttpOnly; Path=/; Max-Age={}; SameSite=Lax",
                        token, 24*3600
                    ),
                )
                .body(Body::from(json!({"user_id": user_id}).to_string()))
                .unwrap()
        }
        Ok(None) => {
            Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::from(json!({"error": "Credenciais inválidas"}).to_string()))
                .unwrap()
        }
        Err(_) => {
            Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(json!({"error": "Erro ao executar query"}).to_string()))
                .unwrap()
        }
    }
}
