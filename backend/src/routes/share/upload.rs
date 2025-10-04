use axum::{
    http::StatusCode,
    response::IntoResponse,
    extract::{State, Multipart},
};
use std::sync::Arc;
use deadpool_postgres::Pool;

pub async fn upload(
    State(pool): State<Arc<Pool>>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let client = match pool.get().await {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Erro ao pegar conexão do pool: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco");
        }
    };

    // usuário fixo por enquanto
    let usuario_id = 3;

    // Campos recebidos do client
    let mut nome_arquivo: Option<String> = None;
    let mut conteudo: Option<Vec<u8>> = None;
    let mut nonce_file: Option<Vec<u8>> = None;
    let mut dek_enc: Option<Vec<u8>> = None;
    let mut nonce_dek: Option<Vec<u8>> = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or("").to_string();
        let data = field.bytes().await.unwrap().to_vec();

        match name.as_str() {
            "file" => conteudo = Some(data),
            "nome_arquivo" => nome_arquivo = Some(String::from_utf8_lossy(&data).to_string()),
            "nonce_file" => {
                let decoded = base64::decode(&data).unwrap_or_default();
                nonce_file = Some(decoded);
            }
            "dek_enc" => {
                let decoded = base64::decode(&data).unwrap_or_default();
                dek_enc = Some(decoded);
            }
            "nonce_dek" => {
                let decoded = base64::decode(&data).unwrap_or_default();
                nonce_dek = Some(decoded);
            }
            _ => {}
        }
    }

    if conteudo.is_none()
        || nome_arquivo.is_none()
        || nonce_file.is_none()
        || dek_enc.is_none()
        || nonce_dek.is_none()
    {
        return (StatusCode::BAD_REQUEST, "Campos ausentes");
    }

    // 1. Inserir na tabela arquivos
    let stmt_arquivo = client
        .prepare("INSERT INTO arquivos (usuario_id, nome_arquivo, conteudo, nonce)
                  VALUES ($1, $2, $3, $4) RETURNING id")
        .await
        .unwrap();

    let row = client
        .query_one(
            &stmt_arquivo,
            &[
                &usuario_id,
                &nome_arquivo.unwrap(),
                &conteudo.unwrap(),
                &nonce_file.unwrap(),
            ],
        )
        .await
        .unwrap();

    let arquivo_id: i32 = row.get("id");

    // 2. Inserir na tabela chaves
    let stmt_chave = client
        .prepare("INSERT INTO chaves (usuario_id, arquivo_id, chave, nonce)
                  VALUES ($1, $2, $3, $4)")
        .await
        .unwrap();

    if let Err(e) = client
        .execute(
            &stmt_chave,
            &[
                &usuario_id,
                &arquivo_id,
                &dek_enc.unwrap(),
                &nonce_dek.unwrap(),
            ],
        )
        .await
    {
        eprintln!("Erro ao salvar chave: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, "Erro ao salvar chave");
    }

    (StatusCode::OK, "Arquivo e chave salvos!")
}
