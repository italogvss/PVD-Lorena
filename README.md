# PDV Lorena

Sistema de ponto de venda (PDV) web para pequenos comércios. Permite registrar vendas, controlar o estoque de produtos, lançar despesas, gerenciar funcionários e acompanhar relatórios de vendas.

Há dois perfis de acesso:

- **Admin**: acesso total, incluindo cancelar vendas, gerenciar produtos e usuários e ver relatórios.
- **Funcionário**: registra vendas, consulta estoque e produtos e vê as próprias vendas.

## Stack

| Camada    | Tecnologias                                                        |
|-----------|--------------------------------------------------------------------|
| Frontend  | React, TypeScript, Vite, MUI, React Router, Axios, Chart.js, jsPDF |
| Backend   | .NET 10 (ASP.NET Core), Entity Framework Core (Pomelo), FluentValidation, JWT |
| Banco     | MySQL 8                                                            |
| Infra     | Docker, docker-compose, nginx                                      |

## Como iniciar

Pré-requisito: [Docker](https://www.docker.com/) com docker-compose.

1. Clone o repositório e crie o arquivo de ambiente:

   ```bash
   git clone https://github.com/italogvss/PVD-Lorena.git
   cd PVD-Lorena
   cp .env.example .env
   ```

2. Edite o `.env` com suas senhas e um `JWT_SECRET` de pelo menos 32 caracteres. Defina também `ADMIN_PASSWORD`, a senha do usuário administrador criado no primeiro start.

3. Suba os containers:

   ```bash
   docker-compose up -d --build
   ```

4. Acesse:
   - Aplicação: http://localhost:3000
   - API: http://localhost:5000

As migrations do banco são aplicadas automaticamente quando a API inicia.

Para rodar backend e frontend fora do Docker (desenvolvimento), veja [backend/claude.md](backend/claude.md) e [frontend/claude.md](frontend/claude.md).
