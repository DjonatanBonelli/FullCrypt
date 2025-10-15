use axum::{response::IntoResponse, Json};
use serde_json::json;
use crate::auth::verify_jwt; 

pub async fn validate_token(Json(payload): Json<serde_json::Value>) -> impl IntoResponse {
    let token = payload["token"].as_str().unwrap_or_default();
    match verify_jwt(token) {
        Ok(_) => Json(json!({ "valid": true })),
        Err(_) => Json(json!({ "valid": false })),
    }
}
