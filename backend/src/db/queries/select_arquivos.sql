SELECT id, nome_arquivo, criado_em 
FROM arquivos 
WHERE id = $1
ORDER BY criado_em DESC