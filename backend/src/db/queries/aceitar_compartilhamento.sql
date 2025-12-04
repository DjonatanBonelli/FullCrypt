UPDATE compartilhamentos 
    SET status = 'aceito' 
    WHERE id = $1 AND receiver_id = $2