use crate::db::queries;
use axum::http::StatusCode;
use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use argon2::verify_encoded;

#[derive(Deserialize)]
struct LoginInput {
    email: String,
    senha: String,
}

pub async fn login(
    Json(input): Json<LoginInput>,
    Extension(pool): Extension<Arc<PgPool>>,
) -> Result<axum::Json<i32>, (StatusCode, &'static str)> {

    let row = sqlx::query_as::<_, (i32, String)>(queries::GET_USER_BY_EMAIL)
        .bind(&input.email)
        .fetch_optional(&pool)
        .await
        .map_err(|e| {
            eprintln!("Erro ao buscar usuário: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Erro no banco")
        })?;

    let (user_id, senha_hash) = match row {
        Some(r) => r,
        None => return Err((StatusCode::UNAUTHORIZED, "Usuário não encontrado")),
    };

    if !verify_encoded(&senha_hash, input.senha.as_bytes()).unwrap_or(false) {
        return Err((StatusCode::UNAUTHORIZED, "Senha incorreta"));
    }

    let token = create_jwt(user_id);    // cria JWT
    Ok(Json(serde_json::json!({ "token": token })))

    // atualiza último login
    sqlx::query(queries::UPDATE_LAST_LOGIN)
        .bind(user_id)
        .execute(&pool)
        .await
        .ok();

    Ok(Json(user_id))
}
