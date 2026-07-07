/*
 * content.js — single source of truth for the portfolio book.
 *
 * The book is a sequence of SPREADS. Each interior spread shows two A3-landscape
 * pages side by side; the cover and back are single centered pages.
 * Reading order is RTL (Hebrew): the lower page number sits on the RIGHT,
 * the higher page number on the LEFT.
 *
 * To add a project's real images later: drop files into
 *   assets/projects/<key>/   and replace the placeholder page builders below.
 */
(function () {
  "use strict";

  const NAME = "איריס שגיא סולומוביץ'";
  const BG = "assets/backgrounds/bw.svg";
  const SEA = "assets/projects/seeing-the-sea/";
  const MAR = "assets/projects/maryam/";
  const URB = "assets/projects/urban/";
  const TIM = "assets/projects/time/";

  /* ---------- small HTML builders ---------- */

  const esc = (s) => s; // text is trusted (authored here)

  // A figure: real image if src given, else an on-brand placeholder slot.
  function fig(src, caption, cls = "", accent) {
    const cap = caption
      ? `<figcaption class="caption">${caption}</figcaption>`
      : "";
    if (src) {
      return `<figure class="figure ${cls}">
        <div class="figure__img"><img src="${src}" alt="${caption || ""}" loading="lazy"
          onerror="this.closest('.figure').classList.add('figure--missing')"></div>
        ${cap}
      </figure>`;
    }
    const style = accent ? ` style="--slot-accent:${accent}"` : "";
    return `<figure class="figure figure--placeholder ${cls}"${style}>
      <div class="figure__img"><span class="slot-mark">${caption || "תוכן"}</span></div>
      ${cap}
    </figure>`;
  }

  // Project cover — image page (full bleed)
  function coverImage(src, caption, accent) {
    if (src) {
      return `<div class="page page--coverimg" style="--accent:${accent}">
        <img class="bleed" src="${src}" alt="${caption || ""}">
      </div>`;
    }
    return `<div class="page page--coverimg page--coverimg-empty" style="--accent:${accent}">
      <div class="bleed slot"><span class="slot-mark">${caption}</span></div>
    </div>`;
  }

  // Project cover — title over hero
  function coverTitle(title, sub, src, accent) {
    const bg = src
      ? `style="--accent:${accent};background-image:linear-gradient(0deg,rgba(255,255,255,.10),rgba(255,255,255,.10)),url('${src}')"`
      : `style="--accent:${accent}"`;
    const cls = src ? "" : "page--covertitle-empty";
    return `<div class="page page--covertitle ${cls}" ${bg}>
      <div class="covertitle__inner">
        <h2 class="covertitle__title">${title}</h2>
        ${sub ? `<p class="covertitle__sub">${sub}</p>` : ""}
      </div>
    </div>`;
  }

  // Standard content page: top-right project title + body
  function contentPage(title, bodyHTML, accent, extraCls = "") {
    return `<div class="page page--content ${extraCls}" style="--accent:${accent}">
      <header class="content__head"><h3 class="content__title">${title}</h3></header>
      <div class="content__body">${bodyHTML}</div>
    </div>`;
  }

  function placeholderBadge() {
    return `<div class="wip"><span>בקרוב</span></div>`;
  }

  /* ---------- projects (for Table of Contents) ---------- */

  // Order + text follow the TOC template. Each project has ONE theme colour used
  // both for its TOC page-number (`num`) and as the accent across its pages
  // (cover title, content underline, cover-image field) so the two always match.
  const projects = [
    { key: "florentin", title: "מופע פלורנטין", sub: "סטודיו מורכב | בהנחיית אדר' רמי גיל | שנה ד' סמסטר ב'",                        accent: "#9E1E29", num: "#9E1E29" },
    { key: "urban",     title: "מדרחוב",        sub: "סטודיו אורבני | בהנחיית אדר' תמר פרצוב ואדר' יואב וינברג | שנה ג' סמסטר א'",   accent: "#9F248F", num: "#9F248F" },
    { key: "sea",       title: "לראות את הים",   sub: "סטודיו שימור | בהנחיית פרופ' אדר' אמנון בר-אור | שנה ד' סמסטר א'",            accent: "#209092", num: "#209092" },
    { key: "time",      title: "Space Time",    sub: "סטודיו מגורים | בהנחיית אדר' דפנה מתוק ואדר' לאונרדו קליכמן | שנה ג' סמסטר ב'", accent: "#34409A", num: "#34409A" },
    { key: "maryam",    title: "מרי-ם",         sub: "עיצוב פנים | בהנחיית אדר' רוני אלרואי | שנה ד' סמסטר א'",                      accent: "#E4AA24", num: "#E4AA24" },
  ];
  const accent = Object.fromEntries(projects.map((p) => [p.key, p.accent]));
  // Look up a project's TOC title/subtitle by key so covers stay in sync with the TOC.
  const byKey = Object.fromEntries(projects.map((p) => [p.key, p]));

  // Spread index of each project's cover (also drives the jump targets below).
  const coverSpread = { florentin: 2, urban: 5, sea: 8, time: 11, maryam: 14 };
  // Page numbers a project occupies. The cover is 1 page and every later spread is
  // 2 pages, so the right (lower) page of spread s is 2·s; a project = cover spread + 2
  // content spreads → 6 pages. (Cover=1 and back are counted but their folio is hidden.)
  const pad2 = (n) => String(n).padStart(2, "0");
  const projPages = (k) => { const s = coverSpread[k]; return [2 * s, 2 * (s + 2) + 1]; };

  /* ---------- page 1 — Cover (full-bleed artwork) ---------- */
  const coverPage = `<div class="page page--cover">
      <img class="page-bleed" src="assets/backgrounds/cover.svg" alt="${NAME} — Portfolio">
    </div>`;

  /* ---------- page 2 — Table of Contents ---------- */
  // Clicking the project name jumps to that project (data-jump=key). The page
  // number sits on the band side (left of the grey band), coloured per project.
  const tocRows = projects
    .map((p, i) => {
      const [first, last] = projPages(p.key);
      return `<li class="toc__item" data-jump="${p.key}" role="link" tabindex="0">
        <span class="toc__num" style="color:${p.num}">${String(i + 1).padStart(2, "0")}</span>
        <span class="toc__txt"><b>${p.title}</b><em>${p.sub}</em></span>
        <span class="toc__pages">${pad2(first)}–${pad2(last)}</span>
      </li>`;
    })
    .join("");
  const tocPage = `<div class="page page--toc">
      <header class="sheet__head"><h2 class="sheet__title">תוכן עניינים</h2></header>
      <ul class="toc__list">${tocRows}</ul>
    </div>`;

  /* ---------- page 3 — Resume ---------- */
  const resumePage = `<div class="page page--resume">
      <header class="cv__head">
        <div class="cv__headtext">
          <h2 class="cv__name">${NAME}</h2>
          <div class="cv__contact">רחובות | ש.לידה: 2001 | iris.solomovitch59@gmail.com | 050-7200198</div>
          <p class="cv__lead">סטודנטית לתואר ראשון באדריכלות, B.Arch, ולתואר שני באדריכלות, M.A, באוניברסיטת תל אביב.
            בעלת ניסיון בפרויקטים אדריכליים מורכבים בלימודים, לצד רקע טכנולוגי ופיקודי משמעותי, חשיבה אנליטית ויכולת למידה גבוהה.</p>
        </div>
        <img class="cv__photo" src="assets/iris.jpg" alt="${NAME}">
      </header>
      <div class="cv__cols">
        <section class="cv__col">
          <h3 class="cv__sec">השכלה:</h3>
          <div class="cv__item"><span class="cv__yr">2026—הווה</span><div>תואר שני באדריכלות M.A באוניברסיטת תל אביב</div></div>
          <div class="cv__item"><span class="cv__yr">2022—הווה</span><div>תואר ראשון באדריכלות B.Arch באוניברסיטת תל אביב
            <ul><li>מועמדות לפרס מישל גלרובין – פרויקט סטודיו אורבני, מדרחוב נווה שאנן</li>
            <li>זכייה במקום שני בתחרות בית ספרית בנושא "חיבור" – פרויקט סטודיו שימור, פארק מדרון יפו</li></ul></div></div>
          <div class="cv__item"><span class="cv__yr">2017—2018</span><div>למידה בבית הספר לאסטרונאוטים צעירים במכון דוידסון, המכון החינוכי של מכון וייצמן למדע
            <ul><li>ראש צוות habitat – אחראית על התכנון הראשוני של מבנה המגורים שדימה חיים על מאדים</li></ul></div></div>
          <div class="cv__item"><span class="cv__yr">2016—2019</span><div>בגרות מלאה טכנולוגית, מגמת הנדסת תוכנה, תיכון דה שליט, רחובות
            <ul><li>בוגרת כיתת מופ"ת מדעית: 5 יח"ל מתמטיקה | 5 יח"ל אנגלית | 5 יח"ל פיזיקה | 10 יח"ל מחשבים</li>
            <li>בעלת תעודת בגרות הצטיינות חברתית - התנדבות וסיוע בבתי ספר ברחובות</li></ul></div></div>
          <h3 class="cv__sec">ניסיון תעסוקתי:</h3>
          <div class="cv__item"><span class="cv__yr">2021—2022</span><div>אחראית הטמעת מערכת מידע, חברת ג'ון ברייס
            <ul><li>אחריות על הובלת תהליכי הטמעה בארגונים, העברת הדרכות והטמעות, פיתוח אמצעי הדרכה.</li>
            <li>ניהול צוות מטמיעים, הכשרת צוות מטמיעים מקצועית, ביצוע ריענוני ידע.</li>
            <li>ניהול קשרים עם מנהלים ולקוחות, ריכוז וניהול דו"חות מנהלים.</li></ul></div></div>
        </section>
        <section class="cv__col">
          <h3 class="cv__sec">שירות צבאי:</h3>
          <div class="cv__item"><span class="cv__yr">2019—2021</span><div>מפקדת ומדריכת תקשוב, בענף לוחמה מבוססת רשת וסייבר, בבה"ד 7 (שחרור בדרגת סמל)
            <ul><li>פיתוח והובלת מערכי הדרכה טכנולוגיים למגוון יחידות צה"ל.</li>
            <li>פיתוח אמצעי הדרכה עם מפתחי המערכות ולאחר מכן הטמעתן ביחידות הצבא.</li>
            <li>ניהול אירועים מקצועיים, פיקוד על חיילים במהלך חפיפה לתפקיד.</li></ul></div></div>
          <h3 class="cv__sec">יישומי מחשב:</h3>
          <ul class="cv__skills">
            <li><b>תכנון BIM:</b> Revit – שליטה גבוהה | AutoCAD – שליטה גבוהה</li>
            <li><b>תכנון פרמטרי:</b> Grasshopper – שליטה טובה | Rhino – שליטה גבוהה</li>
            <li><b>גרפיקה:</b> Illustrator – שליטה טובה | Photoshop – ניסיון עבודה |<br>Lumion – שליטה טובה | D5 – ניסיון עבודה</li>
            <li><b>שפות תכנות:</b> Python – היכרות | C# - היכרות</li>
            <li><b>כללי:</b> Office – שליטה גבוהה</li>
          </ul>
          <h3 class="cv__sec">שפות:</h3>
          <p class="cv__lang">עברית - שפת אם | אנגלית - ברמה גבוהה מאוד | רומנית - ברמה גבוהה מאוד</p>
        </section>
      </div>
    </div>`;

  /* ---------- page 24 — Back (full-bleed artwork, mirror of cover) ---------- */
  const backPage = `<div class="page page--back">
      <img class="page-bleed" src="assets/backgrounds/back.svg" alt="${NAME} — Portfolio">
    </div>`;

  /* =====================================================================
   *  PROJECT 1 — Urban (placeholder)
   * =================================================================== */
  // Iris's two ready-made cover artworks (full-bleed, exact A3 ratio):
  //   cover-title.svg — titled "MIDרחוב" elevation (crisp vector title) → left page
  //   cover-hero.jpg  — the street-elevation sketch                     → right page
  const urban_cover_img = `<div class="page page--coverbleed"><img class="page-bleed" src="${URB}cover-hero.jpg" alt="${byKey.urban.title} — נווה שאנן"></div>`;
  const urban_cover_title = `<div class="page page--coverbleed"><img class="page-bleed" src="${URB}cover-title.svg" alt="${byKey.urban.title}"></div>`;
  const urban_c1 = contentPage(
    byKey.urban.title,
    `<div class="c1col">
       <p class="proj-desc">מחקר על המרחב הציבורי, רוח המקום והחיבור שבין הקהילה, הסביבה והמסחר ברחוב
         נווה שאנן. מפת הנולי ותכנית האב מציבות מבנה חדש לאורך הציר, לצד עקרונות תכנון להשבת החיים אל המדרחוב.</p>
       <div class="grid grid--urban6">
         ${fig(URB + "map-5000.jpg", "מפת המתחם 1:5,000", "fig--wide", accent.urban)}
         ${fig(URB + "concept-2500.jpg", "מצב מוצע — תכנית אב 1:2,500", "fig--big", accent.urban)}
         ${fig(URB + "massing.jpg", "אבולוציית המסה — קיים · קרקע · גבהים", "", accent.urban)}
         ${fig(URB + "principles.jpg", "עקרונות תכנון", "", accent.urban)}
       </div>
     </div>`,
    accent.urban
  );
  const urban_c2 = contentPage(
    "",
    `<div class="grid grid--urban7">
       ${fig(URB + "render-pedestrian.jpg", "הדמיה — המדרחוב", "fig--hero", accent.urban)}
       ${fig(URB + "render-facade.jpg", "הדמיה — חזית מסחרית", "", accent.urban)}
       ${fig(URB + "siteplan.jpg", "תכנית המתחם", "", accent.urban)}
     </div>`,
    accent.urban,
    "page--content-flush"
  );
  const urban_c3 = contentPage(
    "",
    `<div class="grid g-2up1">
       ${fig(URB + "context.jpg", "מצב קיים — רחוב נווה שאנן", "", accent.urban)}
       ${fig(URB + "mobility.jpg", "מפת תחבורה ונגישות 1:15,000", "", accent.urban)}
       ${fig(URB + "nolli-color.jpg", "מפת נולי — דמות ורקע", "", accent.urban)}
     </div>`,
    accent.urban,
    "page--content-flush"
  );
  const urban_c4 = contentPage(
    "",
    `<div class="grid stack-2">
       ${fig(URB + "street-elevation.jpg", "רישום רחוב — חזית המדרחוב", "fig--draw", accent.urban)}
       ${fig(URB + "section.jpg", "חתך רחוב", "fig--draw", accent.urban)}
     </div>`,
    accent.urban,
    "page--content-flush"
  );

  /* =====================================================================
   *  PROJECT 2 — Seeing the Sea (REAL)  — whole renders, never cropped
   * =================================================================== */
  // Iris's two ready-made cover artworks (full-bleed, exact A3 ratio):
  //   cover-title.svg — titled hero (crisp vector title) → left page
  //   cover-hero.jpg  — the courtyard render            → right page
  const sea_cover_img = `<div class="page page--coverbleed"><img class="page-bleed" src="${SEA}cover-hero.jpg" alt="${byKey.sea.title} — פארק מדרון יפו"></div>`;
  const sea_cover_title = `<div class="page page--coverbleed"><img class="page-bleed" src="${SEA}cover-title.svg" alt="${byKey.sea.title}"></div>`;

  // --- helpers: each project output is an individual, separately-zoomable tile,
  //     cut as a rectangle from the source PDF (its own background kept) with the
  //     matching title from the PDF re-typeset below it in Ploni. ---
  const outFig = (src, title, sub, cls) =>
    `<figure class="out${cls ? " " + cls : ""}">
       <img src="${src}" alt="${(title || "").replace(/<[^>]+>/g, "")}" loading="lazy">
       ${title ? `<figcaption class="out-cap"><b>${title}</b>${sub ? `<span>${sub}</span>` : ""}</figcaption>` : ""}
     </figure>`;
  const panelFig = (src, n) =>
    `<figure class="out panel"><img src="${SEA + src}" alt="" loading="lazy"><span class="panel-num">${n}</span></figure>`;

  // c1 (page 12) — concept paragraph (top) + marine-gallery plan beside the
  // 1936 British map and the top-view render (matched in scale to the upper plan on p.13)
  const sea_c1 = `<div class="page page--sea12">
      <div class="sea12-col sea12-left">
        <figure class="sea12-model">
          <img src="${SEA}model.jpg" alt="מודל עבודה — פארק המדרון">
          <figcaption>מודל עבודה</figcaption>
        </figure>
        <div class="sea12-stack">
          <figure>
            <img src="${SEA}g-topview.jpg" alt="מבט על — הבנוי בפרויקט">
            <figcaption>מבט על – הבנוי בפרויקט | <bdi>1:500</bdi></figcaption>
          </figure>
          <figure>
            <img src="${SEA}g-british.jpg" alt="מיפוי בריטי 1936">
            <figcaption>מיפוי בריטי משנת <bdi>1936</bdi> | <bdi>1:500</bdi></figcaption>
          </figure>
        </div>
      </div>
      <div class="sea12-col sea12-right">
        <div class="sea12-head">
          <h3 class="content__title">לראות את הים</h3>
          <p class="proj-desc sea12-lead">הפרויקט עוסק בחשיפת השכבות הסמויות של פארק המדרון ביפו, ובבחינה מחודשת
            של המתח בין זיכרון להדחקה במרחב העירוני. מתוך קריאה היסטורית וביקורתית, הפרויקט מבקש להחזיר אל פני
            השטח את הסיפור המקומי שנדחק, וליצור חיבור מחודש בין שכונות עג׳מי וג׳בליה לבין הים. ההתערבות האדריכלית
            מציעה מערכת מרחבית המשלבת חינוך, תרבות ופעילות קהילתית, באמצעות מרחבים פתוחים וגמישים המעודדים מפגש,
            למידה ועשייה משותפת. כך הופך הזיכרון למרכיב פעיל המעצב את חוויית המקום ואת חיי הקהילה.</p>
        </div>
        <figure class="sea12-gallery">
          <img src="${SEA}g-gallery.jpg" alt="תכנית גלריה ימית">
          <figcaption>תכנית גלריה ימית וקיוסק הטיילת – מפלס <bdi>8.67+</bdi> | <bdi>1:100</bdi></figcaption>
        </figure>
      </div>
    </div>`;

  // c2 (page 13) — PDF page 5: interior renders (left) + upper-construction plan (right, by the spine)
  const sea_c2 = `<div class="page page--sea-out sea13">
      <div class="sea13-renders">
        ${outFig(SEA + "s13-r1.jpg", 'ארכיון, ספריה וחללי שיח <bdi>History-telling</bdi>', "מידע אודות השכונה והעברת שיח חוויתי ולימודי בין עבר-הווה-עתיד")}
        ${outFig(SEA + "s13-r2.jpg", "רחבה קהילתית", "אירועים שכונתיים ופעילויות א-פורמליות")}
        ${outFig(SEA + "s13-r3.jpg", "תערוכת צילום", "אודות שכונת עג׳מי וג׳בליה")}
        ${outFig(SEA + "s13-r4.jpg", "תערוכת קבע ימית", "אודות קו החוף המקורי, בסמוך לטיילת חוף הים")}
      </div>
      ${outFig(SEA + "s13-plan.jpg", 'תכנית בינוי עליון – מפלסים <bdi>15.65+</bdi>, <bdi>13.65+</bdi> | <bdi>1:100</bdi>', null, "sea13-plan")}
    </div>`;

  // c3 (page 14) — PDF page 2: spatial-intervention sequence (6 panels, captions baked in)
  const sea_c3 = `<div class="page page--sea-out sea14">
      <div class="sea14-title">ניסוח פעולות ההתערבות במרחב | "פארק מדרון יפו"</div>
      <div class="sea14-grid">
        ${panelFig("s14-p1.jpg", 1)}${panelFig("s14-p4.jpg", 4)}
        ${panelFig("s14-p2.jpg", 2)}${panelFig("s14-p5.jpg", 5)}
        ${panelFig("s14-p3.jpg", 3)}${panelFig("s14-p6.jpg", 6)}
      </div>
    </div>`;

  // c4 (page 15) — PDF page 3: axonometric, before/after sections, sketches, long section & elevations
  const sea_c4 = `<div class="page page--sea-out sea15">
      <div class="sea15-top">
        <figure class="out sea15-axon"><img src="${SEA}s15-axon.jpg" alt="אקסונומטריה — מבני המכלול" loading="lazy"></figure>
        <div class="sea15-sections">
          ${outFig(SEA + "s15-before.jpg", "מצב קיים", "חסימת זרימת המים על ידי המסלעה הקיימת")}
          ${outFig(SEA + "s15-after.jpg", "מצב חדש", "שימור הגשר הקיים ופתיחת המעבר לטובת זרימת המים ויצירת לגונה חדשה הצופה אל יפו")}
        </div>
        <div class="sea15-sketches">
          <figure class="out"><img src="${SEA}s15-sk1.jpg" alt="" loading="lazy"></figure>
          <figure class="out"><img src="${SEA}s15-sk2.jpg" alt="" loading="lazy"></figure>
          <figure class="out"><img src="${SEA}s15-sk3.jpg" alt="" loading="lazy"></figure>
        </div>
      </div>
      ${outFig(SEA + "s15-longsec.jpg", 'חתך א–א | <bdi>1:200</bdi>', null, "sea15-longsec")}
      <div class="sea15-bottom">
        ${outFig(SEA + "s15-east.jpg", "חזית מזרחית – מרחוב קדם", null, "sea15-east")}
        ${outFig(SEA + "s15-bb.jpg", 'חתך ב–ב | <bdi>1:100</bdi>', null, "sea15-bb")}
      </div>
    </div>`;

  /* =====================================================================
   *  PROJECT 3 — Time · Space Housing (placeholder, blue)
   * =================================================================== */
  // Iris's two ready-made cover artworks (full-bleed, exact A3 ratio):
  //   cover-title.svg — titled courtyard render (crisp vector title) → left page
  //   cover-hero.jpg  — the structure/courtyard render               → right page
  const time_cover_img = `<div class="page page--coverbleed"><img class="page-bleed" src="${TIM}cover-hero.jpg" alt="${byKey.time.title}"></div>`;
  const time_cover_title = `<div class="page page--coverbleed"><img class="page-bleed" src="${TIM}cover-title.svg" alt="${byKey.time.title}"></div>`;
  const time_c1 = contentPage(
    byKey.time.title,
    `<div class="c1col">
       <p class="proj-desc">פרויקט דיור החוקר את היחס בין <b>סטראוטומיה</b> (גזירה ממסה) לבין <b>טקטוניקה</b>
         (הרכבה), ואת התפתחות המבנה בזמן — Time · Space. המסה נחקרת בסדרת שלבים, ממודל ראשוני ועד למקבץ הדיור.</p>
       <div class="grid g-1up2">
         ${fig(TIM + "stereotomy.jpg", "סטראוטומיה ↔ טקטוניקה — גזירה ממסה והרכבה", "", accent.time)}
         ${fig(TIM + "concept.jpg", "סכמת הפרויקט — שלבי המסה", "", accent.time)}
         ${fig(TIM + "massing.jpg", "מודל מסה — מבט אווירי", "", accent.time)}
       </div>
     </div>`,
    accent.time
  );
  const time_c2 = contentPage(
    "",
    `<div class="grid grid--2">
       ${fig(TIM + "render-courtyard.jpg", "הדמיה — חצר פנימית", "", accent.time)}
       ${fig(TIM + "render-garden.jpg", "הדמיה — הגן והפרגולה", "", accent.time)}
       ${fig(TIM + "render-plaza.jpg", "הדמיה — מבט רחוב", "", accent.time)}
       ${fig(TIM + "render-dawn.jpg", "הדמיה — לפנות בוקר", "", accent.time)}
     </div>`,
    accent.time,
    "page--content-flush"
  );
  const time_c3 = contentPage(
    "",
    `<div class="grid g-2up1">
       ${fig(TIM + "elev-east.jpg", "חזית מזרחית פנימית", "fig--draw", accent.time)}
       ${fig(TIM + "elev-west.jpg", "חזית מערבית פנימית", "fig--draw", accent.time)}
       ${fig(TIM + "section-bb.jpg", "חתך ב־ב", "fig--draw", accent.time)}
     </div>`,
    accent.time,
    "page--content-flush"
  );
  const time_c4 = contentPage(
    "",
    `<div class="grid grid--2">
       ${fig(TIM + "ground-plan.jpg", "תכנית קומת קרקע וקומה טיפוסית", "fig--draw", accent.time)}
       ${fig(TIM + "unit-types.jpg", "טיפוסי דירה", "fig--draw", accent.time)}
       ${fig(TIM + "section-aa.jpg", "חתך א־א", "fig--draw", accent.time)}
       ${fig(TIM + "site-plan.jpg", "תכנית מתחם", "fig--draw", accent.time)}
     </div>`,
    accent.time,
    "page--content-flush"
  );

  /* =====================================================================
   *  PROJECT 4 — Maryam interior (REAL)  pages 16–19
   *  "מגורים בין־דוריים" — דירה בחולון לסבתא מרים ולנכדתה מרי, בהשראת מלון אלמא.
   * =================================================================== */
  // Iris's two ready-made cover artworks (full-bleed, exact A3 ratio):
  //   cover-title.svg — titled interior (crisp vector gold title) → left page
  //   cover-hero.jpg  — the living-room render                    → right page
  const maryam_cover_img = `<div class="page page--coverbleed"><img class="page-bleed" src="${MAR}cover-hero.jpg" alt="${byKey.maryam.title} — עיצוב פנים"></div>`;
  const maryam_cover_title = `<div class="page page--coverbleed"><img class="page-bleed" src="${MAR}cover-title.svg" alt="${byKey.maryam.title}"></div>`;

  // c1 (page 18, right) — title + paragraph + whole-apartment axon (right half);
  //                        proposed colored plan, private/public (left half, toward the spine)
  const maryam_c1 = contentPage(
    byKey.maryam.title,
    `<div class="mc1-grid">
       <div class="mc1-side">
         <p class="proj-desc">פרויקט עיצוב פנים לדירה בחולון, לסבתא מרים ולנכדתה מרי, החיות כיום
           בשתי קומות נפרדות. התכנון מבקש לבטל את הניתוק שבין הדורות ולייצר קרבה: הקיר שהפריד בין
           שני המודולים הוסר, וקופסאות האור הופכות לאלמנט מכליל המגדיר את המרחב. בהשראת מלון אלמא —
           אורכניות, המשכיות וקירות בטון הזורמים פנימה — והעיקרון המוביל לכל אורך הפרויקט: <b>ריחוף</b>.</p>
         ${fig(MAR + "axon.jpg", "פרספקטיבה — מבט־על על מכלול הדירה", "fig--draw", accent.maryam)}
       </div>
       ${fig(MAR + "plan-zones.jpg", "תכנית מוצעת 1:50 — הפרדה בין הפרטי לציבורי", "fig--draw mc1-plan", accent.maryam)}
     </div>`,
    accent.maryam,
    "page--maryam-c1"
  );

  // c2 (page 19, left) — dimensioned plan (right half, toward the spine);
  //                       living-room render (top) + floating-cabinet detail (bottom), beside the plan
  const maryam_c2 = contentPage(
    "",
    `<div class="mc2-grid">
       ${fig(MAR + "plan-dim.jpg", "תכנית דירה 1:50 — מידות ופריסת החללים", "fig--draw mc2-plan", accent.maryam)}
       <div class="mc2-side">
         ${fig(MAR + "render-living.jpg", "הדמיה — מבט לסלון", "", accent.maryam)}
         ${fig(MAR + "detail-cabinet.jpg", "פרט — ארון מרחף · מעמד עמודי נירוסטה", "fig--draw", accent.maryam)}
       </div>
     </div>`,
    accent.maryam,
    "page--content-flush page--maryam-c2"
  );

  // c3 (page 20, right) — render that reveals the detail + the detail beneath it,
  //                       and an adjacent half-page render
  const maryam_c3 = contentPage(
    "",
    `<div class="mc-detail">
       <div class="mc-pair">
         ${fig(MAR + "render-shelfwall.jpg", "הדמיה — קיר המדפים המרחפים", "", accent.maryam)}
         ${fig(MAR + "detail-shelf.jpg", "פרט — חיבור מדף נירוסטה לקיר גבס 1:10", "fig--draw", accent.maryam)}
       </div>
       ${fig(MAR + "render-cabinet.jpg", "הדמיה — קונסולת הסלון המרחפת", "mc-aside", accent.maryam)}
     </div>`,
    accent.maryam,
    "page--content-flush page--maryam-detail"
  );

  // c4 (page 21, left) — same pattern: render revealing the light-box detail + the detail,
  //                      with an adjacent half-page render
  const maryam_c4 = contentPage(
    "",
    `<div class="mc-detail">
       ${fig(MAR + "render-mari.jpg", "הדמיה — חדר מרי", "mc-aside", accent.maryam)}
       <div class="mc-pair">
         ${fig(MAR + "render-cove.jpg", "הדמיה — קופסת האור בתקרה", "", accent.maryam)}
         ${fig(MAR + "detail-lightbox.jpg", "פרט — קופסת אור והנמכת תקרת גבס 1:10", "fig--draw", accent.maryam)}
       </div>
     </div>`,
    accent.maryam,
    "page--content-flush page--maryam-detail"
  );

  /* =====================================================================
   *  PROJECT — מופע פלורנטין / סטודיו מורכב (MOCK — placeholders, no real assets yet)
   *  Replaces the old technological-studio project. Drop images into a future
   *  assets/projects/florentin/ folder and swap the nulls below for real srcs.
   * =================================================================== */
  // Iris's two ready-made cover artworks (full-bleed, exact A3 ratio):
  //   cover-title.svg — titled aerial (crisp vector title baked in)  → left page
  //   cover-hero.jpg  — the Florentin street render                 → right page
  const FLO = "assets/projects/florentin/";
  const florentin_cover_img = `<div class="page page--coverbleed"><img class="page-bleed" src="${FLO}cover-hero.jpg" alt="${byKey.florentin.title} — פלורנטין"></div>`;
  const florentin_cover_title = `<div class="page page--coverbleed"><img class="page-bleed" src="${FLO}cover-title.svg" alt="${byKey.florentin.title}"></div>`;
  // Real content page 1 — Iris's "עמוד תוכן 1" board placed whole (full-bleed).
  // Each sub-figure is a transparent hotspot that opens the matching high-res
  // image in the lightbox. Rectangles are % of the board (measured from it).
  // Caption of each product = its source file's name (' - ' shown as ' | ').
  const floHot = (l, t, w, h, src, cap) =>
    `<button class="flo-hotspot" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"
       data-hires="${FLO}${src}" data-cap="${cap}" aria-label="${cap}" title="${cap}"></button>`;
  // Live text set over the board's top-right area (replaces the baked-in text),
  // styled to match the board's own title + justified RTL paragraph.
  const florentin_text =
    "הפרויקט מציע התחדשות למערב שכונת פלורנטין מתוך רצון לשמר ולהעצים את אופייה הייחודי. " +
    "נקודת המוצא היא התבוננות בשכונה כבמה עירונית פתוחה, שבה המלאכות, הגרפיטי, החומריות החשופה " +
    "והבינוי המאולתר יוצרים מופע אורבני מתמשך. בהשראת עולם התיאטרון והקרקס פותחה שפה תכנונית " +
    "ההופכת את ההליכה ברחוב לחוויה דינמית. התכנון מתבסס על התערבויות מדורגות השומרות על המרקם " +
    "הקיים, ומייצר מערכת של רחובות, סמטאות ופיאצלות המעודדת שוטטות, מפגשים וחיבור בין מסחר, " +
    "מלאכה, תרבות ומגורים. המבנים החדשים ממשיכים את השפה התעשייתית והחשופה של פלורנטין, תוך " +
    "הפיכת האדריכלות עצמה לחלק מהמופע העירוני. הפרויקט מציע מרחב גמיש, שבו הזהות המקומית אינה " +
    "נשמרת כזיכרון בלבד, אלא ממשיכה להתפתח כחלק בלתי נפרד מחיי השכונה.";
  const florentin_c1 =
    `<div class="page page--flo-board" style="--accent:${accent.florentin}">
       <img class="flo-board-img" src="${FLO}board.webp" alt="${byKey.florentin.title} — עמוד תוכן 1">
       <div class="flo-textcover">
         <h3 class="flo-board-title">${byKey.florentin.title}</h3>
         <p class="flo-board-para">${florentin_text}</p>
       </div>
       ${floHot(2.5, 5.5, 45.96, 27.35, "three-s.webp", "שלושת ה-Sים התכנוניים")}
       ${floHot(2.5, 34.42, 45.96, 59.05, "context.webp", "קונטקסט מרחבי ושלבי ההגעה למופע הפלורנטיני")}
       ${floHot(50, 34.42, 47.5, 17.62, "billboard.webp", "מצב מוצע | בילבורד מערבי | רחוב הנגרים")}
       ${floHot(49.92, 55.63, 47.62, 37.85, "section.webp", "חתך מקומי | 1:250")}
     </div>`;
  const florentin_c2 =
    `<div class="page page--flo-board" style="--accent:${accent.florentin}">
       <img class="flo-board-img" src="${FLO}board2.webp" alt="${byKey.florentin.title} — עמוד תוכן 2">
       ${floHot(2.49, 5.54, 32.95, 26.68, "bill-east.webp", "בילבורד מזרחי")}
       ${floHot(2.52, 36.38, 32.89, 23.2, "bill-west2.webp", "בילבורד מערבי 2")}
       ${floHot(2.49, 64.29, 32.95, 28.98, "courtyard.webp", "מבט רחוב אל חצר הפרינג'")}
       ${floHot(39.84, 5.5, 57.73, 86, "plan.webp", "תכנית קומת קרקע | 1:1000")}
     </div>`;
  const florentin_c3 = contentPage(
    "",
    `<div class="grid g-2up1">
       ${fig(null, "חתך רוחב", "fig--draw", accent.florentin)}
       ${fig(null, "חתך אורך", "fig--draw", accent.florentin)}
       ${fig(null, "חזית ראשית", "fig--draw", accent.florentin)}
     </div>`,
    accent.florentin,
    "page--content-flush"
  );
  const florentin_c4 = contentPage(
    "",
    `<div class="grid grid--2">
       ${fig(null, "תכנית — קומת קרקע", "fig--draw", accent.florentin)}
       ${fig(null, "תכנית — קומה טיפוסית", "fig--draw", accent.florentin)}
       ${fig(null, "פרט — מעטפת ובמה 1:10", "fig--draw", accent.florentin)}
       ${fig(null, "תכנית מתחם", "fig--draw", accent.florentin)}
     </div>`,
    accent.florentin,
    "page--content-flush"
  );

  /* =====================================================================
   *  ASSEMBLE SPREADS  (RTL: right = lower page no., left = higher)
   * =================================================================== */
  const P = (no, html, acc) => ({ no, html, accent: acc || null });

  // Each project = 3 spreads (cover + 2 content). Page numbers auto-increment so
  // adding/removing spreads never requires hand-renumbering.
  let _n = 0;
  // Book order follows the Table of Contents (01→05):
  // מופע פלורנטין · מדרחוב · לראות את הים · Space Time · מרי-ם.
  const defs = [
    { single: true, html: coverPage },                              // cover
    { right: tocPage, left: resumePage },                           // TOC + Resume
    { right: florentin_cover_img, left: florentin_cover_title, acc: accent.florentin },
    { right: florentin_c1, left: florentin_c2, acc: accent.florentin },
    { right: florentin_c3, left: florentin_c4, acc: accent.florentin },
    { right: urban_cover_img, left: urban_cover_title, acc: accent.urban },
    { right: urban_c1, left: urban_c2, acc: accent.urban },
    { right: urban_c3, left: urban_c4, acc: accent.urban },
    { right: sea_cover_img, left: sea_cover_title, acc: accent.sea },
    { right: sea_c1, left: sea_c2, acc: accent.sea },
    { right: sea_c3, left: sea_c4, acc: accent.sea },
    { right: time_cover_img, left: time_cover_title, acc: accent.time },
    { right: time_c1, left: time_c2, acc: accent.time },
    { right: time_c3, left: time_c4, acc: accent.time },
    { right: maryam_cover_img, left: maryam_cover_title, acc: accent.maryam },
    { right: maryam_c1, left: maryam_c2, acc: accent.maryam },
    { right: maryam_c3, left: maryam_c4, acc: accent.maryam },
    { single: true, html: backPage },                               // back
  ];
  const spreads = defs.map((d) =>
    d.single
      ? { single: true, page: P(++_n, d.html) }
      : { right: P(++_n, d.right, d.acc), left: P(++_n, d.left, d.acc) }
  );

  // jump targets: project key -> spread index of its cover; "resume" -> spread 1
  const jumps = { resume: 1 };
  Object.assign(jumps, coverSpread);

  window.BOOK = { name: NAME, projects, spreads, jumps };
})();
