# Snuttverk

Nettsted for **Snuttverk** – korte videoer og innlegg for små bedrifter i Norge.  
Snuttverk er en del av **ML Digital** (MARTINEZ LOZANO INTERNASJONAL HANDEL, Org.nr. 935 407 095 MVA).

Statisk HTML + CSS. Ingen build-steg. Hosting: **Cloudflare Pages** (gratis).

**Midlertidig URL:** `https://snuttverk.pages.dev`  
**Domene snuttverk.no:** ikke kjøpt ennå (ledig hos Norid per 7. okt 2026).

> Norske tekster er utkast. Se `TEXTOS_NO_PARA_REVISAR.md` før publisering. Ikke annonser nettsiden før norsk er gjennomgått.

## Stack

- HTML + `styles.css` + `form.js` (vanilla, `defer`)
- Meny uten JS (`<details>`)
- Cloudflare Pages Function: `functions/api/kontakt.js`
- Base-URL i `site.config.json` + manuelt skript `scripts/set-base-url.mjs`

## Lokal forhåndsvisning

```bash
npx --yes serve -l 4173 .
# eller: python3 -m http.server 4173
```

Åpne `http://localhost:4173/`.

Bytte base-URL (når snuttverk.no er kjøpt):

```bash
node scripts/set-base-url.mjs https://snuttverk.no
```

## Cloudflare Pages – oppsett

### Alternativ A: Dashboard (anbefalt)

1. Gå til [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Velg repoet `willynoslo17/snuttverk`.
3. Prosjektnavn: `snuttverk` (gir `https://snuttverk.pages.dev`).
4. **Build command:** tom (la stå blank).
5. **Build output directory:** `/` (eller `.` / la stå som rot).
6. Deploy.
7. Hvis `snuttverk.pages.dev` allerede er opptatt: velg et annet prosjektnavn (f.eks. `snuttverk-oslo`), oppdater URL med  
   `node scripts/set-base-url.mjs https://<nytt-navn>.pages.dev` og push.

### Alternativ B: Wrangler

```bash
npx wrangler pages deploy . --project-name snuttverk
```

### Kontaktskjema (webhook)

Functionen `POST /api/kontakt` videresender lead som JSON til `KONTAKT_WEBHOOK_URL`.  
Hvis variabelen mangler, returneres `503` og frontenden viser `mailto:`-fallback.

Willy velger mottaker (f.eks. Make-webhook). Ingen nøkler i repoet.

```bash
npx wrangler pages secret put KONTAKT_WEBHOOK_URL --project-name snuttverk
```

Payload inkluderer `source: "snuttverk"`, `lang` (`nb`/`es`) og `timestamp`.

## Priser (eks. mva.)

| Pakke | Pris | Status |
|-------|------|--------|
| Start | 4 990 kr/mnd + 2 990 kr oppstart | Godkjent |
| Pluss | 8 990 kr/mnd + 2 990 kr oppstart | Forslag (TODO i HTML) |
| Annonsevideo | 7 900 kr engang | Forslag (TODO i HTML) |
| Meta-annonser | 2 990 kr/mnd | Forslag (TODO i HTML) |

## Struktur

Se rotmappen: `/`, `/pakker/`, `/video-og-ugc/`, `/slik-jobber-jeg/`, `/arbeid/`, `/kontakt/`, `/personvern/` og speil i `/es/`.

## TODO (Willy)

- Ekte foto (`img/willy.webp`)
- Bekrefte minimum 3 måneder for Start/Pluss
- Bekrefte priser Pluss, Annonsevideo, Meta-annonser
- 3 arbeider til Arbeid (med tillatelse fra Wecrops)
- Eksakte diplomititler (Toulouse Lautrec)
- Om Start inkluderer 1 opptaksøkt på stedet per måned
- Betalingsfrister og oppsigelsesvarsel
- `KONTAKT_WEBHOOK_URL`
- Aktivere søskennett når de er publisert
- Bytt til snuttverk.no når domenet er kjøpt
- Gjennomgang av norsk med Gemini (`TEXTOS_NO_PARA_REVISAR.md`)
