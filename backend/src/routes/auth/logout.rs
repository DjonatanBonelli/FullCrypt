use axum::{
    http::{header, StatusCode},
    response::Response,
    body::Body,
    Json,
};
use serde_json::json;

pub async fn logout() -> Response<Body> {
    // Remove o cookie JWT definindo Max-Age=0
    Response::builder()
        .status(StatusCode::OK)
        .header(
            header::SET_COOKIE,
            "jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        )
        .body(Body::from(json!({"message": "Logout realizado com sucesso"}).to_string()))
        .unwrap()
}

