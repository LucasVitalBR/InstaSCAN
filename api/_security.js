// api/_security.js
// Utilitários de segurança compartilhados pelas funções da pasta api/.
// (Arquivos que começam com "_" não viram rota no Vercel.)

const crypto = require("crypto");

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

function normCode(v) {
  return String(v || "").trim().toUpperCase();
}

// Confere o código do evento. A variável EVENT_CODE no Vercel pode ter um código só
// ("INSTANOME26") ou vários separados por vírgula, um por pessoa ("CODIGOA,CODIGOB,CODIGOC").
// Para cortar o acesso de um aluno, é só tirar o código dele da lista e republicar.
// Se a variável não existir, bloqueia tudo: melhor o app parado do que aberto sem controle.
function sameText(a, b) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function checkEventCode(req) {
  const list = String(process.env.EVENT_CODE || "").split(",").map(normCode).filter(Boolean);
  if (!list.length) return { ok: false, status: 503, error: "O código do evento ainda não foi configurado no servidor." };
  const got = normCode(req.headers["x-event-code"]);
  let idx = -1;
  list.forEach((c, i) => { if (got && sameText(got, c)) idx = i; });
  if (idx < 0) return { ok: false, status: 401, error: "Código do evento inválido. Peça o seu código ao professor e digite de novo." };
  return { ok: true, slot: idx + 1 };
}

function cleanStr(v, max) {
  if (v == null) return "";
  return String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);
}
function cleanNum(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return cleanStr(v, 20);
}

function cleanHandle(v) {
  const h = String(v || "").trim().replace(/^@/, "");
  if (!h) return "";
  return HANDLE_RE.test(h) ? h : null; // null = inválido
}

// Limita o tamanho de tudo o que vai para a IA (evita custo alto com textos gigantes).
function sanitizeAnalyzeBody(body) {
  const neg = body && typeof body.negocio === "object" && body.negocio ? body.negocio : {};
  const ig = body && typeof body.instagramData === "object" && body.instagramData ? body.instagramData : {};
  const negocio = {};
  ["empresa", "segmento", "regiao", "publico", "objetivo", "ticket", "canal", "dificuldade"].forEach((k) => {
    negocio[k] = cleanStr(neg[k], 200);
  });
  const fonte = ["print", "auto", "manual"].includes(ig.fonte) ? ig.fonte : "manual";
  const posts = (Array.isArray(ig.posts) ? ig.posts : []).slice(0, 6).map((p) => ({
    caption: cleanStr(p && p.caption, 600),
    likes: cleanNum(p && p.likes),
    comments: cleanNum(p && p.comments),
    views: cleanNum(p && p.views),
  }));
  const instagramData = {
    fonte,
    nome: cleanStr(ig.nome, 120),
    categoria: cleanStr(ig.categoria, 80),
    bio: cleanStr(ig.bio, 600),
    link: cleanStr(ig.link, 300),
    seguidores: cleanNum(ig.seguidores),
    seguindo: cleanNum(ig.seguindo),
    publicacoes: cleanNum(ig.publicacoes),
    posts,
  };
  return { negocio, instagramData };
}

function setNoCors(res) {
  // Sem cabeçalho Access-Control-Allow-Origin: só o próprio site consegue chamar pelo navegador.
  res.setHeader("cache-control", "no-store");
}

module.exports = { checkEventCode, cleanHandle, sanitizeAnalyzeBody, setNoCors };
