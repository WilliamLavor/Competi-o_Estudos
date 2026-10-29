# ⏱️ StudyTimer

Timer de estudo com heatmap anual estilo GitHub.
Feito pra mim e meus amigos — simples de usar, simples de manter.

---

## Sumário

- [O que é](#o-que-é)
- [Por que existe](#por-que-existe)
- [Funcionalidades](#funcionalidades)
- [Como funciona](#como-funciona)
- [Stack](#stack)
- [Rodando localmente](#rodando-localmente)
- [Deploy](#deploy)
- [Backup](#backup)
- [Gerenciar usuários](#gerenciar-usuários)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Modelo de dados](#modelo-de-dados)
- [API](#api)
- [Perguntas frequentes](#perguntas-frequentes)
- [Licença](#licença)

---

## O que é

Um site onde você aperta "start", estuda, aperta "parar" e o tempo fica registrado.
Depois de algumas semanas, você olha pra trás e vê um **calendário cheio de quadradinhos verdes** mostrando todos os dias que você estudou — igual ao perfil do GitHub.

Tem também:

- Um **cronômetro livre** (conta pra cima)
- Um **Pomodoro** (25 min de foco + 5 de pausa, configurável)
- Um **heatmap anual**
- **Estatísticas**: tempo total, dias seguidos (streak), média diária, tempo por matéria
- **Histórico** com filtro por período

É isso. Não tem gamificação, não tem rede social, não tem notificação ansiosa. Só o timer e o gráfico.

---

## Por que existe

Cansado de apps de estudo com paywall, cadastro obrigatório, integração com 15 serviços e um dashboard que parece cockpit de avião. A ideia aqui é:

- **Abrir → estudar → fechar.** Sem fricção.
- **Ver progresso ao longo do tempo** de forma visual e honesta.
- **Hospedar por menos de US$ 5/mês** e nunca mais pensar em infra.

Projeto pessoal. Sem ambição de virar produto. Sem signup público.

---

## Funcionalidades

- ✅ Cronômetro livre (stopwatch)
- ✅ Timer Pomodoro (tempo de foco e pausa configuráveis)
- ✅ Registro automático de sessões ao finalizar
- ✅ Matérias/tags personalizadas com cores
- ✅ Heatmap anual (estilo GitHub)
- ✅ Estatísticas: total, streak, média diária, por matéria
- ✅ Histórico com filtro por período
- ✅ Interface responsiva (desktop + celular)
- ✅ Sessão em andamento sobrevive a reload (fica no `localStorage`)
- ✅ Login por email + senha (cookie httpOnly)
- 🔜 Exportar histórico em CSV
- 🔜 Metas semanais
- 🔜 Notificação ao fim do Pomodoro

---

## Como funciona

### O timer roda no navegador

O servidor **não fica contando tempo**. Quando você clica em "start", o frontend guarda `startedAt` no `localStorage` e atualiza a UI com `setInterval`. Ao finalizar (manual, pause ou Pomodoro concluído), ele faz **um único `POST`** com:

```json
{
  "startedAt": "2026-01-14T14:03:00Z",
  "endedAt": "2026-01-14T15:12:00Z",
  "durationSec": 4140,
  "type": "pomodoro",
  "subjectId": "..."
}
```

Isso significa:

- **Se a internet cair no meio do estudo**, nada se perde.
- **Se você recarregar a página**, o timer recupera do `localStorage`.
- **Servidor só guarda fatos consumados** — sem estado, sem cron, sem websocket.

### O heatmap é só SQL

Um `GROUP BY` por dia:

```sql
SELECT date(started_at) AS day,
       SUM(duration_sec) / 60 AS minutes
FROM sessions
WHERE user_id = ? AND started_at >= ?
GROUP BY day;
```

O frontend mapeia `minutes` pra uma escala de 5 tons (0, 1–15, 15–45, 45–90, 90+) e desenha o calendário.

---

## Stack

Nada exótico. Tudo que dá pra aprender em um fim de semana e manter por anos.

| Camada   | Tecnologia                       |
|----------|----------------------------------|
| Frontend | React + Vite + TypeScript        |
| Estilo   | TailwindCSS                      |
| Backend  | Node.js + Express + TypeScript   |
| Banco    | **SQLite** (arquivo único `.db`) |
| Auth     | JWT em cookie `httpOnly`         |
| Servidor | **Caddy** (HTTPS automático)     |
| Processo | **pm2**                          |

Sem Docker, sem Kubernetes, sem Redis, sem filas. Nada.

---

## Rodando localmente

**Requisitos:** Node 20+ e npm. Nada além disso.

```bash
git clone https://github.com/seu-usuario/studytimer.git
cd studytimer
npm install
cp .env.example .env
npm run dev
```

Abre em <http://localhost:5173>.

- O banco SQLite é criado sozinho em `./data/studytimer.db` no primeiro start.
- Crie um usuário pra você: `npm run adduser`

Pronto.

---

## Deploy

**Requisitos:** uma VPS com Node 20 e Caddy instalado. Só.

```bash
git clone https://github.com/seu-usuario/studytimer.git /srv/studytimer
cd /srv/studytimer
npm install && npm run build
cp .env.example .env    # edite com JWT_SECRET e URL
npm run adduser         # cria seu usuário
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup # sobe junto com o servidor
```

O Caddy serve o `dist/` e faz proxy de `/api` pro Node. HTTPS é automático — basta apontar o DNS. `Caddyfile` inteiro do projeto:

```
study.seudominio.com {
    handle /api/* {
        reverse_proxy localhost:3001
    }
    handle {
        root * /srv/studytimer/dist
        file_server
        try_files {path} /index.html
    }
}
```

**Para atualizar depois:**

```bash
cd /srv/studytimer && git pull && npm install && npm run build && pm2 restart studytimer
```

É isso. Sem Dockerfile, sem compose, sem `docker compose pull`, sem nada.

---

## Backup

Uma linha no cron, diário:

```bash
sqlite3 /srv/studytimer/data/studytimer.db \
  ".backup /backups/studytimer-$(date +%F).db"
```

SQLite é um arquivo só. Backup é `cp`. Restaurar é `cp` de volta. Fim.

---

## Gerenciar usuários

**Não tem signup público** — de propósito. Você cria contas manualmente via CLI:

```bash
npm run adduser -- --email joao@exemplo.com --name "João"
```

O script pede a senha interativamente. Pronto, conta criada.

Pra remover, edita o banco ou adiciona um `npm run deluser` depois. São 10 amigos, não 10 mil usuários.

---

## Estrutura do projeto

```
studytimer/
├── Caddyfile
├── ecosystem.config.cjs
├── .env.example
├── data/                 # banco SQLite (gitignored)
├── scripts/
│   └── adduser.ts
├── server/
│   ├── index.ts
│   ├── db.ts             # SQLite + migrations simples
│   ├── auth.ts           # JWT + cookie
│   └── routes/
│       ├── sessions.ts
│       ├── subjects.ts
│       └── stats.ts
└── src/                  # frontend React
    ├── main.tsx
    ├── api.ts
    ├── pages/
    │   ├── Login.tsx
    │   ├── Timer.tsx
    │   └── Dashboard.tsx
    └── components/
        ├── Heatmap.tsx
        ├── Timer.tsx
        └── StatsCard.tsx
```

Sem camada de `service`, sem `middleware/`, sem `utils/`. Cada arquivo faz uma coisa.

---

## Modelo de dados

Três tabelas. É isso.

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE subjects (
  id       TEXT PRIMARY KEY,
  user_id  TEXT NOT NULL REFERENCES users(id),
  name     TEXT NOT NULL,
  color    TEXT NOT NULL DEFAULT '#3b82f6'
);

CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  subject_id   TEXT REFERENCES subjects(id),
  started_at   TEXT NOT NULL,
  ended_at     TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  type         TEXT NOT NULL,
  note         TEXT
);

CREATE INDEX idx_sessions_user_started
  ON sessions(user_id, started_at);
```

Sem tabela de refresh token, sem auditoria, sem soft delete, sem `updated_at` em tudo. Se precisar, adiciona depois.

---

## API

Base URL: `/api`. Autenticação via cookie `token` (httpOnly, `SameSite=Lax`).

### Auth

| Método | Rota              | O que faz                    |
|--------|-------------------|------------------------------|
| POST   | `/auth/login`     | Login — seta cookie, retorna user |
| POST   | `/auth/logout`    | Limpa cookie                 |
| GET    | `/auth/me`        | Retorna usuário logado       |

Não tem `/register` público. Usuários são criados via `npm run adduser`.

### Matérias

| Método | Rota              | O que faz          |
|--------|-------------------|--------------------|
| GET    | `/subjects`       | Lista              |
| POST   | `/subjects`       | Cria               |
| PATCH  | `/subjects/:id`   | Renomeia / recolore |
| DELETE | `/subjects/:id`   | Remove             |

### Sessões

| Método | Rota              | O que faz                          |
|--------|-------------------|------------------------------------|
| GET    | `/sessions`       | Lista (query `?from=&to=`)         |
| POST   | `/sessions`       | Registra sessão finalizada         |
| DELETE | `/sessions/:id`   | Remove                             |

### Estatísticas

| Método | Rota                       | O que faz               |
|--------|----------------------------|-------------------------|
| GET    | `/stats/heatmap?year=2026` | Série diária de minutos |
| GET    | `/stats/summary`           | Total, streak, média    |
| GET    | `/stats/by-subject`        | Tempo por matéria       |

Exemplo de resposta do heatmap:

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

## Perguntas frequentes

**Por que SQLite e não Postgres?**
Porque 5 pessoas estudando geram ~50 linhas por dia. SQLite aguenta isso com folga por décadas. Se um dia crescer, migrar pra Postgres é uma tarde de trabalho.

**Por que sem cadastro público?**
Porque o site é pra mim e meus amigos. Convite verbal > formulário de signup + verificação de email + captcha.

**Por que Caddy e não Nginx?**
Porque HTTPS automático em 3 linhas é melhor que `certbot`, `cron` de renovação, e config de 80 linhas. O Caddy gera e renova sozinho.

**Por que pm2 e não Docker?**
Porque Docker resolve problemas que eu não tenho. `git pull && pm2 restart` é tudo que eu preciso pra deployar.

**Por que o timer não fica no servidor?**
Porque se o servidor reiniciar, cair a internet ou você fechar o notebook, o timer no navegador continua. E o servidor não precisa de estado, websocket, nem nada — só recebe um `POST` no final.

**E se eu quiser fazer login de outro dispositivo?**
O banco está num arquivo só. `scp` do `.db` pro outro servidor e pronto. (Ou, mais realista: o site já está num domínio e você acessa de qualquer lugar.)

**Tem testes?**
Não. O objetivo do projeto é ser pequeno o suficiente pra não precisar de testes automatizados. Se o timer salva errado, você percebe no heatmap no dia seguinte.

**É seguro?**
Razoavelmente. Senha com bcrypt, cookie httpOnly, HTTPS pelo Caddy. Não tem CSRF token explícito, não tem rate limit, não tem 2FA. É app entre amigos — se um dia abrir pro público, endurece.

---

## Licença

MIT. Faça o que quiser.