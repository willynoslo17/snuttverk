(() => {
  const ALLOWED = new Set(["start", "pluss", "annonsevideo", "meta-annonser", "usikker"]);
  const form = document.getElementById("kontakt-form");
  if (!form) return;

  const select = form.querySelector('[name="pakke"]');
  const msg = document.getElementById("form-msg");
  const lang = form.dataset.lang || "nb";

  const params = new URLSearchParams(window.location.search);
  const pakke = params.get("pakke");
  if (select) {
    select.value = ALLOWED.has(pakke) ? pakke : "usikker";
  }

  const copy =
    lang === "es"
      ? {
          ok: "¡Gracias! Respondo en 1 día laborable.",
          err:
            'No se pudo enviar el formulario. Escríbeme a <a href="mailto:kontakt@mlinternasjonal.no?subject=Snuttverk">kontakt@mlinternasjonal.no</a>.',
          sending: "Enviando…",
        }
      : {
          ok: "Takk! Jeg svarer innen 1 virkedag.",
          err:
            'Kunne ikke sende skjemaet. Send en e-post til <a href="mailto:kontakt@mlinternasjonal.no?subject=Snuttverk">kontakt@mlinternasjonal.no</a>.',
          sending: "Sender…",
        };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!msg) return;

    msg.hidden = false;
    msg.className = "form-msg";
    msg.textContent = copy.sending;

    const data = new FormData(form);
    const payload = {
      navn: String(data.get("navn") || "").trim(),
      bedrift: String(data.get("bedrift") || "").trim(),
      epost: String(data.get("epost") || "").trim(),
      telefon: String(data.get("telefon") || "").trim(),
      nettside: String(data.get("nettside") || "").trim(),
      melding: String(data.get("melding") || "").trim(),
      pakke: String(data.get("pakke") || "usikker"),
      samtykke: data.get("samtykke") === "on" || data.get("samtykke") === "true",
      website: String(data.get("website") || ""),
      lang,
    };

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        msg.className = "form-msg ok";
        msg.textContent = copy.ok;
        form.reset();
        if (select) select.value = "usikker";
        return;
      }

      msg.className = "form-msg err";
      msg.innerHTML = copy.err;
    } catch {
      msg.className = "form-msg err";
      msg.innerHTML = copy.err;
    }
  });
})();
