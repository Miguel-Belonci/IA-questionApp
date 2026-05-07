# Docker e Cypress

## Subir a aplicacao

```bash
docker compose up --build
```

Se o build cair em `RUN npm ci` com `ECONNRESET`, isso e falha de rede baixando pacotes dentro do container. Tente novamente:

```bash
docker compose build --no-cache client
docker compose up
```

O Dockerfile do client define `CYPRESS_INSTALL_BINARY=0` porque o container de producao nao precisa baixar o binario do Cypress.

URLs:

- Front: http://localhost:8080
- API health: http://localhost:3001/api/health
- Postgres: localhost:5432

## Se o Docker nao conecta

Erros como `failed to connect to the docker API`, `dockerDesktopLinuxEngine` ou `permission denied ... docker_engine` indicam problema no Docker Desktop/daemon, nao no projeto.

No Windows:

1. Abra o Docker Desktop.
2. Espere aparecer `Docker Desktop is running`.
3. Confirme que o modo Linux containers esta ativo.
4. Rode:

```bash
docker version
docker compose ps
```

Se aparecer `Access is denied` lendo `C:\Users\<user>\.docker\config.json`, apague ou renomeie esse arquivo com o Docker fechado. O Docker recria depois.

## Diagnosticar back no container

```bash
docker compose ps
docker compose logs -f db
docker compose logs -f server
docker compose exec server node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>r.text()).then(console.log)"
```

Se `server` estiver healthy mas `http://localhost:3001/api/health` nao responder no navegador, quase sempre e conflito de porta local ou Docker Desktop sem expor porta corretamente.

Se voce mudou modelos e ja tinha volume antigo:

```bash
docker compose down -v
docker compose up --build
```

Isso recria o Postgres do zero.

## Cypress

Para testar app local em Vite:

```bash
npm run dev
npm run test:e2e:open --prefix client
```

Para testar app rodando pelo Docker:

```bash
docker compose up --build
npm run test:e2e:open:docker --prefix client
```

Se a janela do Cypress abrir branca no Windows:

```bash
npx cypress verify
npx cypress cache clear
npx cypress install
npx cypress open --browser chrome
```

Tambem confira se antivirus/Windows Defender nao bloqueou a pasta do Cypress em `%LOCALAPPDATA%\Cypress\Cache`.
