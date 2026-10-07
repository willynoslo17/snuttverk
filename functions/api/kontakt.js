const ALLOWED_PAKKER = new Set([
  "start",
  "pluss",
  "annonsevideo",
  "meta-annonser",
  "usikker",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function clip(value, max) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const navn = clip(body.navn, 120);
  const epost = clip(body.epost, 200).toLowerCase();
  const pakke = clip(body.pakke, 40);
  const honeypot = clip(body.website, 10);
  const samtykke = body.samtykke === true;
  const lang = body.lang === "es" ? "es" : "nb";

  if (honeypot) {
    return json(200, { ok: true });
  }

  if (!navn || !EMAIL_RE.test(epost) || !samtykke || !ALLOWED_PAKKER.has(pakke)) {
    return json(400, { ok: false, error: "validation" });
  }

  const webhook = env && env.KONTAKT_WEBHOOK_URL;
  if (!webhook) {
    return json(503, { ok: false, error: "not_configured" });
  }

  const payload = {
    source: "snuttverk",
    lang,
    timestamp: new Date().toISOString(),
    navn,
    bedrift: clip(body.bedrift, 160),
    epost,
    telefon: clip(body.telefon, 40),
    nettside: clip(body.nettside, 200),
    melding: clip(body.melding, 4000),
    pakke,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      return json(502, { ok: false, error: "upstream" });
    }
    return json(200, { ok: true });
  } catch {
    clearTimeout(timer);
    return json(502, { ok: false, error: "upstream" });
  }
}
