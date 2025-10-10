SELECT id 
FROM users 
WHERE email = $1 AND senha = $2
RETURNING id