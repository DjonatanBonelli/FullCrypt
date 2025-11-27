UPDATE arquivos
SET nome_arquivo = $1
WHERE id = $2
  AND usuario_id = $3
RETURNING id, nome_arquivo;

