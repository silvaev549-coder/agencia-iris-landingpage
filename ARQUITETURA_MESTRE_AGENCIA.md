# Enciclopédia Técnica Mestre — ESG Tecnologia (Agência de IA & Automação)

Este documento reúne toda a arquitetura de engenharia, infraestrutura, automação, cibersegurança e estratégias comerciais desenvolvidas e validadas em produção pela ESG Tecnologia.

---

## 1. Topologia de Infraestrutura Soberana (VPS + Coolify v4 + Docker)

### 1.1 Por que Infraestrutura Própria?
Empresas consolidadas (clínicas, indústrias, marcas de e-commerce e consultorias) recusam ferramentas de prateleira por três razões centrais:
1. **Privacidade de Dados e LGPD:** Em serviços SaaS compartilhados, os dados de clientes e conversas confidenciais circulam por servidores desconhecidos.
2. **Custo Escalar Proibitivo:** Plataformas convencionais cobram por assento de atendente ou por mensagens enviadas.
3. **Instabilidade de Webhooks:** A infraestrutura privada permite controle total de timeouts, retries e escalabilidade horizontal.

### 1.2 Componentes da Stack
- **Sistema Operacional:** Ubuntu 22.04 LTS / 24.04 LTS com UFW ativado (portas 80, 443, 22 e portas internas isoladas via Docker network).
- **Coolify v4:** Painel de controle auto-hospedado para orquestração de containers Docker, roteamento reverso Traefik e geração automática de certificados SSL Let's Encrypt.
- **n8n:** Motor de automação rodando em Docker com banco PostgreSQL dedicado (persistência de filas e execuções).
- **Evolution API v2:** Engine de WhatsApp construída em Node.js com Baileys, expondo REST APIs para envio de mensagens, áudios PTT nativos, reações de emojis e monitoramento de status da conexão.
- **Supabase:** Camada de banco de dados relacional PostgreSQL, autenticação JWT, Row Level Security e Edge Functions.

### 1.3 Subdomínios Padronizados para Clientes da Agência
```text
https://agencia.dominio.com.br      -> Landing Page da Agência / Portal do Cliente
https://api.dominio.com.br          -> API Gateway / Proxy Server-Side
https://admin.dominio.com.br        -> Painel de CRM Visual e Gestão de Leads
https://n8n.dominio.com.br          -> Motor de Workflows e Automações
https://evolution.dominio.com.br    -> Gateway Evolution API (WhatsApp)
```

---

## 2. A Esteira dos Agentes de Vendas (WhatsApp & Instagram Direct)

### 2.1 A Regra de Ouro dos Balões Curtos (Splitter de Mensagens)
O erro nº 1 de desenvolvedores amadores ("vibecoders") é permitir que a IA envie blocos massivos de 500 palavras em uma única mensagem. Isso destrói a conversão e sinaliza instantaneamente que é um robô.

**Regra de Engenharia:**
- O agente gera o conteúdo com quebras de linha duplas (`\n\n`) separando cada ideia.
- O n8n ou o script backend fatia a resposta em uma lista de 2 a 4 balões de 50 a 140 caracteres.
- Para cada balão:
  1. Envia status de presença `composing` (digitando...) para o WhatsApp.
  2. Aguarda um delay proporcional ao tamanho do texto (1.2s a 2.5s).
  3. Dispara a mensagem via Evolution API.
  4. Finaliza com status `paused`.

### 2.2 Reação com Emojis Imediata
Assim que a mensagem do lead bate no webhook:
- O agente reage no balão da mensagem recebida com um emoji autêntico:
  * Vendas e Alta Energia: 👊, 💪, 🔥, 🦁
  * Saúde e Clínicas: 🩺, ✨, 💙, 🙏
  * Negócios e Finanças: 🤝, 💼, 🚀, 📈

### 2.3 Áudio Neural e Voz Multimodal (PTT Opus Nativo)
- O lead pode enviar áudios livremente no WhatsApp.
- O n8n baixa o arquivo de áudio e envia para o Whisper / Groq API (`whisper-large-v3`), obtendo a transcrição em menos de 800ms.
- O agente processa a resposta.
- Quando o momento de venda exige autoridade (ex: apresentação do médico ou personal, explicação de orçamento complexo), o sistema dispara um áudio sintetizado via F5-TTS ou ElevenLabs, codificado em formato Opus nativo (`sendWhatsAppAudio` com parâmetro `ptt: true`). O áudio aparece no WhatsApp com a barra de reprodução verde oficial.

### 2.4 Visão Computacional Multimodal
- Processamento de imagens enviadas pelos leads via Gemini Multimodal Vision:
  * Clínicas: Leitura de guias médicas, receitas, exames laboratoriais preliminares.
  * E-commerce / Fitness: Leitura de prints de balança de bioimpedância (como no Marcão Personal), pratos de refeição, fotos de produtos com defeito.
  * Documentos: Extração automática de dados de identidade, CNPJ ou comprovantes de endereço para preenchimento de CRM.

---

## 3. Esquema de Banco de Dados Oficial (Supabase PostgreSQL)

Abaixo está o DDL para inicializar o banco de dados de qualquer cliente da agência:

```sql
-- TABELA DE LEADS & CONTATOS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    telefone TEXT UNIQUE NOT NULL,
    email TEXT,
    canal_origem TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'instagram_direct', 'site_form'
    etapa_funil TEXT DEFAULT 'novo_lead', -- 'novo_lead', 'em_atendimento', 'qualificado', 'proposta_enviada', 'aguardando_pagamento', 'ganho', 'perdido'
    faturamento_estimado TEXT,
    gargalo_principal TEXT,
    responsavel TEXT,
    score_interesse INT DEFAULT 50,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- TABELA DE HISTÓRICO DE CONVERSAS (MEMÓRIA DO AGENTE)
CREATE TABLE IF NOT EXISTS public.conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    papel TEXT NOT NULL, -- 'user', 'assistant', 'system'
    conteudo TEXT NOT NULL,
    tipo_midia TEXT DEFAULT 'texto', -- 'texto', 'audio', 'imagem', 'documento'
    midia_url TEXT,
    tokens_utilizados INT DEFAULT 0
);

-- TABELA DE TRANSAÇÕES E RECUPERAÇÃO DE VENDAS (M8)
CREATE TABLE IF NOT EXISTS public.transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL, -- 'stripe', 'braip', 'mercadopago'
    transacao_externa_id TEXT UNIQUE,
    valor_centavos INT NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'paid', 'expired', 'canceled'
    metodo_pagamento TEXT, -- 'pix', 'cartao', 'boleto'
    pix_codigo TEXT,
    pix_qrcode_url TEXT,
    checkout_url TEXT,
    recuperacao_tentativas INT DEFAULT 0,
    recuperado_com_sucesso BOOLEAN DEFAULT FALSE
);

-- TABELA DE CONFIGURAÇÕES E DIRETRIZES DO AGENTE
CREATE TABLE IF NOT EXISTS public.agente_configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_agente TEXT NOT NULL,
    tom_de_voz TEXT NOT NULL,
    prompt_sistema TEXT NOT NULL,
    faixa_horario_atendimento TEXT DEFAULT '24/7',
    regras_negativas JSONB DEFAULT '[]'::jsonb
);

-- ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON public.leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_etapa_funil ON public.leads(etapa_funil);
CREATE INDEX IF NOT EXISTS idx_conversas_lead_id ON public.conversas(lead_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON public.transacoes(status);
```

---

## 4. Cadência dos Fluxos de Recuperação e Follow-up (M8, M9 e M11)

### 4.1 Fluxo M8: Recuperação de Pix e Boletos Pendentes
- **Gatilho:** Webhook do gateway (Braip / Stripe / Mercado Pago) reportando transação gerada (`pix_generated`).
- **Disparo 1 (15 minutos pós-geração):** Mensagem de cortesia verificando se houve alguma instabilidade no app do banco e reenviando o código Pix Copia-e-Cola em balão isolado para facilidade de toque.
- **Disparo 2 (2 horas pós-geração):** Quebra de objeção sutil, reforçando a garantia incondicional e o início imediato do serviço.
- **Disparo 3 (20 horas pós-geração):** Aviso de expiração de reserva ou encerramento de lote promocional.

### 4.2 Fluxo M9: Reativação de Leads Frios (Reengajamento)
- **Gatilho:** Leads que iniciaram contato e não responderam há mais de 48 horas.
- **Abordagem:** Proibido perguntar *"você viu minha mensagem anterior?"*. O agente envia uma nova informação de valor ou um case de sucesso do mesmo nicho com uma pergunta simples de sim/não.

### 4.3 Fluxo M11: Follow-up de Onboarding Incompleto
- **Gatilho:** Aluno ou cliente comprou, mas não concluiu o cadastro/ficha inicial.
- **Ação:** O agente audita os campos pendentes (peso, idade, objetivo ou dados contratuais) e solicita especificamente os dados faltantes em formato conversacional.

---

## 5. Cibersegurança & Padrão Anti-Vibecoding

1. **Zero Segredos no Frontend:** O HTML/JS estático do cliente consome exclusivamente APIs protegidas intermediadas por Express ou FastAPI no backend.
2. **Rate Limiting Estrito:** Middleware Express `express-rate-limit` ativo por IP para prevenir ataques DDoS ou esgotamento de créditos da OpenAI/OpenRouter.
3. **Validação de Entrada:** Tratamento rigoroso de caracteres especiais, sanitização contra XSS e limitação de payloads a 30KB.
4. **Isolamento de Credenciais:** Arquivo `.env` na raiz do servidor com permissões `600`, nunca commitado no Git.

---

## 6. Como Apresentar e Vender este Sistema para Clientes High-Ticket

### 6.1 Os 3 Pilares da Proposta Comercial da ESG Tecnologia
1. **Infraestrutura Própria vs Aluguel:** *"Ao invés de você pagar R$ 1.500 todo mês para plataformas de chat que travam e cobram por lead, nós construímos o seu próprio servidor de IA. A tecnologia é sua, os dados são seus, e o custo mensal de servidor é de menos de R$ 50 reais."*
2. **Agente Humanizado vs Menus Robóticos:** *"Ninguém suporta mais digitar 1 para financeiro e 2 para suporte. Nosso agente atende por áudio, lê fotos, conversa como um consultor sênior da sua empresa e fecha vendas no primeiro contato."*
3. **CRM em Tempo Real:** *"Seu time não perde mais tempo preenchendo planilhas. A IA qualifica o lead, cadastra no banco de dados e avisa o gestor somente na hora de assinar o contrato ou realizar o atendimento VIP."*

### 6.2 Faixas de Precificação Recomendadas
- **Plano Entry (Implantação Essencial):** R$ 3.500 setup + R$ 890/mês.
- **Plano Pro (Ecossistema Completo WhatsApp + Instagram + CRM + Recuperação M8):** R$ 6.800 setup + R$ 1.490/mês.
- **Plano Enterprise (Multi-agentes, Visão Computacional, Voz Neural e Integração ERP):** R$ 12.000 a R$ 25.000 setup + R$ 2.900/mês.
