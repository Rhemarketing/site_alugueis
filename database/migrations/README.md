# Migrações futuras

Adicione alterações incrementais como arquivos SQL ordenados, por exemplo:

```text
002_add_users.sql
003_add_payment_indexes.sql
```

Na inicialização do container, `database/migrate.php` aplica apenas os arquivos ainda não registrados em `schema_migrations`. Nunca altere uma migração que já tenha sido aplicada em produção; crie o próximo arquivo numerado.
