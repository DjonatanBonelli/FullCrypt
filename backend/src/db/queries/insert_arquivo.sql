INSERT INTO arquivos (usuario_id, nome_arquivo, conteudo, nonce)
VALUES ($1, $2, $3, $4)
RETURNING id