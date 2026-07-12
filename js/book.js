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
  const lightbox = document.getElementById("lightbox");
  const lbStage = document.getElementById("lightbox-stage");
  const lbImg = document.getElementById("lightbox-img");
  const lbCap = document.getElementById("lightbox-cap");
  const lbMap = document.getElementById("lightbox-map");
  const lbMapImg = document.getElementById("lightbox-map-img");
  const lbView = document.getElementById("lightbox-map-view");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let idx = 0;
  let animating = false;

  /* ---------- build DOM for one spread ---------- */
  function pageEl(page, showNo = true) {
    const wrap = document.createElement("div");
    wrap.className = "page-slot";
    wrap.innerHTML = page.html;
    if (showNo) {
      const pageNo = document.createElement("span");
      pageNo.className = "page-no";
      pageNo.textContent = page.no;
      wrap.firstElementChild.appendChild(pageNo);
    }
    return wrap;
  }

  function buildSpread(spread) {
    const el = document.createElement("div");
    el.className = "spread" + (spread.single ? " spread--single" : "");
    if (spread.single) {
      // cover & back: still counted in page.no, but the folio is not shown
      el.appendChild(pageEl(spread.page, false));
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

  /* ---------- preload adjacent spreads ----------
     Only the current spread is ever in the DOM, so its board images (2–6 MB)
     download the moment you turn to it. To make page-turns feel instant we
     warm the browser cache for the neighbouring spreads while the reader is
     looking at the current one. Runs on idle so it never delays the current
     spread's own paint. */
  const _preloaded = new Set();
  const whenIdle = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 900 })
    : (fn) => setTimeout(fn, 250);
  function spreadImgSrcs(sp) {
    if (!sp) return [];
    const htmls = sp.single ? [sp.page.html] : [sp.right.html, sp.left.html];
    const out = [];
    for (const h of htmls) {
      const re = /\bsrc="([^"]+)"/g;
      let m;
      while ((m = re.exec(h))) out.push(m[1]);
    }
    return out;
  }
  function preloadAround(i) {
    for (const t of [i - 1, i + 1]) {
      if (t < 0 || t >= book.spreads.length) continue;
      for (const src of spreadImgSrcs(book.spreads[t])) {
        if (_preloaded.has(src)) continue;
        _preloaded.add(src);
        const im = new Image();
        im.decoding = "async";
        im.src = src;
      }
    }
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
      whenIdle(() => preloadAround(idx));
    };

    if (reduceMotion || !old) {
      if (old) old.remove();
      next.classList.add("is-current");
      idx = target;
      updateChrome();
      animating = false;
      whenIdle(() => preloadAround(idx));
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
    // show the actual page folios currently open (e.g. "36-37"), not the spread index
    const sp = book.spreads[idx];
    if (sp.single) {
      counter.textContent = String(sp.page.no);
    } else {
      const lo = Math.min(sp.right.no, sp.left.no);
      const hi = Math.max(sp.right.no, sp.left.no);
      counter.textContent = `${hi}-${lo}`;
    }
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
        <span class="tocp__num" style="color:${p.accent}">${String(i + 1).padStart(2, "0")}</span>
        <span class="tocp__t"><b>${p.title}</b><em>${p.sub}</em></span>
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

  /* ---------- image lightbox (with pinch / wheel zoom + drag pan) ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const MAX_ZOOM = 6;
  let zScale = 1, zTx = 0, zTy = 0;            // current transform
  const ptrs = new Map();                       // active pointers
  let panStart = null, pinchStart = null, moved = false;

  function clampPan() {
    const W = lbImg.clientWidth, H = lbImg.clientHeight;
    const Sw = lbStage.clientWidth, Sh = lbStage.clientHeight;
    const mx = Math.max(0, (zScale * W - Sw) / 2);
    const my = Math.max(0, (zScale * H - Sh) / 2);
    zTx = clamp(zTx, -mx, mx);
    zTy = clamp(zTy, -my, my);
  }
  function zApply() {
    clampPan();
    lbImg.style.transform = `translate(${zTx}px, ${zTy}px) scale(${zScale})`;
    lbImg.classList.toggle("zoomed", zScale > 1.01);
    updateMap();
  }
  // move the main view so the image-point under (clientX,clientY) on the minimap is centred
  function mapNavTo(clientX, clientY) {
    const r = lbMap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const W = lbImg.clientWidth, H = lbImg.clientHeight;
    const px = clamp((clientX - r.left) / r.width, 0, 1) * W - W / 2;
    const py = clamp((clientY - r.top) / r.height, 0, 1) * H - H / 2;
    zTx = -zScale * px;
    zTy = -zScale * py;
    zApply();
  }
  // draw the overview minimap + the rectangle marking the currently-visible region
  function updateMap() {
    if (zScale <= 1.01) { lbMap.classList.remove("is-on"); return; }
    const W = lbImg.clientWidth, H = lbImg.clientHeight;      // base (contain) size
    const Sw = lbStage.clientWidth, Sh = lbStage.clientHeight;
    if (!W || !H) return;
    // minimap sized to the image aspect, capped, and pinned to the image's bottom-left corner
    const MAXW = 150, MAXH = 170, INSET = 12;
    let mW = MAXW, mH = MAXW * H / W;
    if (mH > MAXH) { mH = MAXH; mW = MAXH * W / H; }
    lbMap.style.width = mW + "px";
    lbMap.style.height = mH + "px";
    lbMap.style.left = ((Sw - W) / 2 + INSET) + "px";       // image's left edge within the stage
    lbMap.style.bottom = ((Sh - H) / 2 + INSET) + "px";     // image's bottom edge within the stage
    // visible window in base image coords (origin = image centre)
    const pxMin = clamp((-Sw / 2 - zTx) / zScale, -W / 2, W / 2);
    const pxMax = clamp(( Sw / 2 - zTx) / zScale, -W / 2, W / 2);
    const pyMin = clamp((-Sh / 2 - zTy) / zScale, -H / 2, H / 2);
    const pyMax = clamp(( Sh / 2 - zTy) / zScale, -H / 2, H / 2);
    lbView.style.left = ((pxMin + W / 2) / W * mW) + "px";
    lbView.style.top = ((pyMin + H / 2) / H * mH) + "px";
    lbView.style.width = ((pxMax - pxMin) / W * mW) + "px";
    lbView.style.height = ((pyMax - pyMin) / H * mH) + "px";
    lbMap.classList.add("is-on");
  }
  function zReset() { zScale = 1; zTx = 0; zTy = 0; zApply(); }
  function stageCenter() {
    const r = lbStage.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }
  // zoom toward a screen point, keeping the image-point under it fixed
  function zoomAt(clientX, clientY, newScale) {
    newScale = clamp(newScale, 1, MAX_ZOOM);
    const { cx, cy } = stageCenter();
    const dx = clientX - cx, dy = clientY - cy;
    const px = (dx - zTx) / zScale, py = (dy - zTy) / zScale;
    zScale = newScale;
    zTx = dx - zScale * px;
    zTy = dy - zScale * py;
    if (zScale <= 1) { zTx = 0; zTy = 0; }
    zApply();
  }

  function lbOpen(src, alt) {
    if (!src) return;
    lbImg.src = src;
    lbImg.alt = alt || "";
    lbMapImg.src = src;
    lbCap.textContent = alt || "";
    zReset();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function lbClose() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lbImg.removeAttribute("src");
    lbMapImg.removeAttribute("src");
    lbMap.classList.remove("is-on");
    ptrs.clear(); panStart = pinchStart = null;
    zReset();
  }
  const lbIsOpen = () => lightbox.classList.contains("is-open");

  function lbWireZoom() {
    // wheel zoom (desktop) — gentle step
    const STEP = 1.08;
    lbStage.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, zScale * (e.deltaY < 0 ? STEP : 1 / STEP));
    }, { passive: false });
    // double-click / double-tap toggles zoom
    lbImg.addEventListener("dblclick", (e) => {
      e.preventDefault();
      if (zScale > 1) zReset(); else zoomAt(e.clientX, e.clientY, 2.5);
    });
    // pointer-based pan + pinch
    lbStage.addEventListener("pointerdown", (e) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (ptrs.size === 1) {
        panStart = { x: e.clientX, y: e.clientY, tx: zTx, ty: zTy };
      } else if (ptrs.size === 2) {
        const p = [...ptrs.values()];
        pinchStart = { dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), scale: zScale };
        panStart = null;
      }
      try { lbStage.setPointerCapture(e.pointerId); } catch (_) {}
    });
    lbStage.addEventListener("pointermove", (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2 && pinchStart) {
        const p = [...ptrs.values()];
        const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        const mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2;
        zoomAt(mx, my, pinchStart.scale * (dist / pinchStart.dist));
        moved = true;
      } else if (ptrs.size === 1 && panStart && zScale > 1) {
        zTx = panStart.tx + (e.clientX - panStart.x);
        zTy = panStart.ty + (e.clientY - panStart.y);
        moved = true;
        zApply();
      }
    });
    const endPtr = (e) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinchStart = null;
      if (ptrs.size === 0) panStart = null;
    };
    lbStage.addEventListener("pointerup", endPtr);
    lbStage.addEventListener("pointercancel", endPtr);

    // minimap is interactive: click / drag on it steers the main view
    let mapDrag = false;
    lbMap.addEventListener("pointerdown", (e) => {
      e.stopPropagation();                       // don't let the stage start a pan/pinch
      mapDrag = true;
      try { lbMap.setPointerCapture(e.pointerId); } catch (_) {}
      mapNavTo(e.clientX, e.clientY);
    });
    lbMap.addEventListener("pointermove", (e) => {
      if (!mapDrag) return;
      e.stopPropagation();
      mapNavTo(e.clientX, e.clientY);
    });
    const endMap = (e) => {
      if (!mapDrag) return;
      mapDrag = false;
      try { lbMap.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    lbMap.addEventListener("pointerup", endMap);
    lbMap.addEventListener("pointercancel", endMap);
    lbMap.addEventListener("click", (e) => e.stopPropagation());   // clicking the map never closes
    lbMap.addEventListener("wheel", (e) => { e.stopPropagation(); }, { passive: true });
  }

  /* ---------- input: keyboard, swipe, wheel-lock-free ---------- */
  function keyHandler(e) {
    if (lbIsOpen()) { if (e.key === "Escape") lbClose(); return; } // lightbox traps keys
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

    // click any figure / cover image to view it large
    stage.addEventListener("click", (e) => {
      // board hotspots: open the matching high-res file
      const hot = e.target.closest(".flo-hotspot");
      if (hot) { e.stopPropagation(); lbOpen(hot.dataset.hires, hot.dataset.cap); return; }
      const img = e.target.closest(".figure__img img, .page--coverimg .bleed, .page--sea-out .out img, .page--sea12 figure img");
      if (!img || img.closest(".figure--missing")) return;
      e.stopPropagation();
      lbOpen(img.dataset.hires || img.currentSrc || img.src, img.dataset.cap || img.alt);
    });
    // close only when clicking OUTSIDE the image (backdrop / stage margins / × button);
    // clicks on the image pan/zoom and a drag must never trigger a close
    lbWireZoom();
    lightbox.addEventListener("click", (e) => {
      if (moved) { moved = false; return; }       // ignore the click that ended a drag/pinch
      if (e.target === lbImg || e.target === lbCap) return;
      lbClose();
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
