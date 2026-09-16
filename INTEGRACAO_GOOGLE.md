# Login com Google + Google Agenda — integração

## 1. Console do Google

1. https://console.cloud.google.com → novo projeto.
2. **APIs e serviços → Biblioteca** → ative a **Google Calendar API**.
3. **Tela de consentimento OAuth** → tipo Externo. Em "Escopos", adicione
   `.../auth/calendar.events` (os de e-mail e perfil já vêm por padrão).
   Enquanto o app estiver em "Teste", só os e-mails listados em "Usuários
   de teste" conseguem entrar — inclua o seu.
4. **Credenciais → Criar → ID do cliente OAuth → Aplicativo da Web**.
   - Origens JavaScript autorizadas: `http://localhost:5173`
   - URIs de redirecionamento: `http://localhost:8000/auth/google/callback`

Em produção, repita com os domínios reais. A URI de redirecionamento precisa
bater caractere por caractere com a `GOOGLE_REDIRECT_URI` do backend.

## 2. Variáveis de ambiente

Backend (`.env`):

```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
GOOGLE_CALENDAR_TIMEZONE=America/Sao_Paulo
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

Frontend (`.env`):

```
VITE_API_URL=http://localhost:8000
```

## 3. Onde colocar os arquivos

| Arquivo entregue | Destino sugerido |
|---|---|
| `google_oauth.py` | `backend/app/services/google_oauth.py` |
| `google_calendar.py` | `backend/app/services/google_calendar.py` |
| `google_auth_router.py` | `backend/app/routers/google_auth.py` |
| `AuthCallback.tsx` | `frontend/src/pages/AuthCallback.tsx` |
| `GoogleLoginButton.tsx` | `frontend/src/components/GoogleLoginButton.tsx` |

No `google_auth_router.py`, ajuste os três imports marcados com `# AJUSTE`
para os caminhos reais do seu projeto (`get_db`, `User`, `create_access_token`).

Registre o router no `main.py`:

```python
from app.routers import google_auth

app.include_router(google_auth.router)
```

## 4. Migração do banco

```python
# alembic revision -m "google oauth"

def upgrade():
    op.add_column("users", sa.Column("google_id", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("google_refresh_token", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(500), nullable=True))
    op.create_unique_constraint("uq_users_google_id", "users", ["google_id"])

    # Quem entra pelo Google não tem senha.
    op.alter_column("users", "password_hash", nullable=True)

    op.add_column("tasks", sa.Column("google_event_id", sa.String(255), nullable=True))
```

E nos modelos:

```python
class User(Base):
    # ...
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    google_refresh_token = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)


class Task(Base):
    # ...
    google_event_id = Column(String(255), nullable=True)
```

**Importante no login por senha:** com `password_hash` opcional, a rota de
login precisa recusar contas sem senha antes de chamar o verificador:

```python
if not user or not user.password_hash:
    raise HTTPException(401, "E-mail ou senha inválidos.")
```

Sem isso, `verify_password(senha, None)` estoura ou, dependendo da
biblioteca, deixa passar.

## 5. Ligando com as tarefas

No router de tarefas, depois de gravar no banco:

```python
from app.services.google_calendar import (
    GoogleCalendarError,
    create_event,
    delete_event,
    update_event,
)


@router.post("/tasks", response_model=TaskResponse)
async def create_task(payload: TaskCreate, db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    task = Task(**payload.model_dump(), user_id=user.id)
    db.add(task)
    db.commit()
    db.refresh(task)

    try:
        task.google_event_id = await create_event(user, task)
        db.commit()
    except GoogleCalendarError as error:
        # A tarefa já existe. A agenda é um extra: não derruba a requisição.
        logger.warning("Falha ao sincronizar com o Google Agenda: %s", error)

    return task
```

O mesmo padrão em `update_task` (chamando `update_event`) e em `delete_task`
(chamando `delete_event(user, task.google_event_id)` **antes** do
`db.delete(task)`, para não perder o id).

Note que essas rotas precisam ser `async def`. Se as suas forem síncronas,
duas saídas: converter para `async def` (o SQLAlchemy síncrono continua
funcionando, só não bloqueie por muito tempo) ou trocar o `httpx.AsyncClient`
por `httpx.Client` e remover os `await` dos dois serviços.

## 6. Frontend

Rota nova no `App.tsx`, **fora** do `ProtectedRoute` — nesse momento o
usuário ainda não tem token:

```tsx
import AuthCallback from "./pages/AuthCallback";

<Route path="/auth/callback" element={<AuthCallback />} />
```

Na tela de login, abaixo do formulário:

```tsx
import GoogleLoginButton from "../components/GoogleLoginButton";

<div className="my-6 flex items-center gap-3">
  <span className="h-px flex-1 bg-slate-200" />
  <span className="text-xs text-slate-400">ou</span>
  <span className="h-px flex-1 bg-slate-200" />
</div>

<GoogleLoginButton />
```

O `AuthCallback` usa `saveToken` do `lib/authStorage`. Se a sua função tiver
outro nome (vi o `removeToken` no projeto), ajuste o import.

Erros voltam como `/login?erro=google_cancelado` (ou `google_falhou`,
`google_state_invalido`, `google_email_nao_verificado`). Vale ler esse
parâmetro na tela de login e mostrar uma mensagem.

## 7. Pontos de atenção

**O refresh token está em texto puro no banco.** Com ele, qualquer pessoa com
acesso ao dump lê e escreve na agenda dos seus usuários. Para produção,
criptografe a coluna — `cryptography.fernet` resolve em poucas linhas, com a
chave vindo do ambiente.

**Um usuário pode revogar o acesso** em myaccount.google.com a qualquer
momento. A renovação passa a devolver `invalid_grant`. Vale capturar esse
caso, limpar o `google_refresh_token` do usuário e avisá-lo para reconectar,
em vez de repetir o erro a cada tarefa criada.

**A sincronização é de mão única.** Editar o evento no Google não muda a
tarefa aqui. Se isso for necessário depois, o caminho é o canal de push
notifications da API (`events.watch`), que exige um endpoint público HTTPS.

**Duração fixa de 1 hora** para tarefas com horário, definida em
`DEFAULT_DURATION`. Se quiser que o usuário escolha, vale um campo de duração
no formulário de tarefa.