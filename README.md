# ResponDM Carrossel — Fase 1 (fundação)

O que já está pronto nesta pasta:

- `index.html` — o site em si (React direto no navegador, sem instalação, igual o app de assinaturas). Já tem login Google travado pra você e o Pablo, e o esqueleto das 4 etapas do wizard.
- `worker/index.js` — o "cofre" que esconde as chaves da Anthropic e do Gemini, pra elas nunca aparecerem no navegador de quem visita o site.
- `firestore.rules` — a trava que garante que só você e o Pablo conseguem ler/gravar dados.

O que falta é só **criar as 3 contas gratuitas e colar as chaves nos lugares marcados com `COLE_AQUI`**. São ~15 minutos, sem precisar entender nada de código. Depois disso eu volto pra Fase 2 (o wizard de verdade: categorias, tema, roteiro).

---

## Passo 1 — Repositório novo no GitHub

O repositório `respondm` que você já usa é **privado**, e o GitHub Pages (hospedagem gratuita) só funciona em repositório **público**. Por isso precisa de um repositório novo, separado — é exatamente como o app de assinaturas já funciona.

1. No GitHub, crie um repositório novo, público, chamado por exemplo `respondm-carrossel`.
2. Suba os arquivos desta pasta (`index.html`, pasta `worker`, `firestore.rules`, este `README.md`) usando o "Upload files" do GitHub — igual você já faz com o app de assinaturas.
3. Em **Settings → Pages**, ative o GitHub Pages apontando pra branch `main`, pasta raiz.
4. Sua URL vai ficar algo como `https://SEU-USUARIO.github.io/respondm-carrossel/`. Anote essa URL, você vai precisar dela no Passo 3.

## Passo 2 — Projeto novo no Firebase

1. Vá em [console.firebase.google.com](https://console.firebase.google.com) → **Adicionar projeto**. Dê um nome, ex: `respondm-carrossel`.
2. Dentro do projeto: **Build → Firestore Database → Criar banco de dados** (modo produção, região `southamerica-east1` se disponível).
3. Ainda em Firestore, aba **Regras**: apague o conteúdo e cole o que está em `firestore.rules` desta pasta. Publicar.
4. **Build → Authentication → Sign-in method → Google** → ativar.
5. Em **Authentication → Settings → Domínios autorizados**, adicione a URL do GitHub Pages do Passo 1 (só o domínio, ex: `seu-usuario.github.io`).
6. Volte na tela inicial do projeto → ícone `</>` (Adicionar app da Web) → dê um nome e registre. O Firebase vai te mostrar um bloco `firebaseConfig = {...}`.
7. Copie os valores desse bloco (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) e cole no `index.html`, substituindo cada `COLE_AQUI` correspondente (linhas perto do topo do arquivo, dentro de `firebaseConfig`).

## Passo 3 — Cloudflare Worker (esconde as chaves de IA)

1. Crie uma conta gratuita em [dash.cloudflare.com](https://dash.cloudflare.com) (sem cartão de crédito).
2. **Workers & Pages → Create → Create Worker**. Dê um nome, ex: `respondm-carrossel-proxy`.
3. Abra o editor do Worker que foi criado, apague o código de exemplo e cole o conteúdo do arquivo `worker/index.js` desta pasta. Deploy.
4. Nas **Settings** do Worker → **Variables and Secrets**:
   - Adicione um secret `ANTHROPIC_API_KEY` com sua chave da Anthropic (console.anthropic.com → API Keys).
   - Adicione um secret `GEMINI_API_KEY` com a mesma chave que já está configurada no seu computador pro `imagem.py` (variável `GEMINI_API_KEY`).
   - Adicione uma variável (não-secreta) `ALLOWED_ORIGIN` com a URL do GitHub Pages do Passo 1, **sem barra no final** (ex: `https://seu-usuario.github.io`).
5. O Worker vai te dar uma URL própria, tipo `https://respondm-carrossel-proxy.SEU-USUARIO.workers.dev`. Cole essa URL no `index.html`, no lugar de `window.WORKER_URL="https://COLE_AQUI.workers.dev"`.

## Passo 4 — Testar

1. Suba o `index.html` atualizado (com as chaves coladas) pro repositório do GitHub (Passo 1).
2. Acesse a URL do GitHub Pages. Deve aparecer a tela de login.
3. Entre com Google (seu e-mail ou do Pablo). Deve cair na tela com as 4 etapas (Categoria, Tema, Roteiro, Slides) — todas ainda vazias, é esperado, isso é conteúdo da Fase 2.

Qualquer erro na tela de login costuma aparecer escrito em português (ex: "domínio não autorizado" = faltou o Passo 2.5).

---

**Depois que isso estiver no ar**, a Fase 2 (categorias de template, fluxo do wizard, geração de roteiro com a Anthropic) e a Fase 3 (o motor visual dos slides) entram com sua própria entrevista antes de eu escrever o código, como combinado.
