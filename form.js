(() => {
  const ALLOWED = new Set(["start", "pluss", "annonsevideo", "meta-annonser", "usikker"]);
  const ENDPOINT = "https://ml-inbox.willynoslo17.workers.dev/lead";
  const form = document.getElementById("kontakt-form");
  if (!form) return;

  const select = form.querySelector('[name="pakke"]');
  const msg = document.getElementById("form-msg");
  const submitBtn = form.querySelector('button[type="submit"]');
  const tsInput = form.querySelector('[name="ts"]');

  const params = new URLSearchParams(window.location.search);
  const pakke = params.get("pakke");
  if (select) {
    select.value = ALLOWED.has(pakke) ? pakke : "usikker";
  }

  if (tsInput) {
    tsInput.value = String(Date.now());
  }

  function setStatus(text, kind) {
    if (!msg) return;
    msg.hidden = false;
    msg.className = kind ? `form-msg ${kind}` : "form-msg";
    msg.textContent = text;
  }

  function resetTurnstile() {
    if (window.turnstile && typeof window.turnstile.reset === "function") {
      window.turnstile.reset();
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token =
      (form.querySelector('[name="cf-turnstile-response"]') &&
        form.querySelector('[name="cf-turnstile-response"]').value) ||
      "";

    if (!token) {
      setStatus("Vent til sikkerhetssjekken er ferdig, og prøv igjen.", "err");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    const data = new FormData(form);
    const telefono = String(data.get("telefon") || "").trim();
    const payload = {
      nombre: String(data.get("navn") || "").trim(),
      email: String(data.get("epost") || "").trim(),
      telefono: telefono || "",
      mensaje: String(data.get("melding") || "").trim(),
      marca: "snuttverk",
      pagina: window.location.pathname,
      turnstile_token: token,
      website: String(data.get("website") || ""),
      ts: Number(data.get("ts") || Date.now()),
    };

    if (form.querySelector('[name="bedrift"]')) {
      payload.empresa = String(data.get("bedrift") || "").trim();
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        setStatus(
          "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.",
          "ok"
        );
        form.reset();
        if (select) select.value = "usikker";
        if (tsInput) tsInput.value = String(Date.now());
      } else if (res.status === 429) {
        setStatus("For mange forsøk. Vent et minutt og prøv igjen.", "err");
      } else if (res.status === 403) {
        setStatus(
          "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.",
          "err"
        );
      } else {
        setStatus(
          "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@mlinternasjonal.no.",
          "err"
        );
      }
    } catch {
      setStatus(
        "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@mlinternasjonal.no.",
        "err"
      );
    } finally {
      resetTurnstile();
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
