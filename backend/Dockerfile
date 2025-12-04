FROM rust:1.88-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM rust:1.88-slim 
WORKDIR /app
EXPOSE 3001
CMD ["cargo", "run"]  