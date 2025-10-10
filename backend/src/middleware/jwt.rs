use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::Deserialize;

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: i32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Claims {
    pub sub: i32,
    pub exp: usize,
}

pub async fn require_auth<B>(
    mut req: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => h.trim_start_matches("Bearer ").to_string(),
        _ => return Err(StatusCode::UNAUTHORIZED),
    };

    let decoded = match decode::<Claims>(
        &token,
        &DecodingKey::from_secret("segredo_super".as_ref()),
        &Validation::new(Algorithm::HS256),
    ) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Erro ao decodificar token: {:?}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    req.extensions_mut().insert(AuthUser {
        user_id: decoded.claims.sub,
    });

    Ok(next.run(req).await)
}
