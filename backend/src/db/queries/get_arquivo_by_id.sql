SELECT nome_arquivo, conteudo, nonce
FROM arquivos
WHERE id = $1