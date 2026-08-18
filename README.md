# Espaço VIP — Gestão de Imóveis

Painel administrativo para gerenciar salas da Espaço VIP e imóveis externos. A aplicação usa PHP 8.3, MySQL 8 e JavaScript sem framework.

## Estrutura de dados

Os dados operacionais não ficam mais presos ao navegador. O MySQL mantém entidades separadas para:

- imóveis e unidades físicas;
- inquilinos;
- contratos e seus participantes;
- histórico de eventos e acompanhamentos;
- reajustes de aluguel;
- pagamentos por competência;
- encargos, como IPTU;
- documentos vinculados ao imóvel, contrato, inquilino ou pagamento.

Essa separação preserva o histórico quando um inquilino ou contrato muda.

## Executar com Laragon

1. Inicie Apache e MySQL no Laragon.
2. Copie `.env.example` para `.env` e ajuste as credenciais, se necessário.
3. No terminal da pasta do projeto, execute a migração usando o PHP do Laragon:

```powershell
& 'C:\laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.exe' database\migrate.php
```

4. Abra `http://site_alugueis.test` ou o endereço configurado no Laragon.

A migração cria o banco `site_alugueis`, todas as tabelas e importa as 36 unidades atuais. Ela é segura para ser executada novamente: as migrações aplicadas são registradas e o seed inicial não é duplicado.

## Executar com Docker

```bash
docker compose up -d --build
```

Depois abra `http://localhost:8080`. O container aguarda o MySQL e executa as migrações automaticamente antes de iniciar o Apache.

## Deploy no Easypanel

O `Dockerfile` está preparado para build direto do GitHub, migração automática e health check. O passo a passo completo, incluindo serviço MySQL, variáveis de ambiente, porta e deploy automático, está em [`DEPLOY_EASYPANEL.md`](DEPLOY_EASYPANEL.md).

## Desenvolvimento

Com PHP disponível no `PATH`:

```bash
npm start
npm test
```

O servidor local ficará em `http://127.0.0.1:4173`. Se os dados originais em `data.js` precisarem ser reconsolidados antes da primeira implantação, execute `npm run db:seed-export` e recrie um banco vazio.

## Configuração

As variáveis aceitas estão documentadas em `.env.example`. O arquivo `.env` não deve ser versionado. Em produção, use uma senha forte, mantenha `APP_DEBUG=false`, restrinja o acesso ao banco e adicione autenticação antes de expor operações administrativas na internet.
