use axum::{
    extract::State,
    http::{Request, Response, StatusCode, header},
    middleware::Next,
    body::Body,
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::Deserialize;
use std::sync::Arc;
use deadpool_postgres::Pool;

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: i32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Claims {
    pub sub: i32,
    pub exp: usize,
}

pub async fn require_auth(
    State(_pool): State<Arc<Pool>>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response<Body>, Response<Body>> {
    // Pega o token diretamente do cookie HttpOnly
    let token = req
        .headers()
        .get(header::COOKIE)
        .and_then(|v| v.to_str().ok())
        .and_then(|cookies| {
            cookies.split(';').find_map(|c| {
                let c = c.trim();
                if c.starts_with("jwt=") {
                    Some(c.trim_start_matches("jwt=").to_string())
                } else {
                    None
                }
            })
        });

    let token = match token {
        Some(t) => t,
        None => {
            // Token ausente → redireciona para login
            return Err(Response::builder()
                .status(StatusCode::FOUND) // 302
                .header(header::LOCATION, "/login")
                .body(Body::empty())
                .unwrap());
        }
    };

    // Decodifica token JWT com validação de expiração explícita
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true; // Garante que a expiração seja validada
    validation.leeway = 0; // Não permite margem de tempo para tokens expirados
    
    let decoded = match decode::<Claims>(
        &token,
        &DecodingKey::from_secret("segredo_super".as_ref()),
        &validation,
    ) {
        Ok(c) => c,
        Err(e) => {
            // O decode já rejeita tokens expirados automaticamente quando validate_exp = true
            eprintln!("❌ Token inválido ou expirado: {:?}", e);
            return Err(Response::builder()
                .status(StatusCode::FOUND)
                .header(header::LOCATION, "/login")
                .body(Body::empty())
                .unwrap());
        }
    };

    // Insere usuário autenticado nas extensions da request
    req.extensions_mut().insert(AuthUser {
        user_id: decoded.claims.sub,
    });

    // Continua para o próximo middleware/handler
    Ok(next.run(req).await)
}
