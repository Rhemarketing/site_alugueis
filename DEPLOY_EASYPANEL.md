# Deploy automático no Easypanel

O projeto está pronto para ser construído diretamente do GitHub usando o `Dockerfile` da raiz. Não é necessário executar a migração manualmente: o entrypoint aguarda o MySQL, aplica somente as migrações pendentes e inicia o Apache.

## 1. Criar o serviço MySQL

No projeto do Easypanel, crie primeiro um serviço MySQL e configure:

- banco: `site_alugueis`;
- usuário dedicado à aplicação;
- senha forte gerada pelo painel;
- volume persistente habilitado para `/var/lib/mysql`.

Não publique a porta 3306 na internet. A aplicação deve usar o endereço interno exibido pelo serviço MySQL do Easypanel.

## 2. Criar a aplicação pelo GitHub

1. Adicione um serviço de aplicação.
2. Selecione GitHub como origem e autorize o repositório.
3. Selecione a branch de produção, normalmente `main`.
4. Use o modo de build por `Dockerfile`, com contexto `.` e arquivo `Dockerfile`.
5. Configure a porta HTTP interna como `80`.
6. Configure o health check HTTP em `/api/health.php`.
7. Habilite o deploy automático para novos pushes na branch selecionada.

Depois disso, cada push recebido pelo Easypanel gera uma nova imagem. O container novo só começa a servir a aplicação após confirmar a conexão com o banco e concluir as migrações.

## 3. Variáveis de ambiente

Cadastre estas variáveis no serviço da aplicação. Copie host, usuário e senha da tela de conexão interna do serviço MySQL:

```dotenv
DB_HOST=<host-interno-do-mysql>
DB_PORT=3306
DB_DATABASE=site_alugueis
DB_USERNAME=<usuario-do-mysql>
DB_PASSWORD=<senha-do-mysql>
DB_CHARSET=utf8mb4
DB_WAIT_ATTEMPTS=60
APP_TIMEZONE=America/Sao_Paulo
APP_DEBUG=false
```

`DB_HOST` nunca deve ser `localhost`: no Docker, MySQL e aplicação ficam em containers diferentes. Não envie um arquivo `.env` ao GitHub; as credenciais devem existir apenas no Easypanel.

## 4. Domínio e HTTPS

Associe o domínio ao serviço web na porta 80 e ative o certificado HTTPS no Easypanel. Antes de tornar o painel público, implemente autenticação para proteger os dados administrativos e as operações de escrita.

## Atualizações do banco

Novas alterações de estrutura devem ser adicionadas em `database/migrations/` com nomes sequenciais. A tabela `schema_migrations` impede reaplicações e uma trava do MySQL evita que duas instâncias executem a mesma migração simultaneamente.
