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
  res.status(200).json({ ok: true, nome: r.name || "" });
};
