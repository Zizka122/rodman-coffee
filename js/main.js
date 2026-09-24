(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';

  /* =======================================================
     Рендер контента (работает и без GSAP)
     ======================================================= */
  const glassSVG = (color) => `
    <svg viewBox="0 0 120 150" class="glass-svg" aria-hidden="true">
      <rect width="120" height="150" fill="#efe4d4"/>
      <path d="M32 30 h56 l-6 96 a8 8 0 0 1 -8 7 h-28 a8 8 0 0 1 -8 -7 z" fill="#fff" opacity=".55"/>
      <path d="M35 58 h50 l-4.3 66 a6 6 0 0 1 -6 5.5 h-29.4 a6 6 0 0 1 -6 -5.5 z" fill="${color}"/>
      <circle cx="50" cy="80" r="5" fill="#fff" opacity=".45"/><circle cx="68" cy="96" r="3.5" fill="#fff" opacity=".4"/>
      <path d="M70 12 l-8 50" stroke="#120d0a" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  const thumbHTML = (it) => it.img
    ? `<img src="${IMG(it.img)}" alt="" loading="lazy">`
    : glassSVG(it.color || '#c9894f');

  // --- меню ---
  const tabsEl = $('.menu__tabs');
  const listEl = $('.menu__list');
  let activeCat = MENU[0].id;

  tabsEl.innerHTML = MENU.map((c, i) =>
    `<button class="menu__tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-cat="${c.id}">${c.name}<sup>${c.items.length}</sup></button>`
  ).join('');

  const renderList = (catId) => {
    const cat = MENU.find(c => c.id === catId);
    listEl.innerHTML = cat.items.map((it, i) => `
      <li class="menu__item" data-i="${i}">
        <span class="menu__idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="menu__thumb">${thumbHTML(it)}</span>
        <span class="menu__name">${it.n}${it.tag ? `<span class="menu__tag">${it.tag}</span>` : ''}<small>${it.v}</small></span>
        <span class="menu__vol">${it.v}</span>
        <span class="menu__price">${rub(it.p)}${it.p2 ? `<small>400 мл — ${rub(it.p2)}</small>` : ''}</span>
      </li>`).join('');
    return $$('.menu__item', listEl);
  };
  renderList(activeCat);

  // --- чеки-отзывы ---
  const receiptHTML = (r, i) => `
    <article class="receipt" style="--tilt:${(i % 2 ? 1 : -1) * (1 + (i * 7) % 3)}deg">
      <div class="receipt__logo">RODMAN</div>
      <div class="receipt__sub">кофейня · пр. Кирова, 87А</div>
      <div class="receipt__row"><span>ЧЕК № ${String(1017 + i * 131).padStart(4, '0')}</span><span>${r.date}</span></div>
      <div class="receipt__row"><span>ГОСТЬ</span><span>${r.name}</span></div>
      <hr>
      <p class="receipt__text">${r.text}</p>
      <hr>
      <div class="receipt__row"><span>ЗАКАЗ</span><span>${r.order}</span></div>
      <div class="receipt__row"><span>ОЦЕНКА</span><span class="receipt__stars">★★★★★</span></div>
      <div class="receipt__row receipt__total"><span>ИТОГО</span><span>вернусь ещё</span></div>
      <div class="receipt__bar"></div>
      <div class="receipt__sub" style="margin:10px 0 0">спасибо, что вы с нами</div>
    </article>`;
  const track = $('.receipts__track');
  track.innerHTML = REVIEWS.map(receiptHTML).join('') + REVIEWS.map((r, i) => receiptHTML(r, i + REVIEWS.length)).join('');

  // --- столик: геометрия ---
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(svgNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const chairsG = $('.table-viz__chairs');
  const itemsG = $('.table-viz__items');
  const CX = 250, CY = 250;

  const buildTable = (mode) => {
    const m = COMPANY[mode];
    const chairs = [], items = [];
    const n = m.seats;
    const start = n === 2 ? 210 : -90;
    const step = n === 2 ? 120 : 360 / n;
    for (let i = 0; i < n; i++) {
      const a = (start + step * i) * Math.PI / 180;
      const isKid = m.kids && i === n - 1;
      const cg = el('g', { transform: `translate(${CX + Math.cos(a) * 178} ${CY + Math.sin(a) * 178}) rotate(${(a * 180 / Math.PI) + 90})` }, chairsG);
      const inner = el('g', {}, cg);
      el('rect', { x: isKid ? -24 : -34, y: -24, width: isKid ? 48 : 68, height: 48, rx: 18, class: 'chair' + (isKid ? ' chair--kid' : '') }, inner);
      chairs.push(inner);

      // чашка перед гостем
      const r = 92;
      const ig = el('g', { transform: `translate(${CX + Math.cos(a) * r} ${CY + Math.sin(a) * r})` }, itemsG);
      const cup = el('g', {}, ig);
      if (m.laptop) {
        el('rect', { x: -44, y: -30, width: 88, height: 58, rx: 6, class: 'laptop', transform: `rotate(${(a * 180 / Math.PI) + 90}) translate(0 -8)` }, cup);
        el('rect', { x: -38, y: -24, width: 76, height: 40, rx: 3, class: 'laptop-screen', transform: `rotate(${(a * 180 / Math.PI) + 90}) translate(0 -8)` }, cup);
        const c2 = el('g', { transform: `translate(${Math.cos(a + 1.3) * 70} ${Math.sin(a + 1.3) * 70})` }, cup);
        el('circle', { r: 24, class: 'cup-saucer' }, c2); el('circle', { r: 17, class: 'cup-rim' }, c2); el('circle', { r: 13, class: 'cup-coffee' }, c2);
      } else {
        const s = isKid ? .8 : 1;
        el('circle', { r: 26 * s, class: 'cup-saucer' }, cup);
        el('circle', { r: 19 * s, class: 'cup-rim' }, cup);
        el('circle', { r: 15 * s, class: 'cup-coffee' }, cup);
        el('path', { d: 'M0 7 C -8 1, -8 -6, -3 -6 C -1 -6, 0 -4, 0 -2 C 0 -4, 1 -6, 3 -6 C 8 -6, 8 1, 0 7 Z', class: 'cup-art', transform: `scale(${s})` }, cup);
      }
      items.push(cup);
    }
    // десерт/тарелка в центре
    {
      const pg = el('g', { transform: `translate(${CX} ${CY})` }, itemsG);
      const plate = el('g', {}, pg);
      el('circle', { r: 34, class: 'plate' }, plate);
      if (mode === 'friends') {
        const colors = ['#e59bb0', '#b8d68a', '#f3d27a', '#c9a0dc', '#f2a36b'];
        colors.forEach((c, i) => {
          const aa = i / colors.length * Math.PI * 2;
          el('circle', { cx: Math.cos(aa) * 17, cy: Math.sin(aa) * 17, r: 9, fill: c }, plate);
        });
      } else if (mode === 'kids') {
        ['#f7e0c4', '#f0a3b4', '#8a5a3c'].forEach((c, i) => el('circle', { cx: (i - 1) * 16, cy: (i === 1 ? -6 : 5), r: 11, fill: c }, plate));
      } else {
        el('path', { d: 'M0 0 L 26 -12 A 28 28 0 0 1 22 18 Z', class: 'plate-food', transform: 'translate(-10 -2)' }, plate);
      }
      items.push(plate);
    }
    return { chairs, items };
  };

  /* =======================================================
     Без GSAP — показываем всё статично
     ======================================================= */
  const companyCard = (mode) => {
    const m = COMPANY[mode];
    $('.company__mood').textContent = m.mood;
    $('.company__order').innerHTML = m.order.map(([n, p]) => `<li><span>${n}</span><span>${rub(p)}</span></li>`).join('');
    $('.table-viz__place').textContent = m.place;
    return m.order.reduce((s, [, p]) => s + p, 0);
  };

  if (!hasGSAP) {
    root.classList.remove('js');
    buildTable('solo');
    $('.company__total b').textContent = rub(companyCard('solo'));
    $$('.chip').forEach(ch => ch.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.toggle('is-active', c === ch));
      chairsG.innerHTML = ''; itemsG.innerHTML = '';
      buildTable(ch.dataset.mode);
      $('.company__total b').textContent = rub(companyCard(ch.dataset.mode));
    }));
    $$('.menu__tab').forEach(t => t.addEventListener('click', () => {
      $$('.menu__tab').forEach(x => x.classList.toggle('is-active', x === t));
      renderList(t.dataset.cat);
    }));
    return;
  }

  /* =======================================================
     GSAP
     ======================================================= */
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('is-loading');

  // --- плавный скролл ---
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.__lenis = lenis;
  }

  // --- утилита: разбивка заголовков на слова в масках ---
  const splitWords = (node) => {
    const parts = [];
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        ch.textContent.split(/[ \n\t]+/).filter(Boolean).forEach(w => parts.push(document.createTextNode(w)));
      } else parts.push(ch);
    });
    node.innerHTML = '';
    const inners = [];
    parts.forEach((p, i) => {
      const outer = document.createElement('span');
      outer.className = 'sw';
      const inner = document.createElement('span');
      inner.appendChild(p);
      outer.appendChild(inner);
      node.appendChild(outer);
      if (i < parts.length - 1) node.appendChild(document.createTextNode(' '));
      inners.push(inner);
    });
    return inners;
  };
  const splitChars = (node) => {
    const txt = node.textContent;
    node.innerHTML = [...txt].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    return $$('.ch', node);
  };

  /* ---------- PRELOADER ---------- */
  const loader = $('.loader');
  const heroIntro = gsap.timeline({ paused: true })
    .fromTo('.hero__img', { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
    .to('.hero__title .line__in', { y: 0, duration: 1.3, ease: 'expo.out', stagger: .09 }, .1)
    .to('.hero__kicker', { opacity: 1, duration: 1 }, .5)
    .fromTo('.hero__bottom', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }, .6);

  const finishLoading = () => {
    loader.remove();
    root.classList.remove('is-loading');
    lenis && lenis.start();
    ScrollTrigger.refresh();
  };

  if (reduce) {
    gsap.set(loader, { autoAlpha: 0 });
    heroIntro.progress(1);
    finishLoading();
  } else {
    const draw = (sel) => $$(sel, loader).forEach(p => {
      const len = p.getTotalLength ? p.getTotalLength() : 800;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    draw('.loader__guides line'); draw('.loader__saucer'); draw('.loader__rim'); draw('.loader__handle'); draw('.loader__art');
    const counter = { v: 0 };
    const countEl = $('.loader__count b', loader);
    const maxR = Math.hypot(innerWidth, innerHeight);

    gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .to(counter, { v: 100, duration: 2.6, ease: 'power2.inOut', onUpdate: () => countEl.textContent = Math.round(counter.v) }, 0)
      .to('.loader__guides line', { strokeDashoffset: 0, duration: 1, stagger: .06 }, 0)
      .to('.loader__saucer', { strokeDashoffset: 0, duration: 1.1 }, .2)
      .to('.loader__rim', { strokeDashoffset: 0, duration: 1 }, .35)
      .to('.loader__handle', { strokeDashoffset: 0, duration: .6 }, .8)
      .from('.loader__handles > *', { scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .03, ease: 'back.out(3)' }, .6)
      .from('.loader__coffee', { scale: 0, duration: 1, ease: 'expo.out' }, 1.1)
      .from('.loader__crema', { scale: .2, opacity: 0, rotation: -90, duration: 1.2, ease: 'expo.out' }, 1.2)
      .to('.loader__art', { strokeDashoffset: 0, duration: .9, ease: 'power2.out' }, 1.5)
      .to(['.loader__guides', '.loader__handles'], { opacity: 0, duration: .5 }, 2.3)
      .to('.loader__meta', { opacity: 0, duration: .4 }, 2.6)
      .to('.loader__svg', { scale: 1.08, duration: .5, ease: 'power2.in' }, 2.5)
      .to(loader, { '--r': `${maxR}px`, duration: 1.3, ease: 'expo.inOut' }, 2.8)
      .add(() => heroIntro.play(), 3.1)
      .add(finishLoading, 4.1);
  }

  /* ---------- CURSOR ---------- */
  if (finePointer) {
    const cur = $('.cursor');
    const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', (e) => { cur.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, .chip, .menu__item');
      cur.classList.toggle('is-label', !!lab && !link);
      cur.classList.toggle('is-hover', !!link);
      if (lab) label.textContent = lab.dataset.cursor;
    });

    // магнитные кнопки
    $$('.btn, .chip').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- HERO: лампа ---------- */
  const hero = $('.hero');
  const lamp = { x: 62, y: 42, r: 24 };
  const applyLamp = () => {
    hero.style.setProperty('--mx', lamp.x + '%');
    hero.style.setProperty('--my', lamp.y + '%');
    hero.style.setProperty('--lr', lamp.r + 'vmax');
  };
  applyLamp();
  const lx = gsap.quickTo(lamp, 'x', { duration: .9, ease: 'power3', onUpdate: applyLamp });
  const ly = gsap.quickTo(lamp, 'y', { duration: .9, ease: 'power3', onUpdate: applyLamp });
  if (finePointer) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      lx((e.clientX - r.left) / r.width * 100);
      ly((e.clientY - r.top) / r.height * 100);
    });
  } else {
    // на телефоне лампа гуляет сама
    gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 3.2, ease: 'sine.inOut', onUpdate: applyLamp } })
      .to(lamp, { x: 30, y: 30 }).to(lamp, { x: 70, y: 55 }).to(lamp, { x: 45, y: 40 });
  }
  // при скролле свет «включается» полностью
  gsap.to(lamp, {
    r: 140, ease: 'none', onUpdate: applyLamp,
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__stage', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -30, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- HERO: слово-ротатор ---------- */
  const rot = $('.rotator');
  const words = rot.dataset.words.split(',');
  let wi = 0;
  splitChars(rot);
  const cycle = () => {
    wi = (wi + 1) % words.length;
    const oldChars = $$('.ch', rot);
    gsap.to(oldChars, {
      rotationX: 90, opacity: 0, duration: .45, ease: 'power2.in', stagger: .025,
      onComplete: () => {
        rot.textContent = words[wi];
        const nc = splitChars(rot);
        gsap.from(nc, { rotationX: -90, opacity: 0, duration: .7, ease: 'back.out(2)', stagger: .03 });
      },
    });
  };
  setInterval(() => { if (!document.hidden) cycle(); }, 2800);

  /* ---------- NAV ---------- */
  const nav = $('.nav');
  const burger = $('.nav__burger'), drawer = $('.drawer');
  const fill = $('.cup-progress__fill'), val = $('.cup-progress__val');
  // drawer
  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    drawer.setAttribute('aria-hidden', !open);
    if (open) gsap.fromTo('.drawer__links a', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .8, ease: 'expo.out', delay: .25 });
    open ? lenis?.stop() : lenis?.start();
    setTimeout(navTheme, 50);
  };
  burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));

  /* ---------- Переход «кофейная волна» ---------- */
  const pour = $('.pour'), pourLabel = $('.pour__label');
  const LABELS = { top: 'RODMAN', day: 'Один день', company: 'С кем вы?', menu: 'Меню', people: 'Люди', contacts: 'Приходите' };
  gsap.set(pour, { y: '100vh' });
  let pouring = false;
  $$('[data-pour]').forEach(a => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (pouring) return;
    pouring = true;
    const wasOpen = drawer.classList.contains('is-open');
    pourLabel.textContent = LABELS[id] || '';
    gsap.timeline({ onComplete: () => { pouring = false; gsap.set(pour, { y: '100vh' }); } })
      .to(pour, { y: '-14vh', duration: .85, ease: 'power3.inOut' })
      .fromTo(pourLabel, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out' }, '-=.35')
      .add(() => {
        if (wasOpen) { drawer.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); }
        const y = id === 'top' ? 0 : target.getBoundingClientRect().top + scrollY;
        if (lenis) { lenis.start(); lenis.scrollTo(y, { immediate: true, force: true }); }
        else scrollTo(0, y);
        ScrollTrigger.update();
        nav.classList.remove('is-hidden');
      })
      .to(pourLabel, { yPercent: -60, opacity: 0, duration: .4, ease: 'power2.in' }, '+=.15')
      .to(pour, { y: '-160vh', duration: .9, ease: 'power3.inOut' }, '-=.2');
  }));

  /* ---------- Заголовки: слова выезжают из масок ---------- */
  $$('.split-title').forEach(t => {
    const inners = splitWords(t);
    gsap.from(inners, {
      yPercent: 110, rotation: 4, duration: 1.2, ease: 'expo.out', stagger: .08,
      scrollTrigger: { trigger: t, start: 'top 85%' },
    });
  });

  /* ---------- MANIFESTO ---------- */
  const mText = $('[data-words-reveal]');
  (() => {
    const nodes = [...mText.childNodes];
    mText.innerHTML = '';
    nodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/[ \n\t]+/).filter(Boolean).forEach(w => {
          const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
          mText.appendChild(s); mText.appendChild(document.createTextNode(' '));
        });
      } else { mText.appendChild(n); mText.appendChild(document.createTextNode(' ')); }
    });
  })();
  gsap.fromTo($$('.w', mText), { opacity: .12 }, {
    opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: mText, start: 'top 80%', end: 'bottom 50%', scrub: true },
  });
  $$('.pill', mText).forEach(p => {
    gsap.fromTo(p, { width: 0, rotation: -8 }, {
      width: '2.1em', rotation: 0, ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 55%', scrub: true },
    });
  });
  $$('[data-count]').forEach(b => {
    const to = parseFloat(b.dataset.count), dec = +(b.dataset.decimals || 0), suf = b.dataset.suffix || '';
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: b, start: 'top 90%' },
      onUpdate: () => b.textContent = o.v.toFixed(dec) + suf,
    });
  });
  gsap.from('.fact', { y: 50, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto__facts', start: 'top 85%' } });


  /* ---------- ОДИН ДЕНЬ ---------- */
  const day = $('.day'), dayTrack = $('.day__track'), sun = $('.day__sun');
  const clock = $('.day__clock-val'), garland = $('.day__garland'), bulbsG = $('.day__bulbs');
  // лампочки гирлянды вдоль кривой
  const gPath = $('.day__garland path');
  const gLen = gPath.getTotalLength();
  for (let i = 1; i < 34; i++) {
    const pt = gPath.getPointAtLength(gLen * i / 34);
    el('circle', { cx: pt.x, cy: pt.y + 6, r: 4 }, bulbsG);
  }
  gsap.to('.day__bulbs circle', { opacity: .3, duration: () => .4 + Math.random(), repeat: -1, yoyo: true, stagger: { each: .08, from: 'random' }, ease: 'sine.inOut' });

  const skyBg = ['#f4e3c8', '#f3cf96', '#e08c5a', '#8a3b2a', '#16100d'];
  const skyFg = ['#120d0a', '#120d0a', '#1a0f0a', '#f2e8da', '#f2e8da'];
  const lerpColor = (arr, p) => {
    const seg = (arr.length - 1) * p, i = Math.min(Math.floor(seg), arr.length - 2);
    return gsap.utils.interpolate(arr[i], arr[i + 1], seg - i);
  };
  const setSky = (p) => {
    day.style.backgroundColor = lerpColor(skyBg, p);
    day.style.setProperty('--fg', lerpColor(skyFg, p));
    const T = [480, 780, 1050, 1320], seg = p * (T.length - 1), k = Math.min(Math.floor(seg), T.length - 2);
    const mins = Math.round((T[k] + (T[k + 1] - T[k]) * (seg - k)) / 5) * 5;
    clock.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const W = innerWidth, H = innerHeight, s = sun.offsetWidth;
    const arc = Math.sin(Math.min(p / .8, 1) * Math.PI);
    // на телефоне дуга ниже и короче — в верхней половине экрана
    const y = W <= 760 ? H * .42 - arc * H * .28 : H * .62 - arc * H * .5;
    gsap.set(sun, { x: p * (W - s), y, opacity: gsap.utils.clamp(0, 1, 1 - (p - .55) * 6) });
    garland.style.opacity = Math.max(0, (p - .72) * 3.6);
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const dist = () => dayTrack.scrollWidth - innerWidth;
    const tween = gsap.to(dayTrack, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: day, pin: true, scrub: 1, start: 'top top', end: () => '+=' + dist(),
        invalidateOnRefresh: true, onUpdate: (s) => setSky(s.progress),
      },
    });
    $$('.day__panel').forEach(panel => {
      const img = $('.day__photo img', panel);
      gsap.fromTo(img, { yPercent: -10, scale: 1.1 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($('.day__time', panel), { xPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 90%', end: 'left 30%', scrub: true } });
      gsap.from($('.day__body', panel), { y: 80, opacity: 0, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 70%', end: 'left 20%', scrub: true } });
    });
    setSky(0);
  });
  mm.add('(max-width: 760px)', () => {
    // на телефоне небо «прилипает» к экрану (sticky в CSS), а солнце и цвет идут плавно по прокрутке блока
    ScrollTrigger.create({
      trigger: day, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => setSky(s.progress),
    });
    $$('.day__panel').forEach(panel => {
      gsap.from($('.day__photo', panel), { clipPath: 'inset(30% 10% 30% 10% round 22px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: panel, start: 'top 70%' } });
    });
    setSky(0);
  });

  /* ---------- С КЕМ ВЫ ---------- */
  let current = null, modeToken = 0;
  const totalEl = $('.company__total b');
  const totalObj = { v: 0 };
  const setMode = (mode) => {
    const oldChairs = [...chairsG.children], oldItems = [...itemsG.children];
    const olds = [...oldItems, ...oldChairs].map(g => g.firstChild);
    const token = ++modeToken;
    const build = () => {
      if (token !== modeToken) return;
      chairsG.innerHTML = ''; itemsG.innerHTML = '';
      const { chairs, items } = buildTable(mode);
      gsap.from(chairs, { scale: 0, opacity: 0, duration: .8, stagger: .07, ease: 'back.out(2.2)', transformOrigin: '50% 50%' });
      gsap.from(items, { scale: 0, opacity: 0, rotation: -40, duration: .8, stagger: .07, delay: .2, ease: 'back.out(2)', transformOrigin: '50% 50%' });
    };
    if (olds.length) gsap.to(olds, { scale: 0, opacity: 0, duration: .35, stagger: .02, ease: 'power2.in', transformOrigin: '50% 50%', onComplete: build });
    else build();
    const sum = companyCard(mode);
    gsap.fromTo('.company__mood', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', overwrite: true });
    gsap.fromTo('.company__order li', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .6, stagger: .06, ease: 'expo.out' });
    gsap.fromTo('.table-viz__place', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, delay: .3, overwrite: true });
    gsap.to(totalObj, { v: sum, duration: .9, ease: 'power3.out', onUpdate: () => totalEl.textContent = rub(Math.round(totalObj.v / 10) * 10) });
    current = mode;
  };
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    if (ch.dataset.mode === current) return;
    $$('.chip').forEach(c => { c.classList.toggle('is-active', c === ch); c.setAttribute('aria-selected', c === ch); });
    setMode(ch.dataset.mode);
  }));
  ScrollTrigger.create({ trigger: '.company', start: 'top 60%', once: true, onEnter: () => { if (!current) setMode($('.chip.is-active').dataset.mode); } });
  gsap.to('.table-viz svg', { rotation: 12, ease: 'none', scrollTrigger: { trigger: '.company', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- МЕНЮ ---------- */
  const animateRows = (rows) => gsap.fromTo(rows, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .035, ease: 'expo.out' });
  ScrollTrigger.create({ trigger: listEl, start: 'top 85%', once: true, onEnter: () => animateRows($$('.menu__item', listEl)) });
  gsap.set($$('.menu__item', listEl), { opacity: 0 });

  $$('.menu__tab').forEach(t => t.addEventListener('click', () => {
    if (t.dataset.cat === activeCat) return;
    activeCat = t.dataset.cat;
    $$('.menu__tab').forEach(x => { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
    const h = listEl.offsetHeight;
    listEl.style.minHeight = h + 'px';
    gsap.to($$('.menu__item', listEl), {
      y: -20, opacity: 0, duration: .25, stagger: .015, ease: 'power2.in',
      onComplete: () => {
        const rows = renderList(activeCat);
        animateRows(rows);
        gsap.to(listEl, { minHeight: 0, duration: .6, delay: .3, clearProps: 'minHeight' });
        ScrollTrigger.refresh();
      },
    });
  }));

  // плавающее превью при наведении.
  // Проверяем, что под курсором, и при движении мыши, и при скролле:
  // при прокрутке колесом мышь стоит на месте и pointerleave не срабатывает.
  const preview = $('.menu__preview');
  if (finePointer) {
    const px = gsap.quickTo(preview, 'x', { duration: .6, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: .6, ease: 'power3' });
    const pr = gsap.quickTo(preview, 'rotation', { duration: .8, ease: 'power3' });
    let mx = -1, my = -1, lastX = 0, shown = false;

    const hidePreview = () => {
      if (!shown) return;
      shown = false;
      gsap.to(preview, { opacity: 0, scale: .6, duration: .3, ease: 'power3', overwrite: true });
    };
    const showPreview = (row) => {
      const it = MENU.find(c => c.id === activeCat).items[+row.dataset.i];
      if (!it) return hidePreview();
      if (preview.dataset.key !== it.n) {
        preview.dataset.key = it.n;
        preview.innerHTML = it.img ? `<img src="${IMG(it.img)}" alt="">` : `<div class="glass">${glassSVG(it.color)}</div>`;
        gsap.fromTo(preview.firstElementChild, { scale: 1.3 }, { scale: 1, duration: .6, ease: 'expo.out' });
      }
      if (!shown) {
        shown = true;
        gsap.to(preview, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out', overwrite: true });
      }
    };
    const checkPreview = () => {
      if (mx < 0) return;
      const row = document.elementFromPoint(mx, my)?.closest('.menu__item');
      row && listEl.contains(row) && +gsap.getProperty(row, 'opacity') > .5 ? showPreview(row) : hidePreview();
    };

    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      px(mx + 30); py(my - 160);
      pr(gsap.utils.clamp(-15, 15, (mx - lastX) * .8));
      lastX = mx;
      checkPreview();
    }, { passive: true });
    addEventListener('scroll', checkPreview, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { mx = -1; hidePreview(); });
    addEventListener('blur', hidePreview);
    $$('.menu__tab').forEach(t => t.addEventListener('click', hidePreview));
  }

  /* ---------- ПОЛАРОИДЫ ---------- */
  const pols = $$('.polaroid');
  const box = $('.polaroids');
  let z = pols.length;
  const spots = [[-26, -14, -8], [18, -20, 6], [-8, 12, -3], [24, 16, 9], [-30, 22, 4], [4, -4, -5]];
  pols.forEach((p, i) => {
    gsap.set(p, { xPercent: -50, yPercent: -50, zIndex: i });
    const [sx, sy, sr] = spots[i % spots.length];
    p._home = { x: sx / 100 * box.offsetWidth, y: sy / 100 * box.offsetHeight, r: sr };
  });
  gsap.fromTo(pols, { x: 0, y: () => innerHeight * .8, rotation: () => gsap.utils.random(-40, 40) }, {
    x: (i) => pols[i]._home.x, y: (i) => pols[i]._home.y, rotation: (i) => pols[i]._home.r,
    duration: 1.4, stagger: .12, ease: 'expo.out',
    scrollTrigger: { trigger: box, start: 'top 75%' },
  });
  pols.forEach(p => {
    let sx, sy, ox, oy, vx = 0, vy = 0, lx, ly, lt;
    p.addEventListener('pointerdown', (e) => {
      p.setPointerCapture(e.pointerId);
      gsap.killTweensOf(p);
      gsap.set(p, { zIndex: ++z });
      gsap.to(p, { scale: 1.06, rotation: 0, duration: .4, ease: 'expo.out' });
      sx = e.clientX; sy = e.clientY; ox = gsap.getProperty(p, 'x'); oy = gsap.getProperty(p, 'y');
      lx = sx; ly = sy; lt = performance.now();
      p._drag = true;
    });
    p.addEventListener('pointermove', (e) => {
      if (!p._drag) return;
      const now = performance.now(), dt = Math.max(1, now - lt);
      vx = (e.clientX - lx) / dt; vy = (e.clientY - ly) / dt;
      lx = e.clientX; ly = e.clientY; lt = now;
      gsap.set(p, { x: ox + e.clientX - sx, y: oy + e.clientY - sy, rotation: gsap.utils.clamp(-20, 20, vx * 12) });
    });
    const up = () => {
      if (!p._drag) return;
      p._drag = false;
      const W = box.offsetWidth / 2, H = box.offsetHeight / 2;
      gsap.to(p, {
        x: gsap.utils.clamp(-W, W, gsap.getProperty(p, 'x') + vx * 220),
        y: gsap.utils.clamp(-H, H, gsap.getProperty(p, 'y') + vy * 220),
        rotation: gsap.utils.random(-12, 12), scale: 1, duration: 1.1, ease: 'expo.out',
      });
    };
    p.addEventListener('pointerup', up);
    p.addEventListener('pointercancel', up);
  });
  gsap.from('.people__quote', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.people__quote', start: 'top 85%' } });

  /* ---------- ЧЕКИ: бесконечная лента ---------- */
  let rx = 0, speed = 1, targetSpeed = 1;
  const receipts = $('.receipts');
  receipts.addEventListener('pointerenter', () => targetSpeed = .15);
  receipts.addEventListener('pointerleave', () => targetSpeed = 1);
  let boost = 0;
  if (lenis) lenis.on('scroll', ({ velocity }) => { boost = gsap.utils.clamp(-8, 8, velocity * .6); });
  gsap.ticker.add((t, dt) => {
    speed += (targetSpeed - speed) * .06;
    boost *= .92;
    rx -= (speed + Math.abs(boost)) * dt * .06;
    const half = track.scrollWidth / 2;
    if (-rx >= half) rx += half;
    track.style.transform = `translate3d(${rx}px,0,0)`;
  });
  gsap.from('.receipt', {
    y: -300, rotation: () => gsap.utils.random(-20, 20), opacity: 0, duration: 1.2, stagger: .05, ease: 'expo.out', clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '.receipts', start: 'top 80%' },
  });

  /* ---------- НЕОН ---------- */
  const neon = $('.neon');
  const neonChars = splitChars($('.neon__word[data-flicker]'));
  neon.classList.add('is-off');
  ScrollTrigger.create({
    trigger: neon, start: 'top 75%', once: true,
    onEnter: () => {
      const seq = [80, 60, 120, 40, 200, 70, 400];
      let t = 0;
      seq.forEach((d, i) => { t += d; setTimeout(() => neon.classList.toggle('is-off', i % 2 === 1), t); });
      setTimeout(() => neon.classList.remove('is-off'), t + 100);
    },
  });
  // случайное мерцание одной буквы, как у настоящей вывески
  const flicker = () => {
    const c = neonChars[Math.floor(Math.random() * neonChars.length)];
    const blinks = 2 + Math.floor(Math.random() * 3);
    let k = 0;
    const b = () => { c.classList.toggle('off'); if (++k < blinks * 2) setTimeout(b, 40 + Math.random() * 90); else c.classList.remove('off'); };
    b();
    setTimeout(flicker, 2500 + Math.random() * 4000);
  };
  setTimeout(flicker, 5000);

  gsap.fromTo('.contacts__bg img', { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contacts', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.contacts__info > *', { y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.contacts__grid', start: 'top 80%' } });
  gsap.from('.contacts__map', { clipPath: 'inset(20% 20% 20% 20% round 24px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.contacts__map', start: 'top 85%' } });

  /* ---------- FOOTER ---------- */
  const fBig = $('.footer__big');
  const fChars = splitChars(fBig);
  // подгоняем кегль, чтобы слово ровно занимало ширину футера в одну строку
  const fitFooter = () => {
    fBig.style.fontSize = '100px';
    const first = fChars[0], last = fChars[fChars.length - 1];
    const w = last.offsetLeft + last.offsetWidth - first.offsetLeft, avail = fBig.clientWidth;
    if (w) fBig.style.fontSize = (100 * avail / w * .995) + 'px';
  };
  fitFooter();
  new ResizeObserver(fitFooter).observe(fBig.parentElement);
  document.fonts && document.fonts.ready.then(fitFooter);
  gsap.from(fChars, { yPercent: 100, opacity: 0, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 90%' } });

  // навигация сама подстраивается под яркость фона под ней
  let navRaf = 0;
  const navTheme = () => {
    if (navRaf) return;
    navRaf = requestAnimationFrame(() => {
      navRaf = 0;
      let node = document.elementsFromPoint(innerWidth / 2, 40).find(n => !n.closest('.nav, .cursor, .grain, .pour, .menu__preview'));
      let bg = 'rgb(18,13,10)';
      while (node && node !== document.documentElement) {
        const c = getComputedStyle(node).backgroundColor;
        if (c && !/rgba\(.*,\s*0\)$/.test(c) && c !== 'transparent') { bg = c; break; }
        node = node.parentElement;
      }
      const [r, g, b] = bg.match(/[\d.]+/g).map(Number);
      nav.classList.toggle('is-light', (0.299 * r + 0.587 * g + 0.114 * b) > 150);
    });
  };
  /* ---------- NAV: прогресс-чашка и активный пункт (после пина!) ---------- */
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(fill, { yPercent: 100 - p * 70 });
      val.textContent = Math.round(p * 100) + '%';
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 80);
      nav.classList.toggle('is-hidden', self.direction === 1 && y > 400 && !drawer.classList.contains('is-open'));
      root.classList.toggle('nav-shown', !nav.classList.contains('is-hidden'));
      navTheme();
    },
  });
  ['day', 'company', 'menu', 'people', 'contacts'].forEach(id => {
    const link = $(`.nav__links a[href="#${id}"]`);
    ScrollTrigger.create({
      trigger: '#' + id, start: 'top 50%', end: 'bottom 50%',
      onToggle: (s) => link.classList.toggle('is-active', s.isActive),
    });
  });

  // пересчёт после загрузки картинок и шрифтов
  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
