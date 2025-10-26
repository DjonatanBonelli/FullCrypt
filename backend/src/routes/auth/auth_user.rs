use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
    http::StatusCode,
};

use super::auth::verify_jwt;

#[derive(Clone)]
pub struct AuthUser(pub i32);

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        
        // 1️⃣ pega o header "cookie" como string
        let cookie_header = parts
            .headers
            .get("cookie")
            .and_then(|h| h.to_str().ok());

        let token = match cookie_header {
            Some(header) => {
                header
                    .split(';')
                    .find_map(|c| {
                        let c = c.trim();
                        if c.starts_with("jwt=") {
                            Some(c.trim_start_matches("jwt=").to_string())
                        } else {
                            None
                        }
                    })
            }
            None => None,
        };

        let token = token.ok_or(StatusCode::UNAUTHORIZED)?;
            
        // 3️⃣ verifica o JWT
        let claims = verify_jwt(&token).map_err(|_| StatusCode::UNAUTHORIZED)?;

        Ok(AuthUser(claims.sub))
    }
}
