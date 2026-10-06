/* ==========================================================
   Florel Core — content-driven renderer.
   All text, images and sections come from content/site.json.
   Edit the JSON; this file normally does not need to change.
   ========================================================== */
(function () {
  'use strict';

  var CONTENT_URL = 'content/site.json';
  var D;                       // loaded site data
  var currentPage = null;
  var observer = null;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function digits(p) { return String(p || '').replace(/[^\d]/g, ''); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var I = {
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 0 1 2.2 12C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.9 6.9c0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2A11.8 11.8 0 0 0 12 .1C5.5.1.1 5.5.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5c6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="1"/><path d="m2 6 10 7 10-7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.3 4 5 4"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l16 16M20 4 4 20"/></svg>'
  };

  /* Phone number followed by the contact person's name (contact.contactNames), if set */
  function withName(p) {
    var name = (D.contact.contactNames || {})[p];
    return esc(p) + (name ? '<span class="pname">' + esc(name) + '</span>' : '');
  }

  /* Resolve special link keywords used in the JSON */
  function href(h) {
    var c = D.contact;
    if (h === 'whatsapp') return 'https://wa.me/' + digits(c.whatsapp[0]) + '?text=' + encodeURIComponent(c.whatsappMessage || '');
    if (h === 'whatsapp2') return 'https://wa.me/' + digits(c.whatsapp[1] || c.whatsapp[0]) + '?text=' + encodeURIComponent(c.whatsappMessage || '');
    if (h === 'tel') return 'tel:+' + digits(c.phones[0]);
    if (h === 'email') return 'mailto:' + c.email;
    return h || '#/';
  }
  function linkAttrs(h) {
    var u = href(h);
    var ext = /^https?:/.test(u);
    return 'href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener"' : '');
  }
  function button(b) {
    if (!b) return '';
    var style = b.style || 'gold';
    if (style === 'whatsapp') {
      return '<a class="btn btn-whatsapp" ' + linkAttrs(b.href || 'whatsapp') + '>' + I.whatsapp + '<span>' + esc(b.label) + '</span></a>';
    }
    return '<a class="btn btn-' + esc(style) + '" ' + linkAttrs(b.href) + '>' + esc(b.label) + I.arrow + '</a>';
  }
  function buttons(list) {
    return list && list.length ? '<div class="btns">' + list.map(button).join('') + '</div>' : '';
  }

  /* Image or elegant placeholder when the "image" field is empty */
  function img(src, alt, cls, label) {
    cls = 'img ' + (cls || '');
    if (src) return '<div class="' + cls + '"><img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></div>';
    return '<div class="' + cls + '"><div class="ph" role="img" aria-label="' + esc(alt || 'Image coming soon') + '">' +
      '<img src="' + esc(D.site.logoMark) + '" alt=""><span>' + esc(label || 'Photo coming soon') + '</span></div></div>';
  }
  function kicker(k) { return k ? '<p class="kicker">' + esc(k) + '</p>' : ''; }
  function paragraphs(list) { return (list || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''); }
  function head(s, extra) {
    return '<div class="sec-head reveal"><div>' + kicker(s.kicker) +
      (s.title ? '<h2 class="h2">' + esc(s.title) + '</h2>' : '') +
      (s.lead ? '<p class="lead">' + esc(s.lead) + '</p>' : '') + '</div>' + (extra || '') + '</div>';
  }
  function bg(s) { return s.background === 'alt' ? ' alt' : s.background === 'dark' ? ' dark' : ''; }
  function serviceById(id) { return D.services.filter(function (s) { return s.id === id; })[0]; }

  /* ==========================================================
     SECTION RENDERERS — keyed by "type" in the JSON
     ========================================================== */
  var R = {
    hero: function (s) {
      return '<section class="hero">' +
        (s.image ? '<div class="hero-bg" data-parallax style="background-image:url(\'' + esc(s.image) + '\')" role="img" aria-label="' + esc(s.imageAlt) + '"></div>' : '') +
        '<div class="wrap">' +
          (s.badge ? '<span class="badge anim">' + I.pin + esc(s.badge) + '</span>' : '') +
          '<h1 class="anim">' + esc(s.title) + (s.titleAccent ? '<em>' + esc(s.titleAccent) + '</em>' : '') + '</h1>' +
          (s.subtitle ? '<p class="sub anim">' + esc(s.subtitle) + '</p>' : '') +
          (s.text ? '<p class="txt anim">' + esc(s.text) + '</p>' : '') +
          '<div class="anim">' + buttons(s.buttons) + '</div>' +
        '</div><span class="scroll-cue" aria-hidden="true">Scroll</span></section>';
    },

    marquee: function (s) {
      var items = (s.items || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
      return '<div class="marquee" aria-hidden="true"><div class="track">' + items + items + '</div></div>';
    },

    intro: function (s) {
      var imgs = (s.images || []).slice(0, 2).map(function (m, i) {
        return '<div class="img img-reveal' + (i ? ' d2' : '') + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt) + '" loading="lazy"></div>';
      }).join('');
      return '<section class="sec' + bg(s) + '"><div class="wrap intro">' +
        '<div class="reveal">' + kicker(s.kicker) + '<h2 class="h2">' + esc(s.title) + '</h2>' +
          '<div class="body">' + paragraphs(s.paragraphs) + '</div>' +
          (s.steps ? '<div class="steps3">' + s.steps.map(function (st, i) {
            return '<div><i>' + pad(i + 1) + '</i><span><h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p></span></div>';
          }).join('') + '</div>' : '') +
        '</div><div class="duo">' + imgs + '</div></div></section>';
    },

    features: function (s) {
      return '<section class="sec' + bg(s) + '"><div class="wrap">' + head(s) +
        '<div class="grid3">' + (s.items || []).map(function (f, i) {
          return '<article class="feature reveal d' + (i % 3 + 1) + '"><span class="num">' + pad(i + 1) + '</span><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></article>';
        }).join('') + '</div></div></section>';
    },

    services: function (s) {
      var list = D.services.slice(0, s.limit || D.services.length);
      var link = s.link ? '<a class="link-arrow reveal" href="' + esc(s.link.href) + '">' + esc(s.link.label) + I.arrow + '</a>' : '';
      return '<section class="sec' + bg(s) + '"><div class="wrap">' + head(s, link) +
        '<div class="grid3">' + list.map(function (v, i) {
          return '<a class="svc reveal d' + (i % 3 + 1) + '" href="#/services/' + esc(v.id) + '">' + img(v.image, v.imageAlt) +
            '<div class="t"><small>' + pad(i + 1) + ' — Service</small><h3>' + esc(v.title) + '</h3><p>' + esc(v.summary) + '</p>' +
            '<span class="link-arrow">Learn more' + I.arrow + '</span></div></a>';
        }).join('') + '</div></div></section>';
    },

    process: function (s) {
      return '<section class="sec dark"><div class="wrap">' + head(s) +
        '<div class="steps5">' + (s.steps || []).map(function (st, i) {
          return '<article class="step reveal d' + (i % 4 + 1) + '"><span class="num">' + pad(i + 1) + '</span><h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p></article>';
        }).join('') + '</div></div></section>';
    },

    checklist: function (s) {
      return '<section class="sec' + bg(s) + '"><div class="wrap check">' +
        '<div class="img-reveal">' + img(s.image, s.imageAlt) + '</div>' +
        '<div class="reveal">' + kicker(s.kicker) + '<h2 class="h2">' + esc(s.title) + '</h2>' +
          (s.text ? '<p class="lead">' + esc(s.text) + '</p>' : '') +
          '<div class="groups">' + (s.groups || []).map(function (g) {
            return '<div><h4>' + esc(g.title) + '</h4><ul>' + g.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
          }).join('') + '</div>' + button(s.button) +
        '</div></div></section>';
    },

    cta: function (s) {
      return '<section class="cta-band">' +
        (s.image ? '<div class="bg" data-parallax style="background-image:url(\'' + esc(s.image) + '\')"></div>' : '') +
        '<div class="wrap reveal">' + kicker(s.kicker) + '<h2>' + esc(s.title) + '</h2>' +
        (s.text ? '<p>' + esc(s.text) + '</p>' : '') + buttons(s.buttons) + '</div></section>';
    },

    pageHero: function (s) {
      var has = !!s.image;
      return '<section class="phero' + (has ? '' : ' noimg') + '"><div class="wrap">' +
        '<div class="reveal">' + kicker(s.kicker) + '<h1>' + esc(s.title) + '</h1>' + (s.lead ? '<p class="lead">' + esc(s.lead) + '</p>' : '') + '</div>' +
        (has ? '<div class="img-reveal">' + img(s.image, s.imageAlt) + '</div>' : '') +
        '</div></section>';
    },

    split: function (s) {
      return '<section class="sec' + bg(s) + '"><div class="wrap split' + (s.reverse ? ' rev' : '') + '">' +
        '<div class="media' + (s.imageStyle === 'logo' ? ' logo' : '') + '"><div class="img-reveal">' + img(s.image, s.imageAlt) + '</div></div>' +
        '<div class="body reveal">' + kicker(s.kicker) + '<h2 class="h2">' + esc(s.title) + '</h2>' + paragraphs(s.paragraphs) +
          (s.button ? '<div style="margin-top:34px">' + button(s.button) + '</div>' : '') +
        '</div></div></section>';
    },

    experience: function (s) {
      return '<section class="sec alt"><div class="wrap center reveal">' + kicker(s.kicker) +
        '<h2 class="h2">' + esc(s.title) + '</h2>' + (s.text ? '<p class="lead">' + esc(s.text) + '</p>' : '') +
        '<div class="names">' + (s.names || []).map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('') + '</div>' +
        (s.note ? '<p class="fine">' + esc(s.note) + '</p>' : '') + '</div></section>';
    },

    missionVision: function (s) {
      return '<section class="sec"><div class="wrap mv">' + (s.items || []).map(function (m, i) {
        return '<article class="reveal d' + (i + 1) + '">' + kicker(m.label) + '<p class="q">' + esc(m.text) + '</p>' +
          (m.points && m.points.length ? '<ul>' + m.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
          '</article>';
      }).join('') + '</div></section>';
    },

    statement: function (s) {
      return '<section class="sec' + bg(s) + '"><div class="wrap statement reveal"><p>' + esc(s.text) + '</p>' + button(s.button) + '</div></section>';
    },

    /* Generic text block — handy for adding new sections from the JSON */
    text: function (s) {
      return '<section class="sec' + bg(s) + '"><div class="wrap' + (s.align === 'center' ? ' center' : '') + ' reveal" style="max-width:900px">' +
        kicker(s.kicker) + (s.title ? '<h2 class="h2">' + esc(s.title) + '</h2>' : '') +
        '<div class="lead">' + paragraphs(s.paragraphs) + '</div>' +
        (s.buttons ? '<div style="margin-top:34px" class="light-ctx">' + buttons(s.buttons) + '</div>' : '') + '</div></section>';
    },

    serviceIndex: function () {
      return '<nav class="svc-index" aria-label="Services"><div class="wrap">' + D.services.map(function (v) {
        return '<a href="#/services/' + esc(v.id) + '" data-sid="' + esc(v.id) + '">' + esc(v.title) + '</a>';
      }).join('') + '</div></nav>';
    },

    serviceDetails: function (s) {
      return '<section class="sec"><div class="wrap">' + D.services.map(function (v, i) {
        return '<article class="srow" id="svc-' + esc(v.id) + '">' +
          '<div class="media"><div class="img-reveal">' + img(v.image, v.imageAlt) + '</div></div>' +
          '<div class="reveal"><p class="kicker">' + pad(i + 1) + ' — Service</p><h2>' + esc(v.title) + '</h2>' +
            '<p class="d">' + esc(v.summary) + '</p>' +
            '<ul class="chips">' + (v.items || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
            button(s.button) +
          '</div></article>';
      }).join('') + '</div></section>';
    },

    /* Home-page highlight of completed work: projects with "featured": true */
    showcase: function (s) {
      var list = (D.projects || []).filter(function (p) { return p.featured && p.image; }).slice(0, s.limit || 7);
      var link = s.link ? '<a class="link-arrow reveal" href="' + esc(s.link.href) + '">' + esc(s.link.label) + I.arrow + '</a>' : '';
      return '<section class="sec' + bg(s) + '"><div class="wrap">' + head(s, link) +
        '<div class="bento">' + list.map(function (p, i) {
          return '<figure class="tile reveal d' + (i % 3 + 1) + '" data-lb="' + esc(p.image) + '" data-cap="' + esc(p.title) + '" tabindex="0" role="button" aria-label="View ' + esc(p.title) + '">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy" decoding="async">' +
            '<figcaption><small>' + esc((p.categories || []).slice(1).join(' · ') || (p.categories || [])[0] || '') + '</small><b>' + esc(p.title) + '</b></figcaption></figure>';
        }).join('') + '</div></div></section>';
    },

    gallery: function () {
      var projects = D.projects || [];
      // only show filter buttons that have at least one project
      var cats = (D.projectCategories || ['All']).filter(function (c) {
        return c === 'All' || projects.some(function (p) { return (p.categories || []).indexOf(c) > -1; });
      });
      var cards = projects.map(function (p, i) {
        var cs = p.categories || [];
        var lb = p.image ? ' data-lb="' + esc(p.image) + '" data-cap="' + esc(p.title) + '" tabindex="0" role="button" aria-label="View ' + esc(p.title) + '"' : '';
        return '<article class="pcard reveal d' + (i % 3 + 1) + '" data-c="' + esc(cs.join('|')) + '">' +
          '<div' + lb + '>' + img(p.image, p.imageAlt || p.title, p.shape || (p.image ? 'natural' : 'landscape'), 'Project photo coming soon') + '</div>' +
          '<div class="t"><small>' + esc(cs.join(' · ')) + '</small><h3>' + esc(p.title) + '</h3>' +
          (p.location ? '<span class="loc">' + I.pin + esc(p.location) + '</span>' : '') +
          (p.description ? '<p>' + esc(p.description) + '</p>' : '') + '</div></article>';
      }).join('');
      return '<section class="sec"><div class="wrap">' +
        '<div class="fbar" role="group" aria-label="Filter projects">' + cats.map(function (c, i) {
          return '<button class="fchip" type="button" data-c="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + '</button>';
        }).join('') + '</div>' +
        '<div class="masonry">' + cards + '</div>' +
        '<p class="empty" hidden>No projects in this category yet.</p>' +
        '</div></section>';
    },

    testimonials: function () {
      return '<section class="sec"><div class="wrap grid3">' + (D.testimonials || []).map(function (t, i) {
        var ph = t.placeholder || !t.quote;
        return '<article class="tcard reveal d' + (i % 3 + 1) + (ph ? ' placeholder' : '') + '"><span class="q" aria-hidden="true">&ldquo;</span>' +
          '<blockquote>' + esc(ph ? 'Client testimonial coming soon.' : t.quote) + '</blockquote>' +
          '<div class="who"><b>' + esc(ph ? 'Florel Core Client' : t.name) + '</b><span>' + esc(ph ? 'Residential & Commercial — UAE' : t.role) + '</span></div></article>';
      }).join('') + '</div></section>';
    },

    contact: function (s) {
      var c = D.contact;
      var phones = c.phones.map(function (p) { return '<a href="tel:+' + digits(p) + '">' + withName(p) + '</a>'; }).join('');
      var was = c.whatsapp.map(function (p) {
        return '<a href="https://wa.me/' + digits(p) + '?text=' + encodeURIComponent(c.whatsappMessage) + '" target="_blank" rel="noopener">' + withName(p) + '</a>';
      }).join('');
      var fields = (s.fields || []).map(function (f) {
        var req = f.required ? ' required' : '';
        var lab = esc(f.label) + (f.required ? ' <i>*</i>' : '');
        var opts = f.options === 'services' ? D.services.map(function (v) { return v.title; }).concat(['Other']) : (f.options || []);
        var ctl;
        if (f.type === 'select') {
          ctl = '<select id="f-' + esc(f.name) + '" name="' + esc(f.name) + '"' + req + '><option value="">Select…</option>' +
            opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>';
        } else if (f.type === 'textarea') {
          ctl = '<textarea id="f-' + esc(f.name) + '" name="' + esc(f.name) + '" placeholder="' + esc(f.placeholder) + '"' + req + '></textarea>';
        } else if (f.type === 'radio') {
          return '<div class="field ' + (f.width === 'half' ? '' : 'full') + '"><fieldset><legend>' + lab + '</legend><div class="radios">' +
            opts.map(function (o, i) {
              return '<label><input type="radio" name="' + esc(f.name) + '" value="' + esc(o) + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(o) + '</span></label>';
            }).join('') + '</div></fieldset></div>';
        } else {
          ctl = '<input id="f-' + esc(f.name) + '" name="' + esc(f.name) + '" type="' + esc(f.type || 'text') + '" placeholder="' + esc(f.placeholder) + '"' + req + '>';
        }
        return '<div class="field ' + (f.width === 'half' ? '' : 'full') + '"><label for="f-' + esc(f.name) + '">' + lab + '</label>' + ctl + '</div>';
      }).join('');

      return '<section class="sec"><div class="wrap cgrid">' +
        '<aside class="cinfo reveal">' + kicker(s.infoKicker) + '<h2>' + esc(c.companyName) + '</h2>' +
          '<div class="crow">' + I.pin + '<div><small>Address</small>' + esc(c.address) + '</div></div>' +
          '<div class="crow">' + I.phone + '<div><small>Phone</small>' + phones + '</div></div>' +
          '<div class="crow">' + I.whatsapp + '<div><small>WhatsApp</small>' + was + '</div></div>' +
          '<div class="crow">' + I.mail + '<div><small>Email</small><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></div></div>' +
          '<div class="crow">' + I.globe + '<div><small>Service Area</small>' + esc(c.serviceArea) + '</div></div>' +
          button({ label: 'Chat on WhatsApp', href: 'whatsapp', style: 'gold' }) +
        '</aside>' +
        '<form class="cform reveal d1" id="enquiry" novalidate>' + kicker(s.formKicker) + '<h2>' + esc(s.formTitle) + '</h2>' +
          '<div class="fgrid">' + fields + '</div>' +
          '<p class="form-error" role="alert"></p>' +
          '<button class="btn btn-green" type="submit">' + esc(s.submitLabel || 'Send') + I.arrow + '</button>' +
          '<p class="success" role="status" aria-live="polite">' + esc(s.successMessage) + '</p>' +
        '</form></div></section>';
    }
  };

  /* ==========================================================
     LAYOUT: header, footer, floating actions
     ========================================================== */
  function renderChrome() {
    var s = D.site, n = D.navigation, c = D.contact;
    var brand = '<a class="brand" href="#/" aria-label="' + esc(s.name) + ' — Home"><img src="' + esc(s.logoMark) + '" alt="' + esc(s.brandName) + ' logo">' +
      '<span class="brand-text"><b>' + esc(s.brandName) + '</b><small>' + esc(s.brandSubtitle) + '</small></span></a>';
    var links = n.links.map(function (l) { return '<a class="nl" href="' + esc(l.href) + '">' + esc(l.label) + '</a>'; }).join('');

    $('#nav').innerHTML = '<div class="wrap">' + brand +
      '<nav class="menu" aria-label="Main">' + links + button({ label: n.cta.label, href: n.cta.href, style: 'green' }) + '</nav>' +
      '<button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>' +
      '</div>' +
      '<nav class="drawer" id="drawer" aria-label="Mobile">' +
        n.links.map(function (l) { return '<a class="nl" href="' + esc(l.href) + '">' + esc(l.label) + '<span aria-hidden="true">→</span></a>'; }).join('') +
        button({ label: n.cta.label, href: n.cta.href, style: 'green' }) +
        '<p class="dcontact">' + esc(c.phones.join('  ·  ')) + '<br>' + esc(c.email) + '</p>' +
      '</nav>' +
      '<div class="scrim" aria-hidden="true"></div>';

    var nav = $('#nav'), burger = $('.burger', nav);
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $('.scrim', nav).addEventListener('click', function () { burger.click(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) burger.click();
    });

    // footer
    var f = D.footer;
    var social = (D.social || []).filter(function (x) { return x && x.url; });
    $('#footer').innerHTML = '<div class="wrap"><div class="fcols">' +
      '<div><div class="fbrand"><span class="tile"><img src="' + esc(s.logoMark) + '" alt=""></span><span><b>' + esc(s.brandName) + '</b><small>' + esc(s.brandSubtitle) + '</small></span></div>' +
        '<p class="ftag">' + esc(s.tagline) + '</p><p>' + esc(f.about) + '</p>' +
        '<div class="social"><a ' + linkAttrs('whatsapp') + ' aria-label="WhatsApp">' + I.whatsapp + '</a>' +
          social.map(function (x) { return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener" aria-label="' + esc(x.platform) + '">' + (I[x.platform] || I.globe) + '</a>'; }).join('') +
        '</div></div>' +
      '<div><h4>' + esc(f.quickLinksTitle) + '</h4><ul>' + n.links.map(function (l) { return '<li><a href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>' + esc(f.servicesTitle) + '</h4><ul>' + (f.serviceLinks || []).map(function (id) {
        var v = serviceById(id); return v ? '<li><a href="#/services/' + esc(id) + '">' + esc(v.title) + '</a></li>' : '';
      }).join('') + '</ul></div>' +
      '<div><h4>' + esc(f.contactTitle) + '</h4><ul>' +
        '<li>' + esc(c.address) + '</li>' +
        c.phones.map(function (p) { return '<li><a href="tel:+' + digits(p) + '">' + withName(p) + '</a></li>'; }).join('') +
        '<li><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li>' +
        '<li>Service area: ' + esc(c.serviceArea) + '</li>' +
      '</ul></div>' +
      '</div><div class="fbottom"><span>' + esc(f.copyright) + '</span><span>' + esc(c.city) + ', UAE</span></div></div>';

    // floating WhatsApp (desktop) + bottom action bar (mobile)
    var fw = D.floatingWhatsApp || {};
    $('#floating').innerHTML =
      (fw.enabled !== false ? '<a class="fab" ' + linkAttrs('whatsapp') + ' aria-label="' + esc(fw.label || 'WhatsApp') + '"><i>' + I.whatsapp + '</i><span>' + esc(fw.label) + '</span></a>' : '') +
      '<nav class="mbar" aria-label="Quick actions">' + (D.mobileBar || []).map(function (b) {
        var cls = b.href === 'whatsapp' ? 'wa' : (b.icon === 'quote' ? 'quote' : '');
        return '<a class="' + cls + '" ' + linkAttrs(b.href) + '>' + (I[b.icon] || '') + esc(b.label) + '</a>';
      }).join('') + '</nav>';

    // brand assets used in CSS and head
    document.documentElement.style.setProperty('--mark', 'url("' + new URL(s.logoMark, location.href).href + '")');   // absolute, or CSS resolves it from assets/css/
    document.documentElement.lang = s.language || 'en';

    // Local business structured data for SEO
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness',
      name: s.name, slogan: s.tagline, logo: s.logo, image: s.logo,
      telephone: c.phones, email: c.email,
      address: { '@type': 'PostalAddress', addressLocality: c.city, addressCountry: c.countryCode },
      areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
      knowsAbout: D.services.map(function (v) { return v.title; }),
      sameAs: social.map(function (x) { return x.url; })
    });
    document.head.appendChild(ld);
  }

  /* ==========================================================
     ROUTER  —  #/  #/about  #/services  #/services/mep  ...
     ========================================================== */
  function parseHash() {
    var h = location.hash || '#/';
    if (h.indexOf('#/') !== 0) return null;          // plain in-page anchor
    var parts = h.slice(2).split('/');
    var page = parts[0] || 'home';
    if (!D.pages[page]) page = 'home';
    return { page: page, sub: parts[1] || '' };
  }

  function setMeta(p, key) {
    var s = D.site;
    document.title = (p.seoTitle || s.name) + (s.titleSuffix || '');
    var m = $('meta[name="description"]');
    if (m && p.seoDescription) m.setAttribute('content', p.seoDescription);
    $$('#nav a.nl').forEach(function (a) {
      var target = (a.getAttribute('href') || '').replace('#/', '') || 'home';
      a.classList.toggle('on', target === key);
      if (target === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function scrollToSub(sub) {
    var el = sub && document.getElementById('svc-' + sub);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function route() {
    var r = parseHash();
    if (!r) return;
    var nav = $('#nav');
    if (nav.classList.contains('open')) $('.burger', nav).click();
    lbClose();

    if (r.page === currentPage) { scrollToSub(r.sub); return; }

    var main = $('#main');
    var first = currentPage === null;
    main.classList.add('leaving');
    setTimeout(function () {
      var p = D.pages[r.page];
      main.innerHTML = (p.sections || []).map(function (s) {
        if (!R[s.type]) { console.warn('Unknown section type in site.json:', s.type); return ''; }
        return R[s.type](s);
      }).join('');
      currentPage = r.page;
      setMeta(p, r.page);
      window.scrollTo(0, 0);
      enhance();
      main.classList.remove('leaving');
      if (r.sub) setTimeout(function () { scrollToSub(r.sub); }, 120);
      else if (!first) main.focus({ preventScroll: true });
    }, first ? 0 : 280);
  }

  /* ==========================================================
     PAGE ENHANCEMENTS — animations, filters, form
     ========================================================== */
  function enhance() {
    // reveal-on-scroll
    if (observer) observer.disconnect();
    var targets = $$('.reveal, .img-reveal');
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      targets.forEach(function (t) { observer.observe(t); });
    } else {
      targets.forEach(function (t) { t.classList.add('in'); });
    }

    // services page: highlight current service in the index bar
    var idx = $('.svc-index');
    if (idx && 'IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id.replace('svc-', '');
          $$('a', idx).forEach(function (a) {
            var on = a.dataset.sid === id;
            a.classList.toggle('on', on);
            if (on) a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('.srow').forEach(function (r) { so.observe(r); });
    }

    // project filter
    var bar = $('.fbar');
    if (bar) {
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('.fchip'); if (!b) return;
        var cat = b.dataset.c, shown = 0;
        $$('.fchip', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        $$('.pcard').forEach(function (c) {
          var hide = cat !== 'All' && c.dataset.c.split('|').indexOf(cat) < 0;
          c.hidden = hide; if (!hide) { shown++; c.classList.add('in'); }
        });
        $('.empty').hidden = shown > 0;
      });
    }

    // enquiry form
    var form = $('#enquiry');
    if (form) form.addEventListener('submit', submitForm);
  }

  function submitForm(e) {
    e.preventDefault();
    var form = e.target;
    var cfg = (D.pages.contact.sections || []).filter(function (s) { return s.type === 'contact'; })[0] || {};
    var err = $('.form-error', form);
    // show what is missing next to the button and bring the first bad field into view,
    // otherwise the browser's tiny tooltip appears off-screen and the click seems to do nothing
    form.classList.add('checked');
    var bad = $$(':invalid', form).filter(function (el) { return el.name; });
    if (bad.length) {
      var labels = bad.map(function (el) {
        var f = (cfg.fields || []).filter(function (x) { return x.name === el.name; })[0];
        return f ? f.label : el.name;
      });
      err.textContent = 'Please fill in: ' + labels.join(', ');
      err.classList.add('show');
      bad[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      bad[0].focus({ preventScroll: true });
      return;
    }
    err.classList.remove('show');
    var data = {}, lines = ['Hello Florel Core, I would like to request a consultation.', ''];
    (cfg.fields || []).forEach(function (f) {
      var el = form.elements[f.name];
      var v = el ? (el.value || '').trim() : '';
      data[f.name] = v;
      if (v) lines.push(f.label + ': ' + v);
    });
    var msg = lines.join('\n');
    var done = function () {
      $('.success', form).classList.add('show');
      form.reset();
      form.classList.remove('checked');
    };

    if (cfg.endpoint) {                        // e.g. a Formspree / backend URL
      fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(done).catch(done);
    } else if ((data.contactMethod || cfg.sendVia || '').toLowerCase() === 'email') {   // chosen chip wins over sendVia
      var subject = 'Consultation request' + (data.name ? ' – ' + data.name : '');
      location.href = 'mailto:' + D.contact.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
      done();
    } else {                                   // default: WhatsApp
      var wa = 'https://wa.me/' + digits(D.contact.whatsapp[0]) + '?text=' + encodeURIComponent(msg);
      var tab = window.open(wa, '_blank');
      if (tab) tab.opener = null; else location.href = wa;   // popup blocked: open in this tab instead
      done();
    }
  }

  /* ---------- lightbox for project photos ---------- */
  var lb, lbItems = [], lbIndex = 0;
  function lbShow(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    var it = lbItems[lbIndex];
    $('img', lb).src = it.dataset.lb;
    $('img', lb).alt = it.dataset.cap || '';
    $('figcaption', lb).textContent = (it.dataset.cap || '') + '  ·  ' + (lbIndex + 1) + ' / ' + lbItems.length;
  }
  function lbOpen(el) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Project photo');
      lb.innerHTML = '<button class="lb-x" type="button" aria-label="Close">&times;</button>' +
        '<button class="lb-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button class="lb-next" type="button" aria-label="Next photo">&#8250;</button>';
      document.body.appendChild(lb);
      lb.addEventListener('click', function (e) {
        if (e.target.closest('.lb-prev')) lbShow(lbIndex - 1);
        else if (e.target.closest('.lb-next')) lbShow(lbIndex + 1);
        else if (e.target === lb || e.target.closest('.lb-x')) lbClose();
      });
    }
    lbItems = $$('[data-lb]').filter(function (x) { return !x.closest('[hidden]'); });
    lbShow(Math.max(0, lbItems.indexOf(el)));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.lb-x', lb).focus();
  }
  function lbClose() {
    if (!lb || !lb.classList.contains('open')) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-lb]');
    if (t) lbOpen(t);
  });
  document.addEventListener('keydown', function (e) {
    if (lb && lb.classList.contains('open')) {
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    } else if (e.key === 'Enter' && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.lb) {
      lbOpen(document.activeElement);
    }
  });

  /* header shadow + gentle parallax */
  function onScroll() {
    var y = window.scrollY;
    $('#nav').classList.toggle('scrolled', y > 10);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('[data-parallax]').forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.setProperty('--py', (r.top * -0.12).toFixed(1) + 'px');
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });

  /* ==========================================================
     BOOT
     ========================================================== */
  fetch(CONTENT_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      D = data;
      renderChrome();
      window.addEventListener('hashchange', route);
      route();
      onScroll();
      $('#loader').classList.add('done');
    })
    .catch(function (err) {
      console.error(err);
      $('#loader').classList.add('done');
      var fileMode = location.protocol === 'file:';
      $('#main').innerHTML = '<div class="load-error"><h1>Content could not be loaded</h1><p>' +
        (fileMode
          ? 'Browsers block reading <code>content/site.json</code> when the page is opened directly from disk. Open the folder with a local web server, for example run <code>npx serve</code> in the project folder or use the VS Code “Live Server” extension.'
          : 'Please check that <code>content/site.json</code> exists and is valid JSON (a missing comma or quote will stop the site from loading). Details: ' + esc(err.message)) +
        '</p></div>';
    });
})();
