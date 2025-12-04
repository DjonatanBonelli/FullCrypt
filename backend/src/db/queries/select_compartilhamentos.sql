SELECT 
        c.id,
        c.arquivo_id,
        a.nome_arquivo,
        c.sender_id,
        u1.nome AS sender_nome,
        u1.email AS sender_email,
        u2.email AS receiver_email,
        c.receiver_id,
        c.chave_encrypted,
        c.signature,
        c.status,
        c.criado_em
    FROM compartilhamentos c
    JOIN arquivos a ON c.arquivo_id = a.id
    JOIN usuarios u1 ON c.sender_id = u1.id
    JOIN usuarios u2 ON c.receiver_id = u2.id 
    WHERE c.receiver_id = $1