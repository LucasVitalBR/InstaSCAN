// api/analyze.js
// Vercel Serverless Function (Node.js, runtime 18+, fetch global disponível).
// Recebe o @ do Instagram + dados do perfil (automáticos ou digitados à mão) + contexto
// do negócio, monta o prompt mestre de diagnóstico comercial em 12 pilares, chama a IA
// (Anthropic ou OpenAI, o que estiver configurado) e devolve o relatório em JSON.

const PILLAR_TITLES = [
  "Posicionamento e clareza da marca",
  "Perfil e caminho de conversão",
  "Conteúdo e estratégia editorial",
  "Criativos, imagens e vídeos",
  "Stories e relacionamento",
  "Confiança e prova social",
  "Oferta e proposta comercial",
  "Métricas e desempenho",
  "Atendimento e processo de vendas",
  "Concorrência e mercado",
  "Distribuição e aquisição de público",
  "Coerência entre marketing e negócio",
];

const SYSTEM_PROMPT = `Você é uma consultora sênior de estratégia digital, marketing, comportamento do
consumidor e diagnóstico comercial, especializada em analisar perfis de empresas no Instagram
para identificar fatores que podem estar prejudicando seus resultados comerciais.

Sua função não é apenas avaliar se um perfil é bonito, publica com frequência ou tem bom
engajamento. Investigue como posicionamento, conteúdo, comunicação, oferta, relacionamento com
o público e processo de vendas se conectam para gerar — ou dificultar — oportunidades comerciais.

PRINCÍPIOS DE ANÁLISE
- Estratégia antes de tendências: não recomende formatos, trends ou frequência de postagem sem
  justificar a relevância para o negócio.
- Evidências antes de conclusões: diferencie o que foi observado, o que foi informado pelo
  responsável do negócio e o que é apenas hipótese.
- Negócio antes de métricas isoladas: seguidores, curtidas ou views não significam
  necessariamente bons resultados comerciais.
- Contexto antes de fórmulas: considere segmento, público, posicionamento, ticket médio, ciclo
  de compra e capacidade operacional.
- Priorização antes de volume: identifique os problemas mais relevantes antes de listar dezenas
  de tarefas.
- Recomendações executáveis: explique o que fazer, por que fazer e como avaliar o resultado.
- Responsabilidade analítica: NUNCA invente métricas, dados, comportamentos do público ou
  informações sobre concorrentes que não foram fornecidos.
- Marketing conectado a vendas: não atribua todo resultado negativo ao conteúdo sem considerar
  oferta, atendimento, preço, confiança e processo comercial.
- Quando faltar informação, diga isso claramente em "informacoes_necessarias" em vez de supor.

OS 12 PILARES DO DIAGNÓSTICO (avalie os 12, nesta ordem exata)
1. Posicionamento e clareza da marca — dá pra entender rápido o que a empresa oferece, pra quem,
   qual problema resolve e por que escolher ela.
2. Perfil e caminho de conversão — nome, foto, bio, link da bio e destino, destaques, facilidade
   de entender o próximo passo (pedir orçamento, comprar, visitar).
3. Conteúdo e estratégia editorial — os posts respondem dúvidas/objeções e levam a uma ação;
   não julgar como ruim só por ter poucas curtidas.
4. Criativos, imagens e vídeos — clareza visual, legibilidade, qualidade de apresentação do
   produto/serviço; estética bonita não é o mesmo que eficácia comercial.
5. Stories e relacionamento — só avalie se houver dado suficiente; sem acesso ao histórico,
   classifique como "precisa investigação", nunca como problema confirmado.
6. Confiança e prova social — depoimentos, cases, avaliações, demonstração da equipe/processo.
7. Oferta e proposta comercial — clareza e atratividade da oferta; não recomende desconto
   automaticamente, pense em melhorar a comunicação de valor.
8. Métricas e desempenho — alcance, visitas, cliques, contatos gerados; não trate correlação
   como causalidade nem invente benchmarks universais.
9. Atendimento e processo de vendas — normalmente não observável num perfil público; marque
   como "precisa investigação" a menos que haja dado explícito.
10. Concorrência e mercado — só compare com concorrentes se houver dados fornecidos; não copie
    estratégias automaticamente.
11. Distribuição e aquisição de público — adequação do conteúdo ao público desejado, origem
    provável dos seguidores.
12. Coerência entre marketing e negócio — a capacidade de atender à demanda é compatível com o
    que está sendo comunicado/prometido.

MÉTODO
Colete o que está disponível → audite os 12 pilares com evidências → procure padrões de gargalo
na jornada comercial (pouca gente chega ao perfil / muita gente visita mas pouca contata / muita
gente contata mas pouca compra / há vendas mas o negócio não cresce) → cruze os pilares entre si
→ priorize por impacto, esforço, urgência e confiança da evidência → transforme em plano de ação.

REGRAS DE COMPORTAMENTO
- Não dê recomendações genéricas ("poste mais", "faça Reels") sem justificativa estratégica.
- Nunca prometa crescimento, faturamento ou vendas garantidas.
- Nunca invente dados, estatísticas ou informações sobre o negócio ou a concorrência.
- Não interprete ausência de informação pública como prova de que uma prática não existe.
- Prefira poucas ações bem justificadas a uma lista extensa e genérica.
- Explique termos técnicos quando isso ajudar o responsável pelo negócio a entender.
- Adapte tudo ao segmento, público, objetivo comercial e recursos reais da empresa informados.

PRINTS / IMAGENS DO PERFIL
Quando houver imagens anexadas, elas são capturas de tela reais do perfil (tela inicial com bio,
grade de posts, posts abertos, destaques, painel de insights/visualizações). Leia com atenção:
- Extraia nome, foto, bio, link, número de seguidores/seguindo/publicações, destaques, temas e
  estilo visual dos posts, legendas visíveis, curtidas, comentários, visualizações, alcance e
  qualquer métrica do painel de insights que estiver legível.
- Use esses dados como evidência OBSERVADA (cite "no print" nas notas quando relevante).
- Se um número estiver ilegível ou cortado, não chute: diga que não foi possível ler.
- Dados digitados no formulário complementam ou corrigem os prints; em conflito, prefira o
  digitado e mencione a divergência.
- Avalie também a parte visual (pilar 4) a partir do que aparece nas imagens.

FORMATO DE SAÍDA
Responda SOMENTE com um objeto JSON válido (sem markdown, sem texto antes ou depois), seguindo
exatamente este formato:

{
  "perfil_lido": { "handle": "@ do perfil (lido do print ou informado)", "nome": "", "seguidores": "", "seguindo": "", "publicacoes": "" },
  "resumo_executivo": "2 a 4 frases em linguagem simples sobre a situação do perfil e as oportunidades mais relevantes",
  "pilares": [
    { "status": "good" | "opp" | "inv", "nota": "1-2 frases de justificativa, citando evidência" }
    // exatamente 12 itens, na mesma ordem dos 12 pilares acima. "good" = aspecto consistente,
    // "opp" = oportunidade de melhoria identificada, "inv" = precisa investigação adicional
  ],
  "gargalos": [
    { "titulo": "string curta", "evidencia": "o que sustenta isso", "impacto": "como afeta o objetivo comercial", "confianca": "Alta" | "Média" | "Baixa", "verificar": "o que precisaria ser checado pra confirmar" }
    // 2 a 4 itens, os mais relevantes
  ],
  "plano_acao": {
    "imediato": [ { "what": "o que fazer", "why": "por que", "effort": "Baixo" | "Médio" | "Alto" } ],
    "curto": [ { "what": "...", "why": "...", "effort": "..." } ],
    "medio": [ { "what": "...", "why": "...", "effort": "..." } ]
    // 1 a 3 ações por horizonte (imediato=7 dias, curto=30 dias, medio=60-90 dias)
  },
  "indicadores": ["3 a 5 indicadores de acompanhamento relevantes ao objetivo comercial informado"],
  "informacoes_necessarias": ["lacunas que mais limitam a confiabilidade deste diagnóstico"],
  "conclusao": "1-3 frases: o que priorizar agora e o que NÃO priorizar antes de resolver o gargalo principal"
}`;

const MAX_IMAGES = 6;

function sanitizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((s) => typeof s === "string" && /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(s))
    .slice(0, MAX_IMAGES);
}

function splitDataUrl(dataUrl) {
  const m = /^data:(image\/[a-z]+);base64,(.*)$/i.exec(dataUrl);
  return { mediaType: m[1].toLowerCase().replace("jpg", "jpeg"), data: m[2] };
}

function buildUserMessage({ handle, instagramData, negocio }, imageCount = 0) {
  const lines = [];
  lines.push(handle ? `@ do Instagram analisado: @${handle}` : "@ do Instagram: (não informado — identifique pelo print anexado)");
  lines.push("");
  lines.push("CONTEXTO DO NEGÓCIO (informado pelo responsável):");
  lines.push(`- Empresa: ${negocio?.empresa || "(não informado)"}`);
  lines.push(`- Segmento: ${negocio?.segmento || "(não informado)"}`);
  lines.push(`- Região atendida: ${negocio?.regiao || "(não informado)"}`);
  lines.push(`- Público-alvo: ${negocio?.publico || "(não informado)"}`);
  lines.push(`- Objetivo comercial principal: ${negocio?.objetivo || "(não informado)"}`);
  lines.push(`- Ticket médio: ${negocio?.ticket || "(não informado)"}`);
  lines.push(`- Canal de venda: ${negocio?.canal || "(não informado)"}`);
  lines.push(`- Principal dificuldade percebida: ${negocio?.dificuldade || "(não informado)"}`);
  lines.push("");

  lines.push("DADOS DO PERFIL DISPONÍVEIS:");
  if (instagramData?.fonte === "print") {
    lines.push("(nenhum dado digitado — extraia tudo dos prints anexados)");
  } else if (instagramData?.fonte === "auto") {
    lines.push("(obtidos automaticamente a partir do @ informado)");
  } else {
    lines.push("(digitados manualmente por quem está conduzindo a análise, olhando o perfil)");
  }
  if (instagramData?.nome) lines.push(`- Nome no perfil: ${instagramData.nome}`);
  if (instagramData?.categoria) lines.push(`- Categoria: ${instagramData.categoria}`);
  if (instagramData?.seguindo != null) lines.push(`- Seguindo: ${instagramData.seguindo}`);
  if (instagramData?.publicacoes != null) lines.push(`- Publicações: ${instagramData.publicacoes}`);
  lines.push(`- Bio: ${instagramData?.bio || "(não informado)"}`);
  lines.push(`- Seguidores: ${instagramData?.seguidores || "(não informado)"}`);
  lines.push(`- Link da bio: ${instagramData?.link || "(não informado / sem link)"}`);
  if (Array.isArray(instagramData?.posts) && instagramData.posts.length) {
    lines.push("- Posts recentes:");
    instagramData.posts.forEach((p, i) => {
      lines.push(
        `  ${i + 1}. Legenda: "${p.caption || "(sem legenda informada)"}" — curtidas: ${
          p.likes ?? "?"
        }, comentários: ${p.comments ?? "?"}${p.views != null ? `, visualizações: ${p.views}` : ""}`
      );
    });
  } else {
    lines.push("- Posts recentes: (não informado)");
  }
  lines.push("");
  if (imageCount > 0) {
    lines.push(
      `PRINTS ANEXADOS: ${imageCount} captura(s) de tela do perfil seguem nesta mensagem. Extraia delas todos os dados visíveis (bio, seguidores, posts, curtidas, comentários, visualizações, insights) e use como evidência principal.`
    );
    lines.push("");
  }
  lines.push(
    "Gere o diagnóstico completo seguindo exatamente o formato JSON definido nas instruções do sistema."
  );
  return lines.join("\n");
}

function extractJson(text) {
  // Remove eventuais cercas de código ```json ... ``` caso o modelo as inclua.
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(cleaned);
}

async function callAnthropic(userMessage, images = []) {
  const content = [
    ...images.map((d) => {
      const { mediaType, data } = splitDataUrl(d);
      return { type: "image", source: { type: "base64", media_type: mediaType, data } };
    }),
    { type: "text", text: userMessage },
  ];
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${errText}`);
  }
  const data = await resp.json();
  const text = data?.content?.[0]?.text || "";
  return extractJson(text);
}

async function callOpenAI(userMessage, images = []) {
  const userContent = images.length
    ? [
        { type: "text", text: userMessage },
        ...images.map((url) => ({ type: "image_url", image_url: { url, detail: "high" } })),
      ]
    : userMessage;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      // Com prints usamos o gpt-4o (leitura de números em imagem bem mais confiável).
      model: images.length ? "gpt-4o" : "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errText}`);
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return extractJson(text);
}

function validateReport(report) {
  if (!report || typeof report !== "object") throw new Error("Resposta da IA não é um objeto.");
  // Normaliza em vez de falhar: corta excesso, completa faltantes, corrige status.
  let pilares = Array.isArray(report.pilares) ? report.pilares.slice(0, PILLAR_TITLES.length) : [];
  while (pilares.length < PILLAR_TITLES.length) {
    pilares.push({ status: "inv", nota: "Sem dados suficientes para avaliar este pilar." });
  }
  const map = { good: "good", opp: "opp", inv: "inv", consistente: "good", oportunidade: "opp", investigar: "inv" };
  report.pilares = pilares.map((p) => {
    const obj = p && typeof p === "object" ? p : { nota: String(p || "") };
    return { status: map[String(obj.status || "").toLowerCase()] || "inv", nota: obj.nota || obj.justificativa || "" };
  });
  return report;
}

function friendlyError(msg) {
  const m = String(msg || "");
  if (/insufficient_quota|exceeded your current quota|billing/i.test(m))
    return "A conta da OpenAI está sem créditos (ou sem forma de pagamento) para usar a API. Adicione créditos em platform.openai.com > Billing.";
  if (/invalid_api_key|Incorrect API key|401/.test(m))
    return "A chave da OpenAI configurada no Vercel é inválida. Gere uma nova e atualize a variável OPENAI_API_KEY.";
  if (/model_not_found|does not have access to model/i.test(m))
    return "A conta da OpenAI não tem acesso ao modelo usado. Verifique o projeto/limites da chave.";
  if (/rate_limit|429/.test(m))
    return "A OpenAI limitou as requisições agora (rate limit). Espere 1 minuto e tente de novo.";
  if (/Unexpected token|JSON/i.test(m))
    return "A IA respondeu fora do formato esperado. Tente de novo.";
  return "Não foi possível gerar o diagnóstico agora. Tente novamente em instantes.";
}

module.exports = async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido. Use POST." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const handle = (body?.handle || "").trim().replace(/^@/, "");
    const images = sanitizeImages(body?.images);
    if (!handle && !images.length) {
      res.status(400).json({ error: "Informe o @ do Instagram ou envie uma foto da tela do perfil." });
      return;
    }

    const userMessage = buildUserMessage(body, images.length);

    let report;
    if (process.env.ANTHROPIC_API_KEY) {
      report = await callAnthropic(userMessage, images);
    } else if (process.env.OPENAI_API_KEY) {
      report = await callOpenAI(userMessage, images);
    } else {
      res.status(500).json({
        error:
          "Nenhuma chave de IA configurada no servidor (ANTHROPIC_API_KEY ou OPENAI_API_KEY). Configure em Project Settings > Environment Variables no Vercel.",
      });
      return;
    }

    validateReport(report);
    const finalHandle = handle || String(report?.perfil_lido?.handle || "").replace(/^@/, "");
    res.status(200).json({ handle: finalHandle, pillarTitles: PILLAR_TITLES, report });
  } catch (err) {
    console.error("Erro em /api/analyze:", err);
    res.status(502).json({
      error: friendlyError(err?.message || err),
      detail: String(err?.message || err).replace(/sk-[A-Za-z0-9_\-*]+/g, "sk-***").slice(0, 400),
    });
  }
};
