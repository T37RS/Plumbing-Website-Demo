// Lightweight UI behaviors: nav toggle, testimonial rotation, contact form storage
document.addEventListener('DOMContentLoaded', () => {
  // year in footer(s)
  const year = new Date().getFullYear();
  document.querySelectorAll('#year, #year-about, #year-services, #year-contact')
    .forEach(el => { if (el) el.textContent = year; });

  // nav toggle for mobile
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });
  }

  // testimonial slider (auto-rotate)
  const slider = document.getElementById('testimonial-slider');
  if (slider) {
    const items = Array.from(slider.querySelectorAll('.testimonial'));
    let idx = 0;
    items.forEach((it, i) => { it.style.display = i === 0 ? 'block' : 'none'; });
    setInterval(() => {
      items[idx].style.display = 'none';
      idx = (idx + 1) % items.length;
      items[idx].style.display = 'block';
    }, 4200);
  }

  // contact form behavior: validate and save to localStorage (demo)
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('name').value || '').trim();
      const email = (document.getElementById('email').value || '').trim();
      const phone = (document.getElementById('phone').value || '').trim();
      const message = (document.getElementById('message').value || '').trim();
      const feedback = document.getElementById('form-feedback');

      // basic validation
      if (!name || !email || !message) {
        feedback.textContent = 'Please complete name, email and message.';
        feedback.style.color = '#d44';
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        feedback.textContent = 'Please enter a valid email.';
        feedback.style.color = '#d44';
        return;
      }

      // Save to localStorage for demo (array of submissions)
      try {
        const key = 'blueflow_submissions';
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        prev.push({ name, email, phone, message, createdAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(prev));
        feedback.textContent = 'Thanks — your request was submitted (demo).';
        feedback.style.color = '';
        form.reset();
      } catch (err) {
        feedback.textContent = 'Unable to save request locally.';
        feedback.style.color = '#d44';
        console.error(err);
      }
    });
  }

    // Scroll reveal for elements with [data-reveal]
    const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
    if (revealEls.length && 'IntersectionObserver' in window) {
      const ro = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            ro.unobserve(entry.target);
          }
        });
      }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      revealEls.forEach(el => ro.observe(el));
    } else {
      // fallback: make visible
      revealEls.forEach(el => el.classList.add('visible'));
    }

    // simple count-up animation for elements with data-count
    const countEls = Array.from(document.querySelectorAll('.num[data-count]'));
    const animateCount = (el, target) => {
      const duration = 1200;
      const start = performance.now();
      const from = 0;
      const to = Number(target);
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // easeInOutQuad-ish
        const val = Math.round(from + (to - from) * eased);
        el.textContent = val.toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (countEls.length && 'IntersectionObserver' in window) {
      const cro = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = el.getAttribute('data-count');
            animateCount(el, target);
            cro.unobserve(el);
          }
        });
      }, { root:null, rootMargin:'0px', threshold: 0.25 });
      countEls.forEach(el => cro.observe(el));
    } else {
      countEls.forEach(el => animateCount(el, el.getAttribute('data-count')));
    }

    // Loader handling: remove loader after page is ready and kick off entrance animations
    const loader = document.getElementById('site-loader');
    const kickAnimations = () => {
      // reveal data-stagger groups
      document.querySelectorAll('[data-stagger]').forEach(group => {
        // add in-view with small stagger
        const children = Array.from(group.children || []);
        children.forEach((ch, i) => setTimeout(() => ch.classList.add('in-view'), i * 90));
        setTimeout(() => group.classList.add('in-view'), children.length * 90 + 20);
      });

      // fx classes
      document.querySelectorAll('.fx-fade-up, .fx-scale-up').forEach(el => {
        setTimeout(() => el.classList.add('in-view'), 120);
      });
    };

    // simulate a minimum loader time to show the water-drop
    const MIN_LOAD = 700; // ms
    const readyAt = performance.now();

    // animate loader percent and layered waves translate based on percent
    const wave1 = document.querySelector('.wave-1');
    const wave2 = document.querySelector('.wave-2');
    const wave3 = document.querySelector('.wave-3');
    const loaderPercent = document.getElementById('loader-percent');

    // simple ease-out cubic
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // duration default increased so animation feels more deliberate
    const simulateLoad = (duration = 1800) => {
      const start = performance.now();
      const step = (now) => {
        const raw = Math.min(1, (now - start) / duration);
        // use easing so percent ramps nicely
        const t = easeOutCubic(raw);
        const pct = Math.round(t * 100);

        // map pct to translateY values for each layer to create parallax
        // translate: 100% (empty) -> 0% (full). We'll offset layers slightly for depth.
        const translateBase = 100 - pct; // 100 -> 0
        if (wave1) wave1.style.transform = `translateY(${translateBase - 2}%)`;
        if (wave2) wave2.style.transform = `translateY(${translateBase + 4}%)`;
        if (wave3) wave3.style.transform = `translateY(${translateBase + 10}%)`;

        if (loaderPercent) loaderPercent.textContent = pct + '%';

        if (raw < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    window.addEventListener('load', () => {
      // run the simulated loader then hide
      const simDuration = 2200; // ms - longer, per request
      simulateLoad(simDuration);
      const wait = Math.max(0, MIN_LOAD - (performance.now() - readyAt));
      // total delay before hiding = ensure simDuration finishes plus a short hold
      setTimeout(() => {
        // fade the loader out after a short delay to let the final wave rest at the top
        setTimeout(() => {
          if (loader) loader.classList.add('loaded');
          if (loader) loader.style.opacity = '0';
          setTimeout(() => { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 520);
        }, 360);
        kickAnimations();
      }, wait + simDuration);
    });

    // (services filter removed: left sidebar was removed from the page)

    // Prefill contact form with ?service= query param
    const params = new URLSearchParams(window.location.search);
    const preService = params.get('service');
    if (preService) {
      // If on contact page, prefill message
      const msg = document.getElementById('message');
      if (msg) {
        msg.value = `I'm interested in: ${preService} — please contact me with an estimate.`;
      }
    }

    // FAQ accordion behavior (custom)
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    if (faqItems.length) {
      faqItems.forEach(item => {
        const btn = item.querySelector('.faq-q');
        const ans = item.querySelector('.faq-a');
        // prepare measured height
        const measure = () => {
          ans.style.height = 'auto';
          const h = ans.scrollHeight;
          ans.style.height = item.getAttribute('data-open') === 'true' ? h + 'px' : '0px';
        };
        // initial measurement
        measure();
        window.addEventListener('resize', measure);
        btn.addEventListener('click', () => {
          const isOpen = item.getAttribute('data-open') === 'true';
          if (isOpen) {
            // close
            ans.style.height = ans.scrollHeight + 'px';
            requestAnimationFrame(() => {
              ans.style.height = '0px';
            });
            item.setAttribute('data-open', 'false');
          } else {
            // open: close others
            faqItems.forEach(i => {
              i.setAttribute('data-open', 'false');
              const a = i.querySelector('.faq-a');
              if (a) a.style.height = '0px';
            });
            item.setAttribute('data-open', 'true');
            ans.style.height = ans.scrollHeight + 'px';
          }
        });
      });

    // Video preview load (optional): let a user paste a YouTube URL or embed URL and preview it
    const videoLoadBtn = document.getElementById('video-load-btn');
    if (videoLoadBtn) {
      const input = document.getElementById('video-url-input');
      const iframe = document.getElementById('service-preview-iframe');
      const loadUrl = () => {
        if (!iframe || !input) return;
        let url = (input.value || '').trim();
        if (!url) { iframe.src = ''; return; }
        // try to normalize common YouTube links to embed URLs
        try {
          const u = new URL(url, window.location.href);
          const host = u.hostname.toLowerCase();
          if (host.includes('youtube.com')) {
            const v = u.searchParams.get('v');
            if (v) url = `https://www.youtube.com/embed/${v}`;
          } else if (host.includes('youtu.be')) {
            const v = u.pathname.replace(/^\//, '');
            if (v) url = `https://www.youtube.com/embed/${v}`;
          }
        } catch (err) {
          // not a valid absolute URL — pass through and let iframe handle it
        }
        iframe.src = url;
      };
      videoLoadBtn.addEventListener('click', loadUrl);
      // allow Enter key in the input to load
      if (input) input.addEventListener('keyup', (e) => { if (e.key === 'Enter') loadUrl(); });
    }
    }
});

// smooth scroll helper for in-page jumps (works for nav-jump and jump-arrow links)
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a.nav-jump, a.jump-arrow');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || !href.startsWith('#')) return; // only handle in-page
  const tgt = document.querySelector(href);
  if (!tgt) return;
  e.preventDefault();
  tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // small focus for accessibility
  tgt.setAttribute('tabindex', '-1');
  tgt.focus({ preventScroll: true });
});
