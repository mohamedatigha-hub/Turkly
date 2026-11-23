/* =========================================================
   TURKLY — shared script for every page
   ========================================================= */

// EDIT THESE TWO LINES ONLY. They update every page at once.
const WHATSAPP_NUMBER = "905357135432"; // country code + number, no + or spaces
const EMAIL = "mohammednizaer@gmail.com";
const WEB3FORMS_KEY = "479c66d6-9e36-4186-b089-fb27a1a19aa1"; // public form key, safe to keep here

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

  /* Property photo galleries */
  const galleryEls = $$("[data-gallery]");
  if (galleryEls.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<img alt="">' +
      '<button class="lb-btn lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lb-btn lb-next" aria-label="Next photo">&#8250;</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lb);
    const img = $("img", lb), count = $(".lb-count", lb);
    let photos = [], index = 0, lastFocus = null, caption = "";

    const show = (i) => {
      index = (i + photos.length) % photos.length;
      img.src = photos[index];
      count.textContent = (index + 1) + " / " + photos.length + (caption ? "  ·  " + caption : "");
    };
    const open = (list, title, cap) => {
      photos = list; caption = cap || ""; lastFocus = document.activeElement;
      img.alt = title || "Property photo";
      lb.classList.toggle("single", photos.length < 2);
      show(0);
      lb.classList.add("open");
      document.body.classList.add("lb-open");
      $(".lb-close", lb).focus();
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.classList.remove("lb-open");
      if (lastFocus) lastFocus.focus();
    };

    galleryEls.forEach((el) => {
      const list = el.dataset.gallery.split(",").map((x) => x.trim()).filter(Boolean);
      const counter = $("[data-photo-count]", el);
      if (counter && list.length > 1) counter.textContent = list.length + " photos";
      list.slice(1).forEach((src) => { const pre = new Image(); pre.src = src; });
      el.addEventListener("click", () => open(list, el.getAttribute("aria-label"), el.dataset.caption));
    });

    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", (e) => { e.stopPropagation(); show(index - 1); });
    $(".lb-next", lb).addEventListener("click", (e) => { e.stopPropagation(); show(index + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    let startX = null;
    lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (startX === null || photos.length < 2) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

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

      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: "New Turkly enquiry from " + form.name.value,
        from_name: "Turkly website",
        name: form.name.value,
        "I am a": form.type.value,
        budget: form.budget.value,
        contact: form.email.value,
        "contact me by": form.contactBy.value,
        language: form.language.value,
        message: form.message.value
      };
      if (form.email.value.indexOf("@") > 0) payload.email = form.email.value; // lets you reply directly

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Form not sent");
          form.innerHTML =
            '<div class="thanks"><h2>Thank you</h2>' +
            "<p>We received your enquiry and will reply within one working day.</p>" +
            '<a class="btn btn-gold" target="_blank" rel="noopener" href="' + waLink + '">Also send on WhatsApp</a></div>';
        })
        .catch(() => {
          window.open(waLink, "_blank"); // if sending fails, fall back to WhatsApp
          btn.disabled = false;
          btn.textContent = "Send enquiry";
        });
    });
  }
})();
