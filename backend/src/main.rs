use axum::{Router, routing::{get, post}, middleware::from_fn_with_state, body::Body};
use std::sync::Arc;
use deadpool_postgres::Pool;
mod routes;
mod pools;
mod db;
mod middleware;
use middleware::jwt::require_auth;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Cria pool de conexão
    let pool: Arc<Pool> = Arc::new(pools::postgres::create_pool());

    // Rotas públicas (sem autenticação)
    let public_routes = Router::new()
        .route("/api/register", post(routes::auth::register::register))
        .route("/api/login", post(routes::auth::login::login));

    // Rotas privadas (com autenticação JWT)
    let private_routes = Router::new()
        .route("/api/upload", post(routes::cloud::upload::upload))
        .route("/api/archives", get(routes::cloud::archives::archives))
        .route("/api/download/:file_id", get(routes::download_file::download::download))
        .layer(from_fn_with_state(pool.clone(), require_auth));

    // Combina rotas públicas e privadas e adiciona state
    let app = public_routes.merge(private_routes).with_state(pool.clone());

     let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("🚀 Backend rodando em http://{}", addr);

    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
    .await
    .unwrap();
}
