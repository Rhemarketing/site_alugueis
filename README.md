# Espaço VIP — Gestão de Imóveis

Primeira versão funcional do painel administrativo para gestão das salas da Espaço VIP e dos imóveis externos.

## O que já funciona

- visão geral com indicadores de ocupação, receita-base e reajustes;
- alertas automáticos conforme a data atual;
- cadastro inicial das 36 unidades físicas;
- busca e filtros por imóvel, inquilino, tipo, ocupação e reajuste;
- visualização em tabela ou cartões;
- detalhes de cada imóvel em painel lateral;
- histórico de mudanças e reajustes conhecidos;
- registro local de novos acompanhamentos;
- agenda de reajustes e exportação em CSV;
- layout responsivo para computador, tablet e celular.

## Executar localmente

Na pasta do projeto, execute:

```bash
npm start
```

Depois abra `http://localhost:4173`.

## Limites desta primeira versão

Os dados consolidados estão incluídos no projeto e os novos acompanhamentos são salvos no navegador. A próxima fase recomendada é conectar um banco de dados e o Google Drive/Planilhas para sincronização multiusuário, documentos e automações.
