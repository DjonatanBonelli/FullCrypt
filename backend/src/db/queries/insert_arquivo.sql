INSERT INTO arquivos (usuario_id, nome_arquivo, conteudo, nonce, tamanho)
VALUES ($1, $2, $3, $4, $5)
RETURNING id