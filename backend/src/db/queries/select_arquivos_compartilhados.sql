SELECT a.*
FROM arquivos a
JOIN compartilhamentos c ON a.id = c.arquivo_id
WHERE c.receiver_id = $USER_ID AND c.status = 'aceito';