use axum::{
    async_trait,
    extract::{FromRequest, RequestParts},
    http::StatusCode,
};
use jsonwebtoken::{decode, DecodingKey, Validation};

pub struct AuthUser(pub i32);

#[async_trait]
impl<B> FromRequest<B> for AuthUser
where
    B: Send,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request(req: &mut RequestParts<B>) -> Result<Self, Self::Rejection> {
        let token = req.headers().get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .ok_or((StatusCode::UNAUTHORIZED, "Token ausente"))?;

        let decoded = decode::<Claims>(token, &DecodingKey::from_secret("segredo_super".as_ref()), &Validation::default())
            .map_err(|_| (StatusCode::UNAUTHORIZED, "Token inválido"))?;

        Ok(AuthUser(decoded.claims.sub))
    }
}
