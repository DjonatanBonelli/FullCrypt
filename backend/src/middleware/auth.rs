use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::{request::Parts, StatusCode},
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::Deserialize;
use std::sync::Arc;
use deadpool_postgres::Pool;

#[derive(Debug, Deserialize)]
pub struct Claims {
    pub sub: i32, // ID do usuário
    pub exp: usize,
}

// Extractor customizado que valida JWT
pub struct AuthenticatedUser(pub i32);

#[async_trait]
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let headers = parts.headers.clone();
        let token = headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .ok_or((StatusCode::UNAUTHORIZED, "Token ausente"))?;

        let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".into());

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_ref()),
            &Validation::new(Algorithm::HS256),
        ).map_err(|_| (StatusCode::UNAUTHORIZED, "Token inválido"))?;

        Ok(AuthenticatedUser(token_data.claims.sub))
    }
}
