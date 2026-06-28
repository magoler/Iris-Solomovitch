/*
 * book.js — flipbook engine.
 * Renders RTL two-page spreads at locked A3-landscape proportions, scales the
 * spread to fit the viewport, animates a page-turn, and wires navigation + TOC.
 */
(function () {
  "use strict";

  const PAGE_W = 1240; // design px (A3 landscape ratio 1240/877 ≈ √2)
  const PAGE_H = 877;
  const FORWARD = 1, BACK = -1;

  const book = window.BOOK;
  const stage = document.getElementById("stage");
  const viewport = document.getElementById("viewport");
  const btnNext = document.getElementById("nav-next"); // forward (deeper, RTL → left)
  const btnPrev = document.getElementById("nav-prev"); // back
  const tocBtn = document.getElementById("toc-toggle");
  const tocPanel = document.getElementById("toc-panel");
  const counter = document.getElementById("counter");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let idx = 0;
  let animating = false;

  /* ---------- build DOM for one spread ---------- */
  function pageEl(page) {
    const wrap = document.createElement("div");
    wrap.className = "page-slot";
    wrap.innerHTML = page.html;
    const pageNo = document.createElement("span");
    pageNo.className = "page-no";
    pageNo.textContent = page.no;
    wrap.firstElementChild.appendChild(pageNo);
    return wrap;
  }

  function buildSpread(spread) {
    const el = document.createElement("div");
    el.className = "spread" + (spread.single ? " spread--single" : "");
    if (spread.single) {
      el.appendChild(pageEl(spread.page));
    } else {
      // RTL: right page first in DOM order so flexbox row-reverse not needed;
      // we explicitly place right then spine then left.
      el.appendChild(pageEl(spread.right));
      const spine = document.createElement("div");
      spine.className = "spine";
      el.appendChild(spine);
      el.appendChild(pageEl(spread.left));
    }
    return el;
  }

  /* ---------- scale spread to fit viewport ---------- */
  const BASE = "translate(-50%, -50%)"; // centring offset, composed into all transforms

  function fit(el) {
    const single = el.classList.contains("spread--single");
    const w = (single ? 1 : 2) * PAGE_W;
    const availW = viewport.clientWidth - 28;
    const availH = viewport.clientHeight - 20;
    const scale = Math.min(availW / w, availH / PAGE_H);
    el.style.width = w + "px";
    el.style.height = PAGE_H + "px";
    el._scale = scale;
    el.style.transform = `${BASE} scale(${scale})`;
    return scale;
  }

  function fitAll() {
    stage.querySelectorAll(".spread").forEach(fit);
  }

  /* ---------- render with page-turn animation ---------- */
  function render(target, dir) {
    target = Math.max(0, Math.min(book.spreads.length - 1, target));
    if (target === idx && stage.children.length) return;
    const next = buildSpread(book.spreads[target]);
    stage.appendChild(next);
    fit(next);

    const old = stage.querySelector(".spread.is-current");
    const finish = () => {
      if (old) old.remove();
      next.classList.add("is-current");
      idx = target;
      updateChrome();
      animating = false;
    };

    if (reduceMotion || !old) {
      if (old) old.remove();
      next.classList.add("is-current");
      idx = target;
      updateChrome();
      animating = false;
      return;
    }

    animating = true;
    const dur = 640;
    const ease = "cubic-bezier(.2,.7,.2,1)";
    // Forward (RTL): new page enters from the left; old swings out to the left.
    const sIn = dir === FORWARD ? -1 : 1;
    next.style.zIndex = 2;
    old.style.zIndex = 1;
    const sNew = next._scale || 1;
    const sOld = old._scale || sNew;

    old.animate(
      [
        { transform: `${BASE} scale(${sOld}) rotateY(0deg)`, opacity: 1, filter: "brightness(1)" },
        { transform: `${BASE} scale(${sOld}) rotateY(${sIn * 92}deg)`, opacity: 0.2, filter: "brightness(.8)" },
      ],
      { duration: dur, easing: ease, fill: "forwards" }
    );
    const a = next.animate(
      [
        { transform: `${BASE} scale(${sNew}) rotateY(${-sIn * 92}deg)`, opacity: 0.2, filter: "brightness(.8)" },
        { transform: `${BASE} scale(${sNew}) rotateY(0deg)`, opacity: 1, filter: "brightness(1)" },
      ],
      { duration: dur, easing: ease, fill: "forwards" }
    );
    a.onfinish = finish;
    a.oncancel = finish;
  }

  /* ---------- chrome: counter, arrow state, TOC active ---------- */
  function updateChrome() {
    const n = book.spreads.length;
    counter.textContent = `${idx + 1} / ${n}`;
    btnNext.disabled = idx >= n - 1;
    btnPrev.disabled = idx <= 0;
    // hash (without scroll jump)
    history.replaceState(null, "", "#" + idx);
    // active TOC row
    tocPanel.querySelectorAll("[data-jump]").forEach((b) => {
      const key = b.getAttribute("data-jump");
      const tgt = book.jumps[key];
      b.classList.toggle("is-active", tgt === idx || (key !== "resume" && tgt === idx));
    });
  }

  function goNext() { if (!animating) render(idx + 1, FORWARD); }
  function goPrev() { if (!animating) render(idx - 1, BACK); }
  function jumpTo(target) {
    if (animating || target === idx) { closeToc(); return; }
    render(target, target > idx ? FORWARD : BACK);
    closeToc();
  }

  /* ---------- Table of Contents panel ---------- */
  function buildToc() {
    const rows = book.projects
      .map((p, i) => `<li><button data-jump="${p.key}">
        <span class="tocp__num">${String(i + 1).padStart(2, "0")}</span>
        <span class="tocp__t"><b>${p.title}</b><em>${p.sub}</em></span>
        <span class="tocp__dot" style="background:${p.accent}"></span>
      </button></li>`)
      .join("");
    tocPanel.innerHTML = `
      <button class="tocp__name" data-jump="resume">${book.name}<small>קורות חיים</small></button>
      <ul class="tocp__list">${rows}</ul>`;
    tocPanel.querySelectorAll("[data-jump]").forEach((b) =>
      b.addEventListener("click", () => jumpTo(book.jumps[b.getAttribute("data-jump")]))
    );
  }
  function openToc() { tocPanel.classList.add("is-open"); tocBtn.setAttribute("aria-expanded", "true"); }
  function closeToc() { tocPanel.classList.remove("is-open"); tocBtn.setAttribute("aria-expanded", "false"); }
  function toggleToc() { tocPanel.classList.contains("is-open") ? closeToc() : openToc(); }

  /* ---------- input: keyboard, swipe, wheel-lock-free ---------- */
  function keyHandler(e) {
    if (e.key === "ArrowLeft") goNext();      // RTL: left = forward
    else if (e.key === "ArrowRight") goPrev(); // RTL: right = back
    else if (e.key === "Home") jumpTo(0);
    else if (e.key === "End") jumpTo(book.spreads.length - 1);
    else if (e.key === "Escape") closeToc();
  }

  let tsx = 0, tsy = 0;
  function touchStart(e) { const t = e.changedTouches[0]; tsx = t.clientX; tsy = t.clientY; }
  function touchEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - tsx, dy = t.clientY - tsy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goPrev(); else goNext(); // swipe left → back (RTL), swipe right → forward
    }
  }

  /* ---------- init ---------- */
  function init() {
    buildToc();
    btnNext.addEventListener("click", goNext);
    btnPrev.addEventListener("click", goPrev);
    tocBtn.addEventListener("click", toggleToc);
    document.addEventListener("keydown", keyHandler);
    viewport.addEventListener("touchstart", touchStart, { passive: true });
    viewport.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("resize", fitAll);
    document.addEventListener("click", (e) => {
      // clicks on the in-page TOC list (page 2) and name button
      const j = e.target.closest("[data-jump]");
      if (j && !tocPanel.contains(j)) {
        const t = book.jumps[j.getAttribute("data-jump")];
        if (t != null) jumpTo(t);
      }
    });

    const start = parseInt(location.hash.replace("#", ""), 10);
    idx = Number.isFinite(start) ? Math.max(0, Math.min(book.spreads.length - 1, start)) : 0;
    render(idx, FORWARD);
    document.body.classList.add("ready");
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
