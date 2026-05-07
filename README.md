# Radio Café PDV - Prova de Conceito

Sistema PDV ultraleve para restaurantes, arquitetura mínima de recursos, inspirado em filosofia Unix e CGI puro.

## Arquitetura
- **Frontend:** React (Vite) + Nginx (container)
- **Backend:** COBOL (GnuCOBOL) via CGI, servido por Lighttpd (container)
- **Orquestração:** Docker Compose

## Contrato de Dados
- Comunicação frontend→backend: `text/plain` (POST)
- Payload: 21 bytes posicional
  - ID Produto: 3 dígitos (zeros à esquerda)
  - Nome Produto: 15 caracteres (espaço à direita)
  - Quantidade: 3 dígitos (zeros à esquerda)
- Exemplo: `014DUPLO BURGER   002`

## Como rodar
```sh
docker-compose up --build
```
- Frontend: http://localhost
- Backend CGI: http://localhost:8080/cgi-bin/pdv.sh

## Funcionalidades
- Seleção de produto via cards (estilo PDV)
- Escolha de quantidade
- Envio do pedido para a "cozinha" (backend COBOL)
- Visual moderno, marca Radio Café

## Estrutura
```
frontend/
  src/App.jsx         # UI principal
  Dockerfile          # Build React + Nginx
backend/
  pdv.cbl             # Código COBOL CGI
  pdv-wrapper.sh      # Wrapper CGI
  Dockerfile          # Build Lighttpd + GnuCOBOL
  lighttpd.conf       # Configuração CGI
```

## Observações
- Backend não processa/parsa JSON, só string posicional.
- Resposta backend: JSON puro, números sem zero à esquerda.
- Projeto PoC, foco em simplicidade/extrema leveza.

---

© Radio Café 2026

## Publicação automática (CI) → Docker Hub

O repositório inclui um workflow GitHub Actions (`.github/workflows/dockerhub-publish.yml`) que constrói e publica as imagens Docker do frontend e backend para o Docker Hub quando houver push na branch `main`.

Configuração necessária no repositório GitHub:

- Defina o secret `DOCKERHUB_USERNAME` com seu usuário Docker Hub.

- Defina o secret `DOCKERHUB_TOKEN` com um token de acesso (ou senha) do Docker Hub.

As imagens serão publicadas com as tags:

- `vimace2003/radio-cafe-pdv-frontend:latest` e `:<sha>`

- `vimace2003/radio-cafe-pdv-backend:latest` e `: <sha>`

Para mudar o namespace do Docker Hub, edite as variáveis `FRONTEND_IMAGE` e `BACKEND_IMAGE` no workflow.
