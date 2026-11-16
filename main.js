/* =========================================================
   TURKLY — shared script for every page
   ========================================================= */

// EDIT THESE TWO LINES ONLY. They update every page at once.
const WHATSAPP_NUMBER = "905357135432"; // country code + number, no + or spaces
const EMAIL = "mohammednizaer@gmail.com";

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* Contact details everywhere */
  const waUrl = "https://wa.me/" + WHATSAPP_NUMBER;
  const waPretty = "+" + WHATSAPP_NUMBER.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
  $$("[data-wa]").forEach((a) => { a.href = waUrl; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-text]").forEach((el) => { el.textContent = waPretty; });
  $$("[data-mail]").forEach((a) => { a.href = "mailto:" + EMAIL; });
  $$("[data-mail-text]").forEach((el) => { el.textContent = EMAIL; });
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Header turns solid after scrolling */
  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const toggle = $(".menu-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* Profile photos: hide initials once a real photo loads */
  $$(".avatar[data-photo]").forEach((el) => {
    const img = new Image();
    img.onload = () => el.classList.add("has-photo");
    img.src = el.dataset.photo;
  });

  /* Fade-in on scroll */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* Number count-up */
  const animateCount = (el) => {
    const target = Number(el.dataset.target);
    const start = performance.now();
    const duration = 1800;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$(".count");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = Number(el.dataset.target).toLocaleString("en-US"); });
  }

  /* Property filters */
  const filters = $$(".filter");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.toggle("active", b === btn));
      const cat = btn.dataset.filter;
      $$(".listing").forEach((card) => {
        const cats = (card.dataset.cat || "").split(" ");
        card.classList.toggle("is-hidden", cat !== "all" && !cats.includes(cat) && !cats.includes("always"));
      });
    });
  });

  /* Contact form: save to Netlify, fall back to WhatsApp */
  const form = $("#contact");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form["bot-field"].value) return; // spam bot filled the hidden field

      const text =
        "New enquiry from the Turkly website\n\n" +
        "Name: " + form.name.value + "\n" +
        "I am a: " + form.type.value + "\n" +
        "Budget: " + form.budget.value + "\n" +
        "Contact: " + form.email.value + "\n" +
        "Contact me by: " + form.contactBy.value + "\n" +
        "Language: " + form.language.value + "\n\n" +
        form.message.value;
      const waLink = waUrl + "?text=" + encodeURIComponent(text);

      const btn = $("#sendBtn");
      btn.disabled = true;
      btn.textContent = "Sending...";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then((res) => {
          if (!res.ok) throw new Error("Form not saved");
          form.innerHTML =
            '<div class="thanks"><h2>Thank you</h2>' +
            "<p>We received your enquiry and will reply within one working day.</p>" +
            '<a class="btn btn-gold" target="_blank" rel="noopener" href="' + waLink + '">Also send on WhatsApp</a></div>';
        })
        .catch(() => {
          window.open(waLink, "_blank"); // not on Netlify (e.g. local preview)
          btn.disabled = false;
          btn.textContent = "Send enquiry";
        });
    });
  }
})();
