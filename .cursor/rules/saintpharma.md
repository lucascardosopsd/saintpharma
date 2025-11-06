# SaintPharma - Regras de Desenvolvimento

## 🏗️ Arquitetura e Stack Tecnológica

### Stack Principal

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB com Prisma ORM
- **Autenticação**: Clerk
- **CMS**: Sanity
- **Styling**: Tailwind CSS + Radix UI
- **Validação**: Zod
- **Estado**: React Hook Form

### Estrutura de Pastas

```
src/
├── actions/          # Server Actions organizadas por domínio
├── app/             # App Router (Next.js 14)
├── components/      # Componentes React reutilizáveis
├── hooks/          # Custom hooks
├── lib/            # Utilitários e configurações
├── types/          # Definições de tipos TypeScript
├── validators/     # Schemas de validação Zod
├── sanity/         # Configuração e schemas do Sanity
└── constants/      # Constantes da aplicação
```

## 🔐 Autenticação e Segurança

### Regras de Autenticação

- **SEMPRE** usar `validateApiToken()` para rotas de API protegidas
- **NUNCA** expor dados de usuários sem validação de ownership
- **SEMPRE** validar `userId` em operações sensíveis
- **SEMPRE** usar Clerk para autenticação web
- **SEMPRE** usar API_TOKEN para autenticação de apps móveis

### Middleware

- Rotas públicas definidas em `src/middleware.ts`
- APIs são públicas por padrão, validação manual necessária
- Headers CORS configurados em `next.config.mjs`

## 🗄️ Banco de Dados e Prisma

### Regras de Gerenciamento de Pacotes

- **SEMPRE** usar `yarn` ao invés de `npm` para gerenciar dependências
- **SEMPRE** usar `yarn add` para adicionar novos pacotes
- **SEMPRE** usar `yarn install` para instalar dependências
- **SEMPRE** usar `yarn remove` para remover pacotes
- **NUNCA** usar `npm` em comandos de gerenciamento de pacotes

### Schema Rules

- **SEMPRE** usar Prisma como ORM principal
- **SEMPRE** usar `@db.ObjectId` para campos de referência MongoDB
- **SEMPRE** incluir `createdAt` e `updatedAt` em modelos
- **SEMPRE** usar `@default(now())` para timestamps
- **SEMPRE** executar `prisma generate` após mudanças no schema
- **SEMPRE** usar `prisma db push` para sincronizar schema com MongoDB

### Modelos Principais

- `User`: Usuários com pontos e relacionamentos
- `Certificate`: Certificados de cursos
- `UserLecture`: Progresso de aulas
- `Damage`: Sistema de vidas/danos
- `Exam`: Provas e avaliações

## 🎯 Regras de Desenvolvimento

### Server Actions

- **SEMPRE** organizar por domínio em `src/actions/`
- **SEMPRE** usar TypeScript com tipos explícitos
- **SEMPRE** validar inputs com Zod
- **SEMPRE** tratar erros adequadamente
- **SEMPRE** retornar respostas padronizadas

### API Routes

- **SEMPRE** usar funções centralizadas (`successResponse`, `serverErrorResponse`, `unauthorizedResponse`)
- **SEMPRE** validar autenticação com `validateApiToken()`
- **SEMPRE** verificar ownership de recursos
- **SEMPRE** usar métodos HTTP corretos (GET, POST, PUT, DELETE)
- **SEMPRE** incluir headers CORS apropriados

### Componentes React

- **SEMPRE** usar TypeScript com interfaces explícitas
- **SEMPRE** usar Tailwind CSS para styling
- **SEMPRE** usar Radix UI para componentes complexos
- **SEMPRE** implementar loading states
- **SEMPRE** tratar estados de erro
- **SEMPRE** usar React Hook Form para formulários

### Validação

- **SEMPRE** usar Zod para validação de schemas
- **SEMPRE** validar no frontend E backend
- **SEMPRE** usar `@hookform/resolvers` para integração
- **SEMPRE** fornecer mensagens de erro em português

## 📱 PWA e Mobile

### Regras PWA

- **SEMPRE** manter manifest atualizado
- **SEMPRE** incluir ícones em múltiplos tamanhos
- **SEMPRE** implementar service workers se necessário
- **SEMPRE** testar em dispositivos móveis

### Responsividade

- **SEMPRE** usar Tailwind breakpoints
- **SEMPRE** testar em mobile-first
- **SEMPRE** considerar touch interactions

## 🎨 UI/UX

### Design System

- **SEMPRE** usar componentes do `src/components/ui/`
- **SEMPRE** seguir padrões do Radix UI
- **SEMPRE** usar tokens de design consistentes
- **SEMPRE** implementar dark mode quando aplicável

### Acessibilidade

- **SEMPRE** usar semantic HTML
- **SEMPRE** incluir ARIA labels quando necessário
- **SEMPRE** garantir contraste adequado
- **SEMPRE** suportar navegação por teclado

## 🧪 Qualidade e Testes

### Code Quality

- **SEMPRE** usar ESLint e Prettier
- **SEMPRE** seguir convenções de nomenclatura
- **SEMPRE** documentar funções complexas
- **SEMPRE** usar TypeScript strict mode

### Performance

- **SEMPRE** otimizar imagens com Next.js Image
- **SEMPRE** usar lazy loading quando apropriado
- **SEMPRE** implementar paginação para listas grandes
- **SEMPRE** monitorar bundle size

## 📊 Sistema de Pontos e Gamificação

### Regras de Negócio

- **SEMPRE** calcular pontos baseado em atividades reais
- **SEMPRE** implementar sistema de vidas corretamente
- **SEMPRE** validar conclusão de cursos antes de certificar
- **SEMPRE** manter histórico de atividades

### Ranking

- **SEMPRE** usar pontos reais para ranking
- **SEMPRE** implementar cache para performance
- **SEMPRE** considerar timezone do usuário

## 🔄 Integração com Sanity CMS

### Regras Sanity

- **SEMPRE** usar schemas tipados
- **SEMPRE** implementar preview mode
- **SEMPRE** usar `@sanity/image-url` para otimização
- **SEMPRE** validar dados do CMS no frontend

### Estrutura de Dados

- **SEMPRE** manter consistência entre Prisma e Sanity
- **SEMPRE** usar IDs únicos para relacionamentos
- **SEMPRE** implementar fallbacks para dados ausentes

## 🚀 Deploy e Ambiente

### Variáveis de Ambiente

- **SEMPRE** documentar variáveis necessárias
- **SEMPRE** usar `.env.local` para desenvolvimento
- **SEMPRE** validar configurações em runtime

### Build

- **SEMPRE** executar `prisma generate` antes do build
- **SEMPRE** verificar se todas as dependências estão instaladas
- **SEMPRE** testar build localmente antes do deploy

## 📝 Documentação

### Código

- **SEMPRE** comentar lógica complexa
- **SEMPRE** documentar APIs com JSDoc
- **SEMPRE** manter README atualizado
- **SEMPRE** documentar mudanças no schema

### Commits

- **SEMPRE** usar conventional commits
- **SEMPRE** incluir descrição clara
- **SEMPRE** referenciar issues quando aplicável

## 🐛 Debugging e Logs

### Logging

- **SEMPRE** usar console.log para desenvolvimento
- **SEMPRE** implementar logging estruturado em produção
- **SEMPRE** não expor informações sensíveis em logs
- **SEMPRE** incluir contexto relevante nos logs

### Error Handling

- **SEMPRE** capturar e tratar erros adequadamente
- **SEMPRE** fornecer mensagens de erro úteis
- **SEMPRE** implementar fallbacks quando possível
- **SEMPRE** logar erros para debugging

## 🔧 Ferramentas e Comandos

### Git

- **SEMPRE** usar `:q` após comandos `git diff` para sair do vim quando o pager abrir
- **SEMPRE** agrupar commits por lógica de modificação
- **SEMPRE** usar conventional commits em inglês

### Comandos Essenciais

```bash
# Desenvolvimento
yarn dev

# Build
yarn build

# Lint
yarn lint

# Gerenciamento de Pacotes (SEMPRE usar yarn)
yarn add [package]
yarn install
yarn remove [package]

# Prisma (SEMPRE usar Prisma como ORM)
npx prisma generate
npx prisma db push
npx prisma studio
npx prisma migrate dev
```

### Scripts Úteis

- `yarn dev`: Servidor de desenvolvimento
- `yarn build`: Build de produção
- `yarn lint`: Verificação de código
- `npx prisma studio`: Interface do banco

## ⚠️ Regras Críticas

### NUNCA FAZER

- ❌ Expor dados de usuários sem validação
- ❌ Hardcodar valores em produção
- ❌ Ignorar validação de autenticação
- ❌ Fazer queries sem otimização
- ❌ Deploy sem testar localmente
- ❌ Commitar credenciais ou tokens
- ❌ Ignorar tipos TypeScript
- ❌ Usar `any` sem justificativa

### SEMPRE FAZER

- ✅ Validar autenticação em rotas protegidas
- ✅ Usar TypeScript strict
- ✅ Implementar tratamento de erros
- ✅ Testar em múltiplos dispositivos
- ✅ Otimizar performance
- ✅ Manter código limpo e documentado
- ✅ Seguir padrões de segurança
- ✅ Validar inputs com Zod

## 🎯 Objetivos do Projeto

### Funcionalidades Principais

1. **Sistema de Cursos**: Gerenciamento via Sanity CMS
2. **Gamificação**: Pontos, vidas, ranking
3. **Certificados**: Geração automática de certificados
4. **PWA**: Funcionalidade offline e mobile
5. **Autenticação**: Clerk + API tokens para mobile

### Métricas de Sucesso

- Performance < 500ms para 95% das requests
- 100% das rotas com validação de autenticação
- 0 erros críticos de lógica
- Cobertura de testes > 80%
- Sistema de pontos funcionando corretamente

---

**Última atualização**: 2024-12-19
**Versão**: 1.0
**Responsável**: Equipe de Desenvolvimento SaintPharma
