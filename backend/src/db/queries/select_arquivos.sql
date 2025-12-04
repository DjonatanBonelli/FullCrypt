SELECT id, nome_arquivo, criado_em, tamanho 
FROM arquivos 
WHERE usuario_id = $1
ORDER BY criado_em DESC