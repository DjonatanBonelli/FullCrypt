use axum::{
    extract::{Multipart, State, Extension},
    http::HeaderMap,
    response::IntoResponse,
};
use axum::http::StatusCode;
use std::sync::Arc;
use deadpool_postgres::Pool;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use crate::db::queries;
use crate::middleware::jwt::AuthUser;

#[axum::debug_handler]
pub async fn upload(
    State(pool): State<Arc<Pool>>,
    Extension(auth_user): Extension<AuthUser>,
    _headers: HeaderMap, 
    mut multipart: Multipart, 
) -> impl IntoResponse {
    let client = match pool.get().await {
        Ok(c) => c,
        Err(e) => {
            eprintln!("❌ Erro ao pegar conexão do pool: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco".to_string());
        }
    };

    let usuario_id = auth_user.user_id;

    let mut nome_arquivo: Option<String> = None;
    let mut conteudo: Option<Vec<u8>> = None;
    let mut nonce_file: Option<Vec<u8>> = None;
    let mut tamanho_arquivo: Option<i64> = None;

    while let Some(field) = match multipart.next_field().await {
        Ok(f) => f,
        Err(e) => {
            eprintln!("❌ Erro ao ler multipart field: {:?}", e);
            return (StatusCode::BAD_REQUEST, "Erro no multipart".to_string());
        }
    } {
        let name = field.name().unwrap_or("").to_string();
        let data = match field.bytes().await {
            Ok(b) => b.to_vec(),
            Err(e) => {
                eprintln!("❌ Erro ao ler bytes do field {}: {:?}", name, e);
                return (StatusCode::BAD_REQUEST, "Erro ao ler campo".to_string());
            }
        };

        match name.as_str() {
            "file" => conteudo = Some(data),
            "nome_arquivo" => nome_arquivo = Some(String::from_utf8_lossy(&data).to_string()),
            "nonce_file" => match STANDARD.decode(&data) {
                Ok(decoded) => nonce_file = Some(decoded),
                Err(e) => {
                    eprintln!("❌ Erro ao decodificar nonce_file: {:?}", e);
                    return (StatusCode::BAD_REQUEST, "Nonce inválido".to_string());
                }
            },
            "tamanho_arquivo" => {
                let parsed = String::from_utf8_lossy(&data).to_string();
                match parsed.parse::<i64>() {
                    Ok(v) => tamanho_arquivo = Some(v),
                    Err(_) => {
                        return (StatusCode::BAD_REQUEST, "Tamanho inválido".to_string());
                    }
                }
            }
            _ => {}
        }
    }

    if conteudo.is_none() || nome_arquivo.is_none() || nonce_file.is_none() || tamanho_arquivo.is_none() {
        return (StatusCode::BAD_REQUEST, "Campos ausentes".to_string());
    }

    let stmt = match client.prepare(queries::INSERT_ARQUIVO).await {
        Ok(s) => s,
        Err(e) => {
            eprintln!("❌ Erro ao preparar statement: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no prepare".to_string());
        }
    };

    match client
        .query_one(
            &stmt,
            &[
                &usuario_id,
                &nome_arquivo.as_ref().unwrap(),
                &conteudo.as_ref().unwrap(),
                &nonce_file.as_ref().unwrap(),
                &tamanho_arquivo.as_ref().unwrap(),
            ],
        )
        .await
    {
        Ok(row) => {
            let arquivo_id: i32 = row.get("id");
            (StatusCode::OK, arquivo_id.to_string())
        }
        Err(e) => {
            eprintln!("❌ Erro ao executar query: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Erro ao salvar no banco".to_string())
        }
    }
}
