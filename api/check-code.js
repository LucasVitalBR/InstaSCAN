// api/check-code.js
// Confere o código do evento digitado no app (sem gastar crédito de IA).
const { checkEventCode, setNoCors } = require("./_security");

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
  // Nome de quem entrou, tirado do próprio código no formato INSTA + NOME + 26.
  const raw = String(req.headers["x-event-code"] || "").trim().toUpperCase();
  const m = /^INSTA([A-ZÀ-Ý]{2,20})\d{2}$/.exec(raw);
  const nome = m ? m[1].charAt(0) + m[1].slice(1).toLowerCase() : "";
  res.status(200).json({ ok: true, nome });
};
