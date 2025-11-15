// src/routes/shared/models.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Compartilhamento {
    pub id: i32,
    pub arquivo_id: i32,
    pub arquivo_nome: String,
    pub sender_id: i32,
    pub sender_nome: String,
    pub receiver_id: i32,
    pub sender_email: String,
    pub receiver_email: String,
    pub chave_encrypted: String,
    pub signature: String,
    pub status: String,
    pub criado_em: DateTime<Utc>,
}
