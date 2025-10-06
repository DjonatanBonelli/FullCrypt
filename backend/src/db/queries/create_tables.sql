CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    ultimo_login TIMESTAMP,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE arquivos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    conteudo BYTEA NOT NULL,
    nonce BYTEA NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compartilhamentos (
    id SERIAL PRIMARY KEY,
    arquivo_id INT NOT NULL REFERENCES arquivos(id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    chave_encrypted BYTEA NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO usuarios (id, nome, email, senha) VALUES (3, 'teste', 'teste', 'teste')