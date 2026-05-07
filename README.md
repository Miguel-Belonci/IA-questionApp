# ProjetoIA

Aplicacao full stack com React no frontend e Express + Sequelize no backend.

## Rodando o projeto

1. Instale as dependencias:

```bash
npm run install:all
npm install
```

2. Configure o backend:

```bash
cp server/.env.example server/.env
```

3. Rode frontend e backend juntos:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3001`

## Banco de dados

O backend usa `DB_DIALECT` no arquivo `server/.env`.

Para SQLite:

```env
DB_DIALECT=sqlite
SQLITE_STORAGE=./database.sqlite
```

Para Postgres:

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=projetoia
DB_USER=postgres
DB_PASSWORD=postgres
```
