DELETE FROM arquivos
WHERE id = $1
  AND usuario_id = $2
RETURNING id;

