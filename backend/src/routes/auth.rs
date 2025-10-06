use jsonwebtoken::{encode, Header, EncodingKey};
use serde::Serialize;
use chrono::Utc;

#[derive(Serialize)]
struct Claims {
    sub: i32,
    exp: usize,
}

pub fn create_jwt(user_id: i32) -> String {
    let expiration = Utc::now() + chrono::Duration::hours(24);
    let claims = Claims { sub: user_id, exp: expiration.timestamp() as usize };
    encode(&Header::default(), &claims, &EncodingKey::from_secret("segredo_super".as_ref())).unwrap()
}
