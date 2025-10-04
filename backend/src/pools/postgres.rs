use deadpool_postgres::{Config, ManagerConfig, Pool, RecyclingMethod};
use tokio_postgres::NoTls;
use dotenvy::dotenv;
use std::env;

pub fn create_pool() -> Pool {
    dotenv().ok(); // carrega variáveis de ambiente do .env

    let mut cfg = Config::new();
    cfg.host = Some(env::var("DB_HOST").expect("DB_HOST não definido"));
    cfg.user = Some(env::var("DB_USER").expect("DB_USER não definido"));
    cfg.password = Some(env::var("DB_PASS").expect("DB_PASS não definido"));
    cfg.dbname = Some(env::var("DB_NAME").expect("DB_NAME não definido"));

    cfg.manager = Some(ManagerConfig {
        recycling_method: RecyclingMethod::Fast,
    });

    cfg.create_pool(None, NoTls).expect("erro ao criar pool")
}
