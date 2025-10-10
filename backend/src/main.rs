use axum::{routing::{get, post}, Router};
use axum::middleware::from_fn;
use std::sync::Arc;
mod routes;
mod pools;
mod db;
mod middleware;

use middleware::jwt::require_auth;

#[tokio::main]
async fn main() {
    let pool = Arc::new(pools::postgres::create_pool());

    let public_routes = Router::new()
        .route("/api/register", post(routes::auth::register::register))
        .route("/api/login", post(routes::auth::login::login));

    let private_routes = Router::new()
        .route("/api/upload", post(routes::cloud::upload::upload))
        .route("/api/archives", get(routes::cloud::archives::archives))
        .route("/api/download/:file_id", get(routes::download_file::download::download));
        //.layer(from_fn(require_auth)); 

    let app = public_routes
        .merge(private_routes)
        .with_state(pool.clone());

    println!("🚀 Backend rodando em http://127.0.0.1:3001");

    axum::Server::bind(&"0.0.0.0:3001".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
