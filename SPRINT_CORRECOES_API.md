# 🚀 Sprint: Correção de Erros na API

**Duração:** 1-2 semanas  
**Prioridade:** 🔴 Alta  
**Objetivo:** Corrigir erros críticos de lógica e implementação nas rotas da API

---

## 📋 **Backlog da Sprint**

### **Epic 1: Correção do Schema do Prisma**

_Prioridade: 🔴 Crítica_

#### **Task 1.1: Atualizar Modelo User**

- [ ] Adicionar campo `points: Int @default(0)` ao modelo User
- [ ] Adicionar campo `createdAt: DateTime @default(now())` ao modelo UserLecture
- [ ] Executar migration do banco de dados
- [ ] Atualizar tipos TypeScript gerados

**Estimativa:** 2 horas  
**Critérios de Aceitação:**

- Schema atualizado com novos campos
- Migration executada com sucesso
- Tipos TypeScript atualizados

#### **Task 1.2: Validar Schema Completo**

- [ ] Revisar todos os modelos do Prisma
- [ ] Verificar relacionamentos entre tabelas
- [ ] Documentar campos obrigatórios vs opcionais

**Estimativa:** 1 hora  
**Critérios de Aceitação:**

- Schema validado e documentado
- Relacionamentos funcionando corretamente

---

### **Epic 2: Correção de Autenticação e Segurança**

_Prioridade: 🔴 Crítica_

#### **Task 2.1: Padronizar Validação de Autenticação**

- [ ] Corrigir `/api/certificate/create/route.ts` - adicionar validação de token
- [ ] Refatorar `/api/user/summary/route.ts` - usar `validateApiToken()`
- [ ] Verificar todas as rotas para garantir validação consistente

**Estimativa:** 3 horas  
**Critérios de Aceitação:**

- Todas as rotas protegidas com validação de token
- Uso consistente das funções de autenticação
- Testes de segurança passando

#### **Task 2.2: Revisar Autorização de Recursos**

- [ ] Verificar se usuários só acessam seus próprios dados
- [ ] Implementar validação de ownership em rotas sensíveis
- [ ] Adicionar logs de auditoria para operações críticas

**Estimativa:** 4 horas  
**Critérios de Aceitação:**

- Usuários não conseguem acessar dados de outros usuários
- Logs de auditoria implementados
- Testes de autorização passando

---

### **Epic 3: Correção de Lógica de Negócio**

_Prioridade: 🟡 Alta_

#### **Task 3.1: Corrigir Sistema de Pontos**

- [ ] Implementar lógica real de pontos em `/api/user/points`
- [ ] Corrigir cálculo de pontos em `/api/auth/login`
- [ ] Atualizar sistema de ranking para usar pontos reais
- [ ] Implementar histórico de pontos

**Estimativa:** 6 horas  
**Critérios de Aceitação:**

- Sistema de pontos funcionando corretamente
- Ranking baseado em pontos reais
- Histórico de pontos implementado

#### **Task 3.2: Corrigir Sistema de Vidas**

- [ ] Corrigir cálculo de reset de vidas (usar `addHours` em vez de `subHours`)
- [ ] Implementar lógica de regeneração de vidas
- [ ] Corrigir contagem de danos nas últimas 10 horas

**Estimativa:** 3 horas  
**Critérios de Aceitação:**

- Reset de vidas calculado corretamente
- Sistema de regeneração funcionando
- Contagem de danos precisa

#### **Task 3.3: Corrigir Sistema de Cursos**

- [ ] Implementar busca real de cursos do Sanity CMS
- [ ] Corrigir lógica de cursos em progresso
- [ ] Implementar validação de conclusão de curso
- [ ] Corrigir criação de certificados

**Estimativa:** 8 horas  
**Critérios de Aceitação:**

- Cursos carregados do Sanity CMS
- Progresso de cursos calculado corretamente
- Certificados criados apenas quando apropriado

---

### **Epic 4: Correção de Queries e Performance**

_Prioridade: 🟡 Média_

#### **Task 4.1: Otimizar Queries do Banco**

- [ ] Corrigir query de atividades recentes em `/api/auth/logout`
- [ ] Otimizar queries com filtros de data
- [ ] Implementar paginação adequada
- [ ] Adicionar índices necessários

**Estimativa:** 4 horas  
**Critérios de Aceitação:**

- Queries otimizadas e rápidas
- Filtros de data funcionando corretamente
- Paginação implementada

#### **Task 4.2: Corrigir Dados de Resposta**

- [ ] Corrigir timestamps incorretos em `/api/user/summary`
- [ ] Implementar dados reais em vez de valores hardcoded
- [ ] Corrigir cálculos de horas estudadas

**Estimativa:** 3 horas  
**Critérios de Aceitação:**

- Dados reais retornados em todas as rotas
- Timestamps corretos
- Cálculos precisos

---

### **Epic 5: Padronização e Qualidade**

_Prioridade: 🟢 Baixa_

#### **Task 5.1: Padronizar Respostas da API**

- [ ] Migrar todas as rotas para usar funções centralizadas
- [ ] Padronizar formatos de erro
- [ ] Implementar middleware de resposta consistente

**Estimativa:** 4 horas  
**Critérios de Aceitação:**

- Todas as rotas usando funções centralizadas
- Formatos de resposta consistentes
- Middleware implementado

#### **Task 5.2: Melhorar Tratamento de Erros**

- [ ] Implementar logging estruturado
- [ ] Adicionar códigos de erro específicos
- [ ] Melhorar mensagens de erro para usuários

**Estimativa:** 3 horas  
**Critérios de Aceitação:**

- Logging estruturado implementado
- Códigos de erro específicos
- Mensagens de erro claras

#### **Task 5.3: Adicionar Validação de Input**

- [ ] Implementar validação com Zod ou similar
- [ ] Adicionar sanitização de dados
- [ ] Validar tipos de dados em todas as rotas

**Estimativa:** 5 horas  
**Critérios de Aceitação:**

- Validação de input implementada
- Dados sanitizados
- Tipos validados

---

## 🎯 **Planejamento da Sprint**

### **Semana 1: Correções Críticas**

- **Dia 1-2:** Epic 1 (Schema do Prisma)
- **Dia 3-4:** Epic 2 (Autenticação e Segurança)
- **Dia 5:** Epic 3.1 (Sistema de Pontos)

### **Semana 2: Correções de Funcionalidade**

- **Dia 1-2:** Epic 3.2-3.3 (Vidas e Cursos)
- **Dia 3:** Epic 4 (Queries e Performance)
- **Dia 4-5:** Epic 5 (Padronização)

---

## 🧪 **Critérios de Definição de Pronto**

### **Para cada Task:**

- [ ] Código implementado e testado
- [ ] Testes unitários passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Deploy em ambiente de teste

### **Para a Sprint:**

- [ ] Todas as tasks críticas (Epic 1-2) concluídas
- [ ] Sistema de pontos funcionando
- [ ] Autenticação segura
- [ ] Performance melhorada
- [ ] Testes de integração passando

---

## 🚨 **Riscos e Dependências**

### **Riscos:**

- **Alto:** Migration do banco pode afetar dados existentes
- **Médio:** Integração com Sanity CMS pode ter problemas
- **Baixo:** Mudanças no schema podem quebrar frontend

### **Dependências:**

- Acesso ao banco de dados para migrations
- Configuração do Sanity CMS
- Ambiente de teste configurado

---

## 📊 **Métricas de Sucesso**

### **Técnicas:**

- [ ] 0 erros de lógica críticos
- [ ] 100% das rotas com validação de autenticação
- [ ] Tempo de resposta < 500ms para 95% das requests
- [ ] Cobertura de testes > 80%

### **Funcionais:**

- [ ] Sistema de pontos funcionando
- [ ] Sistema de vidas funcionando
- [ ] Cursos carregando corretamente
- [ ] Certificados sendo criados adequadamente

---

## 🔄 **Processo de Review**

### **Daily Standups:**

- Progresso das tasks
- Bloqueadores
- Ajustes no planejamento

### **Sprint Review:**

- Demonstração das funcionalidades corrigidas
- Feedback dos stakeholders
- Planejamento da próxima sprint

### **Retrospectiva:**

- O que funcionou bem
- O que pode ser melhorado
- Ações para próxima sprint

---

**Responsável:** Equipe de Desenvolvimento  
**Stakeholders:** Product Owner, QA Team  
**Data de Início:** [Data a definir]  
**Data de Conclusão:** [Data a definir]
