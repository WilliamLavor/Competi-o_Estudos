<div align="center">

# ⏱️ StudyTimer

**Registre suas sessões de estudo e visualize sua evolução diária com um heatmap estilo GitHub.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[Funcionalidades](#-funcionalidades) •
[Stack](#-stack) •
[Como rodar](#-como-rodar) •
[API](#-api) •
[Deploy](#-deploy) •
[Roadmap](#-roadmap)

</div>

---

## 📖 Sobre o projeto

O **StudyTimer** é uma aplicação web leve para acompanhar seus estudos. Você inicia um cronômetro (modo livre ou Pomodoro), associa o tempo a uma matéria e, ao final, a sessão é registrada automaticamente. A partir desses registros, a aplicação gera:

- Um **heatmap anual** (igual às contribuições do GitHub)
- **Estatísticas** de tempo total, streak e média diária
- **Histórico** detalhado por matéria e período

> Projeto pensado para ser **simples de manter**, **barato de hospedar** e **fácil de evoluir**.

---

## ✨ Funcionalidades

- [x] Autenticação com JWT (register / login)
- [x] Cronômetro livre (stopwatch)
- [x] Timer Pomodoro (25/5 configurável)
- [x] Registro automático de sessões
- [x] Matérias/tags personalizadas com cores
- [x] Heatmap anual estilo GitHub
- [x] Estatísticas: total, streak, média diária, por matéria
- [x] Histórico com filtro por período
- [x] Interface responsiva (desktop + mobile)
- [x] Recuperação de sessão em andamento ao recarregar a página
- [ ] Exportar histórico em CSV _(planejado)_
- [ ] Metas semanais _(planejado)_
- [ ] Notificações push _(planejado)_

---

## 🛠️ Stack

| Camada    | Tecnologias                                                        |
|-----------|--------------------------------------------------------------------|
| Frontend  | React 18 · Vite · TypeScript · TailwindCSS · Zustand · React Query |
| Backend   | Node.js 20 · Express · TypeScript · Prisma ORM · Zod               |
| Banco     | PostgreSQL 16                                                      |
| Auth      | JWT (access + refresh)                                             |
| Infra     | Docker · Docker Compose · Nginx · Let's Encrypt                    |

---

## 🏗️ Arquitetura

```
                    ┌──────────────┐
                    │   Usuário    │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
                 ┌────────────────────┐
                 │       Nginx        │  ← TLS + arquivos estáticos
                 └─────┬───────┬──────┘
                       │       │
              /api/*   │       │   /*
                       ▼       ▼
             ┌──────────────┐ ┌────────────┐
             │  Backend     │ │ Frontend   │
             │  Express +   │ │ React (SPA │
             │  Prisma      │ │ build)     │
             └──────┬───────┘ └────────────┘
                    │
                    ▼
             ┌──────────────┐
             │ PostgreSQL   │
             └──────────────┘
```

O timer é executado **inteiramente no navegador** — o backend só persiste sessões finalizadas. Isso torna a aplicação resiliente a quedas de conexão e reduz carga no servidor.

---

## 🚀 Como rodar

### Pré-requisitos

- **Node.js** 20+ e **npm** (ou pnpm/yarn)
- **Docker** e **Docker Compose** (recomendado)
- **PostgreSQL 16** (ou usar o container do Docker Compose)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/studytimer.git
cd studytimer
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:

```env
# Banco
DATABASE_URL="postgresql://studytimer:studytimer@localhost:5432/studytimer"

# Auth
JWT_SECRET="troque-por-uma-string-aleatoria-longa"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Gere um `JWT_SECRET` seguro com:

```bash
openssl rand -base64 48
```

### 3. Suba tudo com Docker (forma mais fácil)

```bash
docker compose up -d --build
```

Acesse:

- Frontend: <http://localhost>
- API: <http://localhost/api>

### 4. Ou rode localmente (modo dev)

**Backend:**

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev          # http://localhost:3001
```

**Frontend (em outro terminal):**

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

---

## 🗂️ Estrutura do projeto

```
studytimer/
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── default.conf
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── index.ts
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── store/
        └── main.tsx
```

---

## 🔌 API

Base URL: `/api`

### Autenticação

| Método | Rota              | Descrição              |
|--------|-------------------|------------------------|
| POST   | `/auth/register`  | Criar conta            |
| POST   | `/auth/login`     | Login (retorna tokens) |
| POST   | `/auth/refresh`   | Renovar access token   |
| POST   | `/auth/logout`    | Revogar refresh token  |

### Matérias

| Método | Rota              | Descrição                |
|--------|-------------------|--------------------------|
| GET    | `/subjects`       | Listar matérias          |
| POST   | `/subjects`       | Criar matéria            |
| PATCH  | `/subjects/:id`   | Atualizar matéria        |
| DELETE | `/subjects/:id`   | Arquivar matéria         |

### Sessões de estudo

| Método | Rota              | Descrição                         |
|--------|-------------------|-----------------------------------|
| GET    | `/sessions`       | Listar (filtros: `from`, `to`)    |
| POST   | `/sessions`       | Registrar sessão concluída        |
| DELETE | `/sessions/:id`   | Remover sessão                    |

### Estatísticas

| Método | Rota                       | Descrição                          |
|--------|----------------------------|------------------------------------|
| GET    | `/stats/heatmap?year=2026` | Dados do heatmap anual             |
| GET    | `/stats/summary`           | Total, streak e média diária       |
| GET    | `/stats/by-subject`        | Tempo por matéria                  |

#### Exemplo — Heatmap

```http
GET /api/stats/heatmap?year=2026
Authorization: Bearer <access_token>
```

```json
{
  "year": 2026,
  "maxMinutes": 240,
  "days": [
    { "date": "2026-01-01", "minutes": 0 },
    { "date": "2026-01-02", "minutes": 45 },
    { "date": "2026-01-03", "minutes": 120 }
  ]
}
```

---

## 🗄️ Modelo de dados

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  createdAt    DateTime  @default(now())
  subjects     Subject[]
  sessions     Session[]
}

model Subject {
  id       String    @id @default(uuid())
  userId   String
  name     String
  color    String    @default("#3b82f6")
  archived Boolean   @default(false)
  user     User      @relation(fields: [userId], references: [id])
  sessions Session[]
}

model Session {
  id          String   @id @default(uuid())
  userId      String
  subjectId   String?
  startedAt   DateTime
  endedAt     DateTime
  durationSec Int
  type        String   // "stopwatch" | "pomodoro"
  note        String?
  user        User     @relation(fields: [userId], references: [id])
  subject     Subject? @relation(fields: [subjectId], references: [id])

  @@index([userId, startedAt])
}
```

---

## 🐳 Deploy

O projeto foi desenhado para rodar em uma **VPS simples (~US$ 5/mês)**.

### Passo a passo resumido

1. Aponte o DNS do seu domínio para o IP da VPS.
2. Instale Docker + Docker Compose.
3. Clone o repositório e configure o `.env` com senhas fortes.
4. Emita o certificado TLS:

```bash
docker compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  -d seudominio.com \
  --email voce@email.com --agree-tos --no-eff-email
```

5. Suba os serviços:

```bash
docker compose up -d --build
```

6. Configure backup diário do banco:

```bash
# crontab -e
0 3 * * * docker exec studytimer-db pg_dump -U studytimer studytimer | gzip > /backups/db-$(date +\%F).sql.gz
```

### Checklist de produção

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` forte e único
- [ ] Firewall (ufw) liberando apenas 22, 80 e 443
- [ ] Backup automático do Postgres
- [ ] Rate limit em `/auth/login`
- [ ] Logs centralizados (ex.: `docker logs` + logrotate)
- [ ] HTTPS obrigatório (redirect 80 → 443)

---

## 🗺️ Roadmap

- [x] MVP (auth + timer + heatmap + stats)
- [ ] Exportar histórico em CSV
- [ ] Metas semanais e mensais
- [ ] Estatísticas por matéria (gráfico de pizza)
- [ ] PWA + modo offline
- [ ] Notificações push ao fim do Pomodoro
- [ ] Compartilhar heatmap público (perfil público)

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Faça um fork do projeto
2. Crie sua branch: `git checkout -b feat/minha-feature`
3. Commit seguindo [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `git commit -m "feat: adiciona export CSV"`
4. Push: `git push origin feat/minha-feature`
5. Abra um Pull Request

### Padrões do projeto

- **TypeScript** em todo o código
- **ESLint + Prettier** configurados (rode `npm run lint` antes de commitar)
- **Testes** com Vitest (unit) e Supertest (API)

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE) para mais informações.

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)

---

<div align="center">

Feito com ☕ e ⏳

**Se este projeto te ajudou, deixa uma ⭐!**

</div>