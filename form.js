(() => {
const FORM_I18N = {
  "en": {
    "Vent til sikkerhetssjekken er ferdig, og prøv igjen.": "Wait for the security check to finish and try again.",
    "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.": "Thanks! Your message has been sent. We will contact you as soon as possible.",
    "For mange forsøk. Vent et minutt og prøv igjen.": "Too many attempts. Wait a minute and try again.",
    "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.": "We could not verify that you are human. Please reload the page and try again.",
    "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@snuttverk.no.": "Sorry, something went wrong. Try again, or send us an e-mail at kontakt@snuttverk.no."
  },
  "sv": {
    "Vent til sikkerhetssjekken er ferdig, og prøv igjen.": "Vänta tills säkerhetskontrollen är klar och försök igen.",
    "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.": "Tack! Ditt meddelande har skickats. Vi kommer att kontakta dig så snart som möjligt.",
    "For mange forsøk. Vent et minutt og prøv igjen.": "För många försök. Vänta en minut och försök igen.",
    "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.": "Vi kunde inte verifiera att du är människa. Ladda om sidan och försök igen.",
    "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@snuttverk.no.": "Tyvärr, något gick fel. Försök igen, eller skicka oss ett e-postmeddelande på kontakt@snuttverk.no."
  },
  "pl": {
    "Vent til sikkerhetssjekken er ferdig, og prøv igjen.": "Poczekaj na zakończenie kontroli bezpieczeństwa i spróbuj ponownie.",
    "Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig.": "Dzięki! Twoja wiadomość została wysłana. Skontaktujemy się z Tobą tak szybko, jak to możliwe.",
    "For mange forsøk. Vent et minutt og prøv igjen.": "Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.",
    "Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen.": "Nie mogliśmy zweryfikować, czy jesteś człowiekiem. Załaduj ponownie stronę i spróbuj ponownie.",
    "Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@snuttverk.no.": "Przepraszamy, coś poszło nie tak. Spróbuj ponownie lub wyślij nam e-mail na adres kontakt@snuttverk.no."
  }
};
const FORM_LANG = (document.documentElement.lang || "nb").slice(0, 2);
const T = (s) => (FORM_I18N[FORM_LANG] && FORM_I18N[FORM_LANG][s]) || s;

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
      setStatus(T("Vent til sikkerhetssjekken er ferdig, og prøv igjen."), "err");
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
        setStatus(T("Takk! Meldingen din er sendt. Vi tar kontakt så snart som mulig."),
          "ok"
        );
        form.reset();
        if (select) select.value = "usikker";
        if (tsInput) tsInput.value = String(Date.now());
      } else if (res.status === 429) {
        setStatus(T("For mange forsøk. Vent et minutt og prøv igjen."), "err");
      } else if (res.status === 403) {
        setStatus(T("Vi kunne ikke bekrefte at du er et menneske. Last inn siden på nytt og prøv igjen."),
          "err"
        );
      } else {
        setStatus(T("Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@snuttverk.no."),
          "err"
        );
      }
    } catch {
      setStatus(T("Beklager, noe gikk galt. Prøv igjen, eller send oss en e-post på kontakt@snuttverk.no."),
        "err"
      );
    } finally {
      resetTurnstile();
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
