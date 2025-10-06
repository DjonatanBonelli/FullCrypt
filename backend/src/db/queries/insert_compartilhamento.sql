INSERT INTO compartilhamentos (arquivo_id, sender_id, receiver_id, chave_encrypted)
VALUES ($1, $2, $3, $4)
RETURNING id