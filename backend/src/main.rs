use axum::{routing::{get, post}, Router};
use std::sync::Arc;
mod routes;
mod pools;
mod db;

#[tokio::main]
async fn main() {
    let pool = Arc::new(pools::postgres::create_pool());

    let app = Router::new()
        .route("/api/upload", post(routes::cloud::upload::upload))
        .route("/api/archives", get(routes::cloud::archives::archives))
        .route("/api/download/:file_id", get(routes::download_file::download::download))
        .with_state(pool.clone()); // injeta pool no estado do Axum

    println!("🚀 Backend rodando em http://127.0.0.1:3001");

    axum::Server::bind(&"0.0.0.0:3001".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
