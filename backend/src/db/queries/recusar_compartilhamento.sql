UPDATE compartilhamentos 
    SET status = 'recusado' 
    WHERE id = $1 AND receiver_id = $2