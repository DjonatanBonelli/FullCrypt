pub const GET_ARQUIVO_BY_ID: &str = r#"
    SELECT nome_arquivo, conteudo, nonce
    FROM arquivos
    WHERE id = $1
"#;

pub const INSERT_ARQUIVO: &str = r#"
    INSERT INTO arquivos (usuario_id, nome_arquivo, conteudo, nonce)
    VALUES ($1, $2, $3, $4)
    RETURNING id
"#;

pub const CREATE_COMPARTILHAMENTO: &str = r#"
    INSERT INTO compartilhamentos (arquivo_id, sender_id, receiver_id, chave_encrypted)
    VALUES ($1, $2, $3, $4)
    RETURNING id
"#;