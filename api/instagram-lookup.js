const { checkEventCode, cleanHandle, setNoCors } = require("./_security");
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

// Consulta via Apify (serviço de scraping com proxies residenciais). Só é usada se a variável
// APIFY_TOKEN estiver configurada no Vercel. O plano gratuito da Apify dá créditos mensais
// suficientes para um evento (cada perfil custa frações de centavo de dólar).
async function fetchViaApify(username) {
  const url = "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?timeout=40";
  const resp = await withTimeout(
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + process.env.APIFY_TOKEN },
      body: JSON.stringify({ usernames: [username] }),
    }),
    45000
  );
  if (!resp.ok) throw new Error(`Apify respondeu ${resp.status}`);
  const items = await resp.json();
  const u = Array.isArray(items) ? items[0] : null;
  if (!u || u.error || !u.username) throw new Error("Perfil não encontrado.");
  if (u.private) throw new Error("Conta privada - não é possível analisar automaticamente.");
  const posts = (u.latestPosts || []).slice(0, 6).map((p) => ({
    caption: p.caption || "",
    likes: p.likesCount ?? null,
    comments: p.commentsCount ?? null,
    views: p.videoViewCount ?? p.videoPlayCount ?? null,
    thumbnail: p.displayUrl || null,
  }));
  return {
    fonte: "auto",
    nome: u.fullName || "",
    bio: u.biography || "",
    seguidores: u.followersCount ?? null,
    seguindo: u.followsCount ?? null,
    publicacoes: u.postsCount ?? null,
    categoria: u.businessCategoryName && u.businessCategoryName !== "None" ? u.businessCategoryName : "",
    link: u.externalUrl || "",
    posts,
  };
}

module.exports = async function handler(req, res) {
  setNoCors(res);
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Método não permitido." });
    return;
  }
  const gate = checkEventCode(req);
  if (!gate.ok) {
    res.status(gate.status).json({ ok: false, error: gate.error, code: "event_code" });
    return;
  }

  const handle = cleanHandle(req.query?.handle);
  if (!handle) {
    res.status(400).json({ ok: false, error: handle === null ? "Esse @ não parece válido." : "Informe o @ do Instagram." });
    return;
  }

  try {
    let data;
    if (process.env.APIFY_TOKEN) {
      try {
        data = await fetchViaApify(handle);
      } catch (e) {
        if (/privada|não encontrado/i.test(String(e.message))) throw e;
        data = await fetchPublicProfile(handle);
      }
    } else {
      data = await fetchPublicProfile(handle);
    }
    res.status(200).json({ ok: true, data });
  } catch (err) {
    // Falha esperada (bloqueio, conta privada, não encontrado): o app pede a foto.
    res.status(200).json({ ok: false, error: String(err?.message || err).replace(/apify_api_[A-Za-z0-9]+/g, "apify_api_***").slice(0, 200) });
  }
};
