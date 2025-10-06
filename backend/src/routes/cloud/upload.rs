use axum::{
    http::StatusCode,
    response::IntoResponse,
    extract::{State, Multipart},
};
use std::sync::Arc;
use deadpool_postgres::Pool;

use crate::db::queries;

pub async fn upload(
    State(pool): State<Arc<Pool>>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let client = match pool.get().await {
        Ok(c) => c,
        Err(e) => {
            eprintln!("❌ Erro ao pegar conexão do pool: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco");
        }
    };

    let usuario_id = 3;

    let mut nome_arquivo: Option<String> = None;
    let mut conteudo: Option<Vec<u8>> = None;
    let mut nonce_file: Option<Vec<u8>> = None;

    while let Some(field) = match multipart.next_field().await {
        Ok(f) => f,
        Err(e) => {
            eprintln!("❌ Erro ao ler multipart field: {:?}", e);
            return (StatusCode::BAD_REQUEST, "Erro no multipart");
        }
    } {
        let name = field.name().unwrap_or("").to_string();
        let data = match field.bytes().await {
            Ok(b) => b.to_vec(),
            Err(e) => {
                eprintln!("❌ Erro ao ler bytes do field {}: {:?}", name, e);
                return (StatusCode::BAD_REQUEST, "Erro ao ler campo");
            }
        };

        match name.as_str() {
            "file" => conteudo = Some(data),
            "nome_arquivo" => nome_arquivo = Some(String::from_utf8_lossy(&data).to_string()),
            "nonce_file" => {
                match base64::decode(&data) {
                    Ok(decoded) => nonce_file = Some(decoded),
                    Err(e) => {
                        eprintln!("❌ Erro ao decodificar nonce_file: {:?}", e);
                        return (StatusCode::BAD_REQUEST, "Nonce inválido");
                    }
                }
            }
            _ => {}
        }
    }

    if conteudo.is_none() || nome_arquivo.is_none() || nonce_file.is_none() {
        eprintln!("❌ Campos ausentes: nome_arquivo={:?}, conteudo={:?}, nonce_file={:?}", nome_arquivo, conteudo.is_some(), nonce_file.is_some());
        return (StatusCode::BAD_REQUEST, "Campos ausentes");
    }

    let stmt = match client
        .prepare(queries::INSERT_ARQUIVO)
        .await
    {
        Ok(s) => s,
        Err(e) => {
            eprintln!("❌ Erro ao preparar statement: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no prepare");
        }
    };

    let result = client
        .query_one(
            &stmt,
            &[
                &usuario_id,
                &nome_arquivo.unwrap(),
                &conteudo.unwrap(),
                &nonce_file.unwrap(),
            ],
        )
        .await;

    match result {
        Ok(row) => {
            let arquivo_id: i32 = row.get("id");
            eprintln!("✅ Arquivo inserido com id {}", arquivo_id);
            (StatusCode::OK, "Arquivo salvos!")
        }
        Err(e) => {
            eprintln!("❌ Erro ao executar query: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Erro ao salvar no banco")
        }
    }
}
