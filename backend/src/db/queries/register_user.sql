INSERT INTO usuarios (nome, email, senha, pk_kyber)
VALUES ($1, $2, $3, $4)
RETURNING id