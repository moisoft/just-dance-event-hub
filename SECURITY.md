# Política de Segurança

## Versões Suportadas

Use esta seção para informar às pessoas sobre quais versões do seu projeto estão atualmente sendo suportadas com atualizações de segurança.

| Versão | Suportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reportando uma Vulnerabilidade

Agradecemos por reportar vulnerabilidades de segurança no Just Dance Event Hub. Para reportar uma vulnerabilidade, por favor:

1. **NÃO** crie um issue público no GitHub
2. Envie um email para [moise@moisoft.com](mailto:moise@moisoft.com) com o assunto "[SECURITY] Vulnerabilidade Reportada"
3. Inclua detalhes sobre a vulnerabilidade, incluindo:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Possível impacto
   - Sugestões de correção (se houver)

### O que esperar:

- **Resposta inicial**: Dentro de 48 horas
- **Avaliação**: Dentro de 7 dias
- **Correção**: Dependendo da severidade, entre 1-30 dias
- **Disclosure**: Após a correção ser lançada

## Tipos de Vulnerabilidades que Reportamos

- Injeção de SQL
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Exposição de dados sensíveis
- Vulnerabilidades de autenticação
- Vulnerabilidades de autorização
- Vulnerabilidades de configuração
- Vulnerabilidades de dependências

## Práticas de Segurança

### Para Desenvolvedores

1. **Nunca commite credenciais** no código
2. **Use variáveis de ambiente** para configurações sensíveis
3. **Valide todas as entradas** do usuário
4. **Use HTTPS** em produção
5. **Mantenha dependências atualizadas**
6. **Revise código** antes de fazer merge

### Para Usuários

1. **Mantenha o sistema atualizado**
2. **Use senhas fortes**
3. **Configure HTTPS** adequadamente
4. **Monitore logs** regularmente
5. **Faça backups** regulares
6. **Use firewall** e outras medidas de segurança

## Histórico de Vulnerabilidades

### 2024
- Nenhuma vulnerabilidade reportada até o momento

## Agradecimentos

Agradecemos a todos os pesquisadores de segurança que reportam vulnerabilidades de forma responsável. Seu trabalho ajuda a manter o Just Dance Event Hub seguro para todos os usuários.

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html) 