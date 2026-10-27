# InstaScan — versão real (evento SENAI)

App completo: página (`public/index.html`) + 2 funções de backend (`api/analyze.js` e
`api/instagram-lookup.js`), pronto pra rodar de graça no Vercel.

## O que isso resolve
- **Qualquer @ não privado**: tenta buscar bio, seguidores, link e posts recentes
  automaticamente. Se o Instagram bloquear a busca automática (acontece — não é bug, é
  limitação conhecida), a pessoa que estiver conduzindo a demo digita os mesmos dados em
  ~30 segundos olhando o perfil no celular. O relatório sai igual nos dois casos.
- **Diagnóstico real**: usa a IA (Anthropic ou OpenAI) com o prompt mestre de 12 pilares.
- **100% gratuito**: hospedagem no plano free do Vercel + custo de IA por chamada (poucos
  centavos cada, dentro dos créditos que você já tem).

## O que você precisa fazer antes do evento (passo a passo)

### 1. Criar conta no Vercel (grátis)
Acesse vercel.com e crie uma conta (pode entrar com GitHub). Isso eu não posso fazer por
você — é uma conta sua.

### 2. Subir este projeto
A forma mais simples:
1. Crie um repositório no GitHub e suba esta pasta (`instascan-app/`) nele.
2. No Vercel, clique em "Add New > Project", escolha esse repositório e clique em Deploy.
   O Vercel detecta sozinho que é um projeto com `api/` (serverless functions) + `public/`
   (site estático) — não precisa configurar nada a mais.

Alternativa sem GitHub: instale a CLI (`npm i -g vercel`), rode `vercel` dentro da pasta
`instascan-app/` e siga as perguntas (`vercel login` abre o navegador pra você entrar).

### 3. Configurar a chave de IA
No painel do projeto no Vercel: **Settings > Environment Variables**. Adicione UMA destas
(não precisa das duas):
- `OPENAI_API_KEY` — a chave da sua conta OpenAI (você já tem créditos lá)
- `ANTHROPIC_API_KEY` — se preferir usar a Anthropic

Opcional — consulta pelo @ que funciona de verdade:
- `APIFY_TOKEN` — token da sua conta na Apify (apify.com, plano grátis com créditos mensais).
  Sem ele, o app tenta a consulta não-oficial, que o Instagram costuma bloquear (erro 429)
  quando vem de servidores como o Vercel. Com ou sem ele, a opção de foto sempre funciona.

Depois de salvar a variável, faça um **novo deploy** (Vercel > Deployments > ⋯ > Redeploy)
pra ela entrar em vigor.

Nunca cole a chave direto no código ou me envie a chave aqui no chat — ela fica só no
painel do Vercel.

### 4. Pegar o link
Depois do deploy, o Vercel te dá uma URL tipo `instascan-app.vercel.app`. Esse é o link
público pra pessoa testar com você no evento.

## Checklist antes do evento
- [ ] Testar com 3-4 contas reais de empresas (de preferência do nicho industrial/comercial)
      pra ver se a busca automática funciona pra elas; se não funcionar, já saber que vai
      precisar digitar manual e treinar isso
- [ ] Confirmar que o Wi-Fi do local do evento não bloqueia o domínio `*.vercel.app` nem
      `api.openai.com` / `api.anthropic.com` (às vezes Wi-Fi de instituição bloqueia)
- [ ] Testar o fluxo completo num celular (não só no notebook) — provavelmente é assim que
      vão testar no estande
- [ ] Ter um plano B: se a internet do local falhar, use o hotspot do celular

## Limitações que valem explicar pra quem for testar
- A busca automática do Instagram não é uma API oficial — pode falhar, especialmente se o
  perfil tiver poucos posts públicos ou se o Instagram decidir bloquear o acesso automático
  naquele momento. O preenchimento manual existe exatamente por isso.
- O diagnóstico é gerado por IA a partir dos dados informados — é um ponto de partida
  estratégico, não uma avaliação definitiva.

## Depois do evento
Esse README fica junto do código — qualquer ajuste de prompt, de pilares ou de layout é só
mexer em `api/analyze.js` (o texto do prompt mestre) ou em `public/index.html` (a interface)
e fazer um novo deploy.
