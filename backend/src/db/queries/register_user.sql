INSERT INTO usuarios (nome, email, senha, pk_kyber, pk_dilithium)
VALUES ($1, $2, $3, $4, $5)
RETURNING id