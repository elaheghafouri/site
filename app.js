(() => {
  "use strict";

  const cfg = window.SITE_CONFIG || {};
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Config binding ----------
  $$("[data-site-name]").forEach(el => el.textContent = cfg.siteName || "خانم غفوری");
  const setText = (selector, value, fallback="اطلاعات در Config") =>
    $$(selector).forEach(el => el.textContent = value || fallback);

  setText("[data-phone-display]", cfg.phone);
  setText("[data-whatsapp-display]", cfg.whatsapp, "واتساپ");
  setText("[data-address-display]", cfg.address);
  setText("[data-hours-display]", cfg.hours);

  if (cfg.portrait) {
    $$("[data-portrait],[data-portrait-alt]").forEach(img => {
      img.src = cfg.portrait;
      const frame = img.closest(".portrait-frame, .about-photo");
      frame?.classList.add("has-image");
      img.addEventListener("error", () => frame?.classList.remove("has-image"), {once:true});
    });
  }

  if (cfg.phone) {
    const tel = `tel:${cfg.phone.replace(/[^\d+]/g,"")}`;
    $$("[data-phone-link]").forEach(a => a.href = tel);
  }
  if (cfg.whatsapp) {
    $$("[data-whatsapp-link]").forEach(a => a.href = cfg.whatsapp);
  }
  if (cfg.canonical) {
    $("#canonical-link")?.setAttribute("href", cfg.canonical);
  }
  if (cfg.ogImage) {
    $('meta[property="og:image"]')?.setAttribute("content", cfg.ogImage);
  }
  document.title = `${cfg.siteName || "خانم غفوری"} | مشاوره تلفنی و حضوری`;
  $("#year").textContent = new Date().getFullYear();

  // ---------- Sticky header ----------
  const header = $("[data-header]");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  // ---------- Mobile menu ----------
  const menuBtn = $(".menu-toggle");
  const mobileMenu = $("#mobile-menu");
  const setMenu = open => {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
  };
  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  $$("#mobile-menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  // ---------- Reveal on scroll ----------
  const reveals = $$(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  // ---------- FAQ accordion: single-open ----------
  $$(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("is-open");
      $$(".faq-item").forEach(el => {
        el.classList.remove("is-open");
        $(".faq-question", el)?.setAttribute("aria-expanded","false");
      });
      if (!wasOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded","true");
      }
    });
  });

  // ---------- Testimonials carousel ----------
  const viewport = $("[data-carousel]");
  const track = $(".testimonial-track", viewport || document);
  const slides = $$(".testimonial-card", track || document);
  const prev = $("[data-prev]"), next = $("[data-next]"), dots = $("[data-dots]");
  let index = 0, timer = null, pointerX = null;

  const visibleCount = () => window.innerWidth < 621 ? 1 : window.innerWidth < 901 ? 2 : 3;
  const maxIndex = () => Math.max(0, slides.length - visibleCount());

  const renderDots = () => {
    if (!dots) return;
    dots.innerHTML = "";
    const count = maxIndex() + 1;
    for (let i=0;i<count;i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `نمایش نظر ${i+1}`);
      b.className = i === index ? "is-active" : "";
      b.addEventListener("click", () => { index=i; renderCarousel(); resetAutoplay(); });
      dots.appendChild(b);
    }
  };

  const renderCarousel = () => {
    if (!track || !slides.length) return;
    index = Math.min(index, maxIndex());
    const gap = 14;
    const slideWidth = slides[0].getBoundingClientRect().width + gap;
    const offset = index * slideWidth;
    track.style.transform = `translateX(${offset}px)`;
    if (dots) [...dots.children].forEach((d,i)=>d.classList.toggle("is-active",i===index));
  };
  const move = delta => { index = (index + delta + maxIndex()+1) % (maxIndex()+1 || 1); renderCarousel(); };
  prev?.addEventListener("click",()=>{move(1);resetAutoplay()});
  next?.addEventListener("click",()=>{move(-1);resetAutoplay()});

  const startAutoplay = () => {
    if (reducedMotion || slides.length <= 1) return;
    timer = setInterval(()=>move(1),5000);
  };
  const stopAutoplay = () => { if (timer) clearInterval(timer); timer=null; };
  const resetAutoplay = () => { stopAutoplay(); startAutoplay(); };

  viewport?.addEventListener("mouseenter",stopAutoplay);
  viewport?.addEventListener("mouseleave",startAutoplay);
  viewport?.addEventListener("pointerdown",e=>{pointerX=e.clientX; stopAutoplay()});
  viewport?.addEventListener("pointerup",e=>{
    if(pointerX===null) return;
    const dx=e.clientX-pointerX;
    if(Math.abs(dx)>45) move(dx>0 ? -1 : 1);
    pointerX=null; startAutoplay();
  });
  window.addEventListener("resize",()=>{renderDots();renderCarousel()},{passive:true});
  renderDots(); renderCarousel(); startAutoplay();

  // ---------- Smooth anchor offset ----------
  $$("#home a[href^='#'], .desktop-nav a[href^='#'], .mobile-menu a[href^='#'], .site-footer a[href^='#'], .booking-cta a[href^='#'], .hero-actions a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({top,behavior: reducedMotion ? "auto" : "smooth"});
    });
  });

  // ---------- Contact form ----------
  const form = $("#contact-form");
  const status = $("#form-status");
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const button = $(".btn-submit", form);
    const oldText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "در حال ارسال…";

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (cfg.formEndpoint) {
        const response = await fetch(cfg.formEndpoint, {
          method:"POST",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify(data)
        });
        if (!response.ok) throw new Error("request_failed");
        status.textContent = "درخواست شما با موفقیت ارسال شد.";
        form.reset();
      } else {
        status.textContent = "فرم آماده اتصال است؛ در Config یک formEndpoint واقعی تنظیم کنید.";
      }
    } catch {
      status.textContent = "ارسال انجام نشد. اتصال فرم یا اطلاعات تماس را بررسی کنید.";
      status.style.color = "#ff9fac";
    } finally {
      button.disabled = false;
      button.innerHTML = oldText;
    }
  });

  // ---------- Desktop cursor glow ----------
  const glow = $(".cursor-glow");
  if (glow && !reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    let tx=window.innerWidth/2, ty=window.innerHeight/2, x=tx, y=ty, raf=0;
    window.addEventListener("pointermove", e => { tx=e.clientX; ty=e.clientY; if(!raf) raf=requestAnimationFrame(loop); }, {passive:true});
    function loop(){
      x += (tx-x)*.12; y += (ty-y)*.12;
      glow.style.transform = `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;
      raf = (Math.abs(tx-x)+Math.abs(ty-y)>0.5) ? requestAnimationFrame(loop) : 0;
    }
  }
})();
