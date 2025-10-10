use jsonwebtoken::{encode, decode, Header, EncodingKey, DecodingKey, Validation, Algorithm};
use serde::{Serialize, Deserialize};
use chrono::Utc;

#[derive(Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: i32,   // ID do usuário
    pub exp: usize, // timestamp de expiração
}

pub fn create_jwt(user_id: i32) -> String {
    let expiration = Utc::now() + chrono::Duration::hours(24);

    let claims = Claims {
        sub: user_id,
        exp: expiration.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("segredo_super".as_ref()),        // mudar pra .env: let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "segredo_super".to_string());

    )
    .expect("Falha ao criar token JWT")
}

pub fn verify_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let decoded = decode::<Claims>(
        token,
        &DecodingKey::from_secret("segredo_super".as_ref()),
        &Validation::new(Algorithm::HS256),
    )?;
    Ok(decoded.claims)
}
