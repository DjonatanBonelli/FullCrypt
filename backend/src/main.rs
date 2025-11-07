use axum::{
    Router,
    routing::{get, post},
    middleware::from_fn_with_state,
};
use axum::extract::{State, Extension, Multipart};
use std::{net::SocketAddr, sync::Arc, time::Duration};
use deadpool_postgres::Pool;
use tower_http::cors::{CorsLayer};
use http::{HeaderValue, Method};

mod routes;
mod pools;
mod db;
mod middleware;
use crate::routes::shared::handlers as shared_handlers;
use crate::routes::auth::auth_user::AuthUser;

use middleware::jwt::require_auth;

#[tokio::main]
async fn main() {
    // Cria pool de conexão
    let pool: Arc<Pool> = Arc::new(pools::postgres::create_pool());

    // CORS Layer 
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap()) // origem do Next
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([
            http::header::CONTENT_TYPE,
            http::header::AUTHORIZATION,
        ])
        .allow_credentials(true) // necessário para cookies HttpOnly
        .max_age(Duration::from_secs(3600));

    // Rotas públicas (sem autenticação)
    let public_routes = Router::new()
        .route("/api/register", post(routes::auth::register::register))
        .route("/api/login", post(routes::auth::login::login));

    // Rotas privadas (com autenticação JWT)
    let private_routes = Router::new()
        .route("/api/upload", post(routes::cloud::upload::upload))
        .route("/api/archives", get(routes::cloud::archives::archives))
        .route(
            "/api/download/:file_id",
            get(routes::download_file::download::download),
        )
        .layer(from_fn_with_state(pool.clone(), require_auth));

    let shared_routes = Router::new()
        .route("/api/shared", get(shared_handlers::listar))
        .route("/api/shared/:id/aceitar", post(shared_handlers::aceitar))
        .route("/api/shared/:id/recusar", post(shared_handlers::recusar))
        .route("/api/share", post(routes::shared::share::compartilhar))
        .route("/api/users/pk", get(routes::users::get_pk_kyber::get_user_pk))
        .layer(from_fn_with_state(pool.clone(), require_auth));

    let private_routes = private_routes.merge(shared_routes);

    // Combina rotas públicas e privadas, adiciona state e o layer de CORS
    let app = public_routes
        .merge(private_routes)
        .with_state(pool.clone())
        .layer(cors); // ✅ adicionado aqui

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 Backend rodando em http://{}", addr);

    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
        .await
        .unwrap();
}
