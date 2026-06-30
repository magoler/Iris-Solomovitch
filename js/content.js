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
  const TEC = "assets/projects/tech/";

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

  const projects = [
    { key: "urban",  title: "מדרחוב נווה שאנן", sub: "סטודיו אורבני", accent: "#6E4FA2" },
    { key: "sea",    title: "לראות את הים",      sub: "סטודיו שימור · פארק מדרון יפו", accent: "#1E7E8C" },
    { key: "time",   title: "Time · Space",      sub: "סטודיו דיור", accent: "#2F5DA8" },
    { key: "maryam", title: "מרים",              sub: "עיצוב פנים", accent: "#A6794B" },
    { key: "tech",   title: "סטודיו טכנולוגי",   sub: "מבנה ומעטפת", accent: "#6B7079" },
  ];
  const accent = Object.fromEntries(projects.map((p) => [p.key, p.accent]));

  /* ---------- page 1 — Cover ---------- */
  const coverPage = `<div class="page page--cover" style="background-image:url('${BG}')">
      <div class="cover__inner">
        <div class="cover__kicker">Portfolio</div>
        <h1 class="cover__name">${NAME}</h1>
        <div class="cover__rule"></div>
        <div class="cover__role">אדריכלות · Architecture</div>
      </div>
    </div>`;

  /* ---------- page 2 — Table of Contents ---------- */
  const tocRows = projects
    .map(
      (p, i) => `<li class="toc__item" data-jump="${p.key}">
        <span class="toc__num">${String(i + 1).padStart(2, "0")}</span>
        <span class="toc__txt"><b>${p.title}</b><em>${p.sub}</em></span>
        <span class="toc__dot" style="background:${p.accent}"></span>
      </li>`
    )
    .join("");
  const tocPage = `<div class="page page--toc" style="background-image:url('${BG}')">
      <header class="sheet__head"><h2 class="sheet__title">תוכן עניינים</h2></header>
      <ul class="toc__list">${tocRows}</ul>
      <button class="toc__resume" data-jump="resume">קורות חיים — ${NAME}</button>
    </div>`;

  /* ---------- page 3 — Resume ---------- */
  const resumePage = `<div class="page page--resume" style="background-image:url('${BG}')">
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
            <ul><li>בוגרת כיתת מופ"ת מדעית: 5 יח"ל מתמטיקה | 5 יח"ל אנגלית | 5 יח"ל פיזיקה | 10 יח"ל מחשבים</li>
            <li>בעלת תעודת בגרות הצטיינות חברתית - התנדבות וסיוע בבתי ספר ברחובות</li></ul></div></div>
        </section>
        <section class="cv__col">
          <h3 class="cv__sec">ניסיון תעסוקתי:</h3>
          <div class="cv__item"><span class="cv__yr">2021—2022</span><div>אחראית הטמעת מערכת מידע, חברת ג'ון ברייס
            <ul><li>אחריות על הובלת תהליכי הטמעה בארגונים, העברת הדרכות והטמעות, פיתוח אמצעי הדרכה.</li>
            <li>ניהול צוות מטמיעים, הכשרת צוות מטמיעים מקצועית, ביצוע ריענוני ידע.</li>
            <li>ניהול קשרים עם מנהלים ולקוחות, ריכוז וניהול דו"חות מנהלים.</li></ul></div></div>
          <h3 class="cv__sec">שירות צבאי:</h3>
          <div class="cv__item"><span class="cv__yr">2019—2021</span><div>מפקדת ומדריכת תקשוב, בענף לוחמה מבוססת רשת וסייבר, בבה"ד 7 (שחרור בדרגת סמל)
            <ul><li>פיתוח והובלת מערכי הדרכה טכנולוגיים למגוון יחידות צה"ל.</li>
            <li>פיתוח אמצעי הדרכה עם מפתחי המערכות ולאחר מכן הטמעתן ביחידות הצבא.</li>
            <li>ניהול אירועים מקצועיים, פיקוד על חיילים במהלך חפיפה לתפקיד.</li></ul></div></div>
          <h3 class="cv__sec">יישומי מחשב:</h3>
          <ul class="cv__skills">
            <li><b>תכנון BIM:</b> Revit – שליטה גבוהה | AutoCAD – שליטה גבוהה</li>
            <li><b>תכנון פרמטרי:</b> Grasshopper – שליטה טובה | Rhino – שליטה גבוהה</li>
            <li><b>גרפיקה:</b> Illustrator – שליטה טובה | Photoshop – ניסיון עבודה | Lumion – שליטה טובה | D5 – ניסיון עבודה</li>
            <li><b>שפות תכנות:</b> Python – היכרות | C# - היכרות</li>
            <li><b>כללי:</b> Office – שליטה גבוהה</li>
          </ul>
          <h3 class="cv__sec">שפות:</h3>
          <p class="cv__lang">עברית - שפת אם | אנגלית - ברמה גבוהה מאוד | רומנית - ברמה גבוהה מאוד</p>
        </section>
      </div>
    </div>`;

  /* ---------- page 24 — Back (mirror of cover) ---------- */
  const backPage = `<div class="page page--back" style="background-image:url('${BG}')">
      <div class="cover__inner cover__inner--mirror">
        <div class="cover__role">אדריכלות · Architecture</div>
        <div class="cover__rule"></div>
        <h1 class="cover__name">${NAME}</h1>
        <div class="cover__kicker">Portfolio · 2026</div>
      </div>
    </div>`;

  /* =====================================================================
   *  PROJECT 1 — Urban (placeholder)
   * =================================================================== */
  const urban_cover_img = coverImage(URB + "render-street.jpg", "מדרחוב נווה שאנן — הדמיית רחוב", accent.urban);
  const urban_cover_title = coverTitle("מדרחוב נווה שאנן", "סטודיו אורבני", URB + "model.jpg", accent.urban);
  const urban_c1 = contentPage(
    "מדרחוב נווה שאנן",
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
  const sea_cover_img = coverImage(SEA + "lagoon-day.jpg", "מבט על — הלגונה והעיר", accent.sea);
  const sea_cover_title = coverTitle("לראות את הים", "סטודיו שימור · פארק מדרון יפו", SEA + "hero-complex.jpg", accent.sea);

  // c1 — concept + masterplan
  const sea_c1 = contentPage(
    "לראות את הים",
    `<div class="sea2-c1-grid">
       <div class="sea2-c1-text">
         <p class="proj-desc">פרויקט שימור במדרון יפו, על קו התפר שבין העיר לים. הפרויקט מבקש לרפא צלקת
           היסטורית בחזית הימית ולחבר מחדש בין התושבים, הזיכרון המקומי והמים. סביב לגונה חדשה נפרשׂ מרחב
           ציבורי — רחבה קהילתית, חממת תבלינים, חלל שיח (History-telling), ארכיון וספרייה, סדנאות כתיבה
           וצילום, תערוכות וקיוסק — שממנו אפשר שוב לראות את הים.</p>
         ${fig(SEA + "site-aerial.jpg", "מבט על — מתחם המבנים בהקשר העירוני", "", accent.sea)}
       </div>
       ${fig(SEA + "masterplan.jpg", "תוכנית אב — מכלול המבנים והמרחב הציבורי", "", accent.sea)}
     </div>`,
    accent.sea,
    "page--sea2-c1"
  );

  // c2 — the buildings from outside (exterior renders)
  const sea_c2 = contentPage(
    "",
    `<div class="grid grid--2">
       ${fig(SEA + "ext-entrance.jpg", "הדמיה — כניסה למתחם", "", accent.sea)}
       ${fig(SEA + "ext-pergola.jpg", "הדמיה — רחבה ופרגולה", "", accent.sea)}
       ${fig(SEA + "ext-aerial.jpg", "הדמיה — מבט אווירי על המבנים", "", accent.sea)}
       ${fig(SEA + "ext-street.jpg", "הדמיה — חזית הרחוב", "", accent.sea)}
     </div>`,
    accent.sea,
    "page--content-flush"
  );

  // c3 — the places, inside (interior renders) — "the missing places"
  const sea_c3 = contentPage(
    "",
    `<div class="grid g-2up1">
       ${fig(SEA + "int-library.jpg", "ארכיון וספרייה", "", accent.sea)}
       ${fig(SEA + "int-gallery.jpg", "חלל שיח · History-telling", "", accent.sea)}
       ${fig(SEA + "int-exhibition.jpg", "תערוכת צילום", "", accent.sea)}
     </div>`,
    accent.sea,
    "page--content-flush"
  );

  // c4 — plans + section
  const sea_c4 = contentPage(
    "",
    `<div class="grid g-2up1 sea2-plans">
       ${fig(SEA + "plan-level1.jpg", "תוכנית — מפלס עליון (+15.65 / +13.65)", "fig--draw", accent.sea)}
       ${fig(SEA + "plan-level2.jpg", "תוכנית — מפלס גלריה וקיוסק (+8.67)", "fig--draw", accent.sea)}
       ${fig(SEA + "section.jpg", "חתך לאורך המדרון", "fig--draw", accent.sea)}
     </div>`,
    accent.sea,
    "page--content-flush"
  );

  /* =====================================================================
   *  PROJECT 3 — Time · Space Housing (placeholder, blue)
   * =================================================================== */
  const time_cover_img = coverImage(TIM + "render-sunrise.jpg", "Time · Space — הדמיית זריחה", accent.time);
  const time_cover_title = coverTitle("Time · Space", "סטודיו דיור", TIM + "aerial.jpg", accent.time);
  const time_c1 = contentPage(
    "Time · Space",
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
  const maryam_cover_img = coverImage(MAR + "alma.jpg", "מלון אלמה — מודל העבודה", accent.maryam);
  const maryam_cover_title = coverTitle("מרים", "עיצוב פנים · מגורים בין־דוריים", MAR + "hero.jpg", accent.maryam);

  // c1 (page 18, right) — title + paragraph + whole-apartment axon (right half);
  //                        proposed colored plan, private/public (left half, toward the spine)
  const maryam_c1 = contentPage(
    "מרים",
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
   *  PROJECT 5 — Technological studio (placeholder, gray)
   * =================================================================== */
  const tech_cover_img = coverImage(TEC + "render-courtyard.jpg", "סטודיו טכנולוגי — הדמיית חצר", accent.tech);
  const tech_cover_title = coverTitle("סטודיו טכנולוגי", "מבנה ומעטפת", TEC + "render-ext.jpg", accent.tech);
  const tech_c1 = contentPage(
    "סטודיו טכנולוגי",
    `<div class="c1col">
       <p class="proj-desc">פרויקט בדגש מבני־טכנולוגי: מבנה ציבורי — קופת חולים — שגגו המתקמר נפרשׂ מעל המרחב.
         הפרויקט חוקר את הקונסטרוקציה, המעטפת ופרטי הבנייה, ממודל הרעיון ועד לפרט 1:10.</p>
       <div class="grid g-1up2">
         ${fig(TEC + "roof-aerial.jpg", "מבט על — הגג המתקמר", "", accent.tech)}
         ${fig(TEC + "model-concept.jpg", "מודל הרעיון — מבנה הגג", "", accent.tech)}
         ${fig(TEC + "model-cut.jpg", "חתך תלת־ממדי — מבנה ומעטפת", "", accent.tech)}
       </div>
     </div>`,
    accent.tech
  );
  const tech_c2 = contentPage(
    "",
    `<div class="grid grid--2">
       ${fig(TEC + "render-facade.jpg", "הדמיה — חזית המבנה", "", accent.tech)}
       ${fig(TEC + "render-entry.jpg", "הדמיה — הכניסה והמבואה", "", accent.tech)}
       ${fig(TEC + "render-garden.jpg", "הדמיה — המבנה והגן", "", accent.tech)}
       ${fig(TEC + "render-side.jpg", "הדמיה — מבט צד", "", accent.tech)}
     </div>`,
    accent.tech,
    "page--content-flush"
  );
  const tech_c3 = contentPage(
    "",
    `<div class="grid g-2up1">
       ${fig(TEC + "section-render.jpg", "חתך רוחב — מבט פנים", "fig--draw", accent.tech)}
       ${fig(TEC + "section-detail.jpg", "חתך מפורט", "fig--draw", accent.tech)}
       ${fig(TEC + "roof-structure.jpg", "תכנית גג — שיפועים ומבנה", "fig--draw", accent.tech)}
     </div>`,
    accent.tech,
    "page--content-flush"
  );
  const tech_c4 = contentPage(
    "",
    `<div class="grid grid--2">
       ${fig(TEC + "floor-plan.jpg", "תכנית — קומת קרקע", "fig--draw", accent.tech)}
       ${fig(TEC + "struct-section.jpg", "חתך קונסטרוקטיבי", "fig--draw", accent.tech)}
       ${fig(TEC + "detail-wall.jpg", "פרט — חיבור קיר ומעקה 1:10", "fig--draw", accent.tech)}
       ${fig(TEC + "detail-roof.jpg", "פרט — גג ומעטפת 1:10", "fig--draw", accent.tech)}
     </div>`,
    accent.tech,
    "page--content-flush"
  );

  /* =====================================================================
   *  ASSEMBLE SPREADS  (RTL: right = lower page no., left = higher)
   * =================================================================== */
  const P = (no, html, acc) => ({ no, html, accent: acc || null });

  // Each project = 3 spreads (cover + 2 content). Page numbers auto-increment so
  // adding/removing spreads never requires hand-renumbering.
  let _n = 0;
  const defs = [
    { single: true, html: coverPage },                              // cover
    { right: tocPage, left: resumePage },                           // TOC + Resume
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
    { right: tech_cover_img, left: tech_cover_title, acc: accent.tech },
    { right: tech_c1, left: tech_c2, acc: accent.tech },
    { right: tech_c3, left: tech_c4, acc: accent.tech },
    { single: true, html: backPage },                               // back
  ];
  const spreads = defs.map((d) =>
    d.single
      ? { single: true, page: P(++_n, d.html) }
      : { right: P(++_n, d.right, d.acc), left: P(++_n, d.left, d.acc) }
  );

  // jump targets: project key -> spread index of its cover; "resume" -> spread 1
  const jumps = { resume: 1 };
  const coverByKey = { urban: 2, sea: 5, time: 8, maryam: 11, tech: 14 };
  Object.assign(jumps, coverByKey);

  window.BOOK = { name: NAME, projects, spreads, jumps };
})();
