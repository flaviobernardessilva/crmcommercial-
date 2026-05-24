# VendaFácil CRM Comercial

App PWA pronto para Netlify/GitHub Pages com importação de Excel `.xlsx`.

## Como publicar
1. Envie todos os arquivos desta pasta para o repositório do GitHub.
2. No Netlify, faça deploy conectado ao repositório.
3. O arquivo `crm.xlsx` já está incluído e carrega automaticamente.
4. Para atualizar os dados, abra o app > Importar > selecione nova planilha `.xlsx`.

## Abas esperadas na planilha
- Dashboard
- Ranking_Clientes
- Analise_Vendedores
- Resumo_Mensal
- Top_Queda
- Top_Crescimento

## Observação
Os dados são salvos no navegador com localStorage para uso offline. Para multiusuário/sincronização, conectar Supabase ou Firebase.
