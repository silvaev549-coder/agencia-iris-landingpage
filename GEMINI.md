# Diretrizes e Memória Central — ESG Tecnologia & Agência de Agentes de IA

Este documento é lido automaticamente no início de **toda e qualquer nova conversa** no Antigravity para este projeto e para o workspace `siteCRM` / `agencia-iris-landingpage`.

---

## 1. Contexto, Identidade e Missão
- **Fundador & CEO:** Evandro Silva Gallina (`evandrosilvagallina.cloud`).
- **Empresa:** ESG Tecnologia / Agência de IA.
- **Missão:** Desenvolver, implementar e escalar **Sistemas Autônomos de IA, Agentes de Vendas de Alta Conversão, Automações no n8n, Instâncias na Evolution API e CRMs Personalizados** para empresas que exigem máxima conversão e soberania de dados (Clínicas Médicas, E-commerce High-Ticket, Imobiliárias e Negócios de Serviços).
- **Cases de Sucesso Homologados:**
  * **Marcão Personal (`marcaopersonal.com`):** Ecossistema autônomo com agentes de vendas no WhatsApp e Instagram Direct, leitura multimodal de balanças BLE por visão computacional, recuperação de carrinhos/Pix (M8) e follow-ups automáticos (M9/M11).
  * **Íris Secretária de IA:** Agente humanizada para clínicas médicas e odontológicas com agendamento direto na agenda, confirmação inteligente e reengajamento de pacientes.

---

## 2. A Stack Tecnológica Mestre (Soberana & Privada)
- **Infraestrutura em Nuvem:** VPS Linux (Ubuntu 22.04/24.04 LTS) gerenciada via **Coolify v4** (PaaS auto-hospedado com Docker e Traefik para SSL automático).
- **Orquestração de Automações:** **n8n** auto-hospedado (Workflows robustos com Webhooks, HTTP Requests, nós de código JS/Python, retry automático e tratamento de erros).
- **Conectividade WhatsApp:** **Evolution API v2** (Baileys engine, instâncias isoladas multi-tenant, webhooks em tempo real, suporte nativo a áudio PTT Opus, reações de emojis e presença digitando).
- **Banco de Dados & Backend:** **Supabase** (PostgreSQL, Row Level Security, autenticação, Edge Functions, pgvector para RAG/Base de Conhecimento e APIs REST instantâneas).
- **Canal Instagram:** **Meta Graph API Oficial** (Webhooks para menções, comentários e Direct Messages, respostas instantâneas via DM, automação humanizada).
- **Modelos de Linguagem (LLMs):** Gemini 2.5 Flash, Claude 3.5 Sonnet, GPT-4o e Llama 3 via **OpenRouter** e Google API direta.
- **Voz & Visão Multimodal:**
  * Whisper / Groq para transcrição de áudio em menos de 1 segundo.
  * F5-TTS / ElevenLabs para geração de áudios neurais ultra-realistas (PTT nativo de WhatsApp).
  * Gemini Multimodal Vision para leitura de fotos de exames, pratos de comida, prints de bioimpedância e documentos fiscais.
- **Gateways de Pagamento & Checkout:** Stripe (assinaturas e cartão) e Braip (Pix, cartão e boleto com postbacks em tempo real e recuperação M8).

---

## 3. Regras Invioláveis de Fala do Agente de Vendas
1. **PROIBIDO ENVIAR TEXTÕES EM BLOCO ÚNICO:** Tanto no WhatsApp quanto no Instagram Direct, o agente NUNCA deve responder em um bloco longo de texto.
2. **OBRIGATÓRIO ENVIAR EM 2 A 4 BALÕES CURTOS:** Cada resposta deve ser fatiada em múltiplos balões curtos e ágeis (50 a 140 caracteres, máximo de 160 caracteres por balão), separados por quebra de linha dupla (`\n\n`).
3. **OBRIGATÓRIO SIMULAR DIGITAÇÃO (PRESENÇA COMPOSING) & DELAYS:** Antes de cada balão enviado via Evolution API, disparar evento `composing` com delay natural de 1.2s a 2.5s.
4. **OBRIGATÓRIO REAGIR COM EMOJIS NOS BALÕES DOS LEADS:** Sempre que um cliente enviar uma mensagem, o agente reage imediatamente no balão com emojis adequados ao nicho (saúde: 🩺✨💙; vendas/fitness: 👊💪🦁; negócios: 🤝💼🚀).
5. **POSTURA CLOSER DE VENDAS:** O agente nunca é passivo. Trata objeções na raiz, decompõe o investimento em custo por dia (ex: *"menos que um cafezinho por dia"*) e direciona com um CTA claro no último balão.

---

## 4. Regras Invioláveis de Cibersegurança & Engenharia (Anti-Vibecoding)
1. **ZERO VAZAMENTO DE SEGREDOS NO FRONTEND (PILAR 1):** Proibido expor chaves privadas (`sk_...`, `SUPABASE_SERVICE_ROLE_KEY`, `EVOLUTION_API_KEY`, Meta tokens) no código do cliente (HTML, JS, frameworks front-end). Toda requisição passa por endpoints server-side protegidos que leem o `.env`.
2. **AUTENTICAÇÃO SERVER-SIDE (PILAR 2):** Rotas administrativas e dados sensíveis de clientes DEVEM exigir autenticação via token assinado (HMAC-SHA256) ou cookie HTTP-Only. Rejeição com HTTP 401 Unauthorized se inválido.
3. **RATE LIMITING OBRIGATÓRIO (PILAR 3):**
   * Login / Autenticação: Máximo de 5 tentativas por 15 minutos (anti-brute force).
   * Telemetria / Leads públicos: Máximo de 30 requisições por minuto.
   * IA / Processamento pesado: Máximo de 3 a 10 requisições por minuto.
4. **CABEÇALHOS DE SEGURANÇA & PAYLOAD (HELMET):** Helmet ativo com `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, HSTS e payload JSON limitado a 30KB no front público e 100KB no admin.

---

## 5. Regras Invioláveis de Autonomia Operacional
1. **EXECUÇÃO DIRETA E AUTÔNOMA TOTAL:** O assistente NUNCA deve fazer perguntas solicitando autorização, permissão ou confirmação para executar tarefas técnicas ou operacionais. Toda e qualquer instrução do Diretor Evandro deve ser executada de ponta a ponta.
2. **ZERO INTERRUPÇÃO POR CAIXAS DE DIÁLOGO DE URL/REDE:** Proibido utilizar ferramentas ou comandos que disparem modais de segurança pedindo permissão de URL na interface do Antigravity. Requisições e downloads devem ser feitos via terminal (`curl` ou Python scripts).
3. **PROIBIDO USAR FERRAMENTAS DE INTERROGAÇÃO (`ask_question`):** Decisões técnicas devem ser resolvidas com excelência técnica e alinhamento a este documento.

---

## 6. Framework Comercial da Agência ESG Tecnologia
- **Posicionamento:** Não vendemos software de prateleira nem chatbots de menus genéricos. Entregamos uma **Operação de IA Privada e Soberana**, construída sob medida para o negócio do cliente na infraestrutura dele.
- **Tabela de Ofertas:**
  * **Setup de Implantação:** R$ 3.500 a R$ 15.000 (abrangendo VPS, n8n, Evolution API, Supabase, treinamento do agente e integração CRM).
  * **Retainer Mensal (Manutenção & Evolução):** R$ 900 a R$ 3.500/mês (abrangendo monitoramento, ajustes finos de prompt, novos fluxos de recuperação e suporte).
- **Proposta de Valor Imbatível:**
  * Dados 100% seguros e privados (LGPD compliant).
  * Zero mensalidades abusivas por atendente (como cobram Zendesk, Blip ou Manychat).
  * Atendimento 24/7 humanizado com voz, visão e integração total ao CRM.
