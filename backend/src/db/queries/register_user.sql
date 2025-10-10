INSERT INTO usuarios (nome, email, senha)
VALUES ($1, $2, $3)
RETURNING id