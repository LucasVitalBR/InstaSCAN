// api/check-code.js
// Confere o código do evento digitado no app (sem gastar crédito de IA).
const { checkEventCode, setNoCors } = require("./_security");

// Sem nome definido no Vercel, usa as letras do meio do código como nome
// (tira o prefixo fixo de 5 letras e os números do fim).
// Nomes que precisam de acento na tela (o código de acesso continua sem acento).
const ACENTOS = { Nathalia: "Nathália" };
function nameFromCode(v) {
  const m = /^[A-Z]{5}([A-Z]{2,20})\d{2}$/.exec(String(v || "").trim().toUpperCase());
  if (!m) return "";
  const nome = m[1].charAt(0) + m[1].slice(1).toLowerCase();
  return ACENTOS[nome] || nome;
}

module.exports = async function handler(req, res) {
  setNoCors(res);
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Método não permitido." });
    return;
  }
  const r = checkEventCode(req);
  if (!r.ok) {
    res.status(r.status).json({ ok: false, error: r.error });
    return;
  }
  res.status(200).json({ ok: true, nome: r.name || nameFromCode(req.headers["x-event-code"]) });
};
