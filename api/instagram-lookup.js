// api/instagram-lookup.js
// Tentativa de buscar dados públicos de um perfil do Instagram automaticamente, SEM chave
// paga, usando o endpoint público não-oficial que o próprio site usa para montar a página
// de perfil. Isso NÃO é uma API oficial, não tem contrato de estabilidade e o Instagram pode
// bloquear, exigir login ou mudar o formato a qualquer momento - por isso o app SEMPRE precisa
// funcionar também com preenchimento manual (ver public/index.html).
//
// Trate o retorno "ok: false" como caso normal e esperado, não como bug.

const TIMEOUT_MS = 6000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

async function fetchPublicProfile(username) {
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
    username
  )}`;

  const resp = await withTimeout(
    fetch(url, {
      headers: {
        // Cabeçalhos usados pelo próprio site ao montar a página de perfil pública.
        "x-ig-app-id": "936619743392459",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "*/*",
      },
    }),
    TIMEOUT_MS
  );

  if (!resp.ok) {
    throw new Error(`Instagram respondeu ${resp.status}`);
  }
  const data = await resp.json();
  const user = data?.data?.user;
  if (!user) throw new Error("Perfil não encontrado ou é privado.");
  if (user.is_private) throw new Error("Conta privada - não é possível analisar automaticamente.");

  const posts = (user.edge_owner_to_timeline_media?.edges || [])
    .slice(0, 6)
    .map((e) => ({
      caption: e?.node?.edge_media_to_caption?.edges?.[0]?.node?.text || "",
      likes: e?.node?.edge_liked_by?.count ?? e?.node?.edge_media_preview_like?.count ?? null,
      comments: e?.node?.edge_media_to_comment?.count ?? null,
      thumbnail: e?.node?.thumbnail_src || e?.node?.display_url || null,
    }));

  return {
    fonte: "auto",
    bio: user.biography || "",
    seguidores: user.edge_followed_by?.count ?? null,
    link: user.external_url || "",
    posts,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const handle = String(req.query?.handle || "").trim().replace(/^@/, "");
  if (!handle) {
    res.status(400).json({ ok: false, error: "Informe o @ do Instagram." });
    return;
  }

  try {
    const data = await fetchPublicProfile(handle);
    res.status(200).json({ ok: true, data });
  } catch (err) {
    // Falha esperada e comum (bloqueio, timeout, conta privada, etc.) - o frontend cai
    // automaticamente para o preenchimento manual.
    res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
};
