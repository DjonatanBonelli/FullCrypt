use axum::{
    extract::{Path, State},
    http::{Response, StatusCode, header},
};
use axum::body::Body;
use std::sync::Arc;
use deadpool_postgres::Pool;
use tokio_postgres::types::ToSql;

pub async fn download(
    Path(file_id): Path<i32>,
    State(pool): State<Arc<Pool>>,
) -> Response<Body> {
    // Pegar conexão do pool
    let client = match pool.get().await {
        Ok(c) => c,
        Err(e) => {
            eprintln!("❌ Erro ao pegar conexão do pool: {:?}", e);
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from("Erro no banco"))
                .unwrap();
        }
    };

    // Buscar arquivo no banco
    let row = match client
        .query_opt(
            "SELECT nome_arquivo, conteudo FROM arquivos WHERE id = $1",
            &[&file_id as &(dyn ToSql + Sync)],
        )
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("❌ Erro ao executar query: {:?}", e);
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from("Erro no banco"))
                .unwrap();
        }
    };

    // Se o arquivo existir
    if let Some(row) = row {
        let nome: String = row.get("nome_arquivo");
        let conteudo: Vec<u8> = row.get("conteudo");

        Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "application/octet-stream")
            .header(
                header::CONTENT_DISPOSITION,
                format!("attachment; filename=\"{}\"", nome),
            )
            .body(Body::from(conteudo))
            .unwrap()
    } else {
        // Arquivo não encontrado
        Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Body::from("Arquivo não encontrado"))
            .unwrap()
    }
}
