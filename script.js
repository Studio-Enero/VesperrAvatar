/* Virtual Concierge — site behaviour.
   Two pieces: staggered scroll reveals, and the hero readout that plays back
   the shape of a real model response (a line of text plus a gesture verb). */

(function () {
  "use strict";

  // Without JS, the reveal styles would leave the page blank. Flag it first.
  document.documentElement.classList.remove("no-js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Scroll reveal ---------------- */

  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-r]"));

  // Stagger siblings so a section's parts arrive in sequence rather than at once.
  var byParent = new Map();
  targets.forEach(function (el) {
    var key = el.parentNode;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(el);
  });
  byParent.forEach(function (group) {
    group.forEach(function (el, i) {
      el.style.setProperty("--d", Math.min(i, 6) * 80 + "ms");
    });
  });

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target); // reveal once, then stop paying for it
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Hero slider ---------------- */

  // Wrapped in its own function so that if the markup is ever missing, the
  // early return below cannot take the gesture readout down with it.
  (function initSlider() {

  // PLACEHOLDER SLIDES. Drop your own files into website/images/ using these
  // exact names, or edit `src` here to point wherever you like. Until an image
  // exists the slide shows a designed placeholder (the filename), so the page
  // never looks broken.
  // PLACEHOLDER SLIDES. Drop your own files into website/images/ using these
  // exact names, or edit `src` here to point wherever you like. Until an image
  // exists the slide shows a designed placeholder (the filename), so the page
  // never looks broken.
  var SLIDES = [
    {
      src: "images/hero-01.jpg",
      alt: "A digital human avatar standing in a hotel lobby",
      caption: "<strong>Presence.</strong> A full-body figure that reads as a person before it says anything."
    },
    {
      src: "images/hero-02.jpg",
      alt: "Close view of an avatar's face mid-speech",
      caption: "<strong>Voice.</strong> Natural speech with lip-sync keeping pace, not chasing."
    },
    {
      src: "images/hero-03.jpg",
      alt: "An avatar gesturing toward an entrance",
      caption: "<strong>Body language.</strong> The reply carries its own staging."
    },
    {
      src: "images/hero-04.jpg",
      alt: "A life-size holographic digital human at an event",
      caption: "<strong>Scale.</strong> From a screen to a life-sized hologram."
    },
  ];

  var track = document.getElementById("track");
  var dotsBox = document.getElementById("dots");
  var capEl = document.getElementById("cap");
  var idxEl = document.getElementById("idx");
  var totEl = document.getElementById("tot");
  if (!track) return;

  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  if (totEl) totEl.textContent = pad(SLIDES.length);

  SLIDES.forEach(function (slide, i) {
    var li = document.createElement("li");
    li.className = "slider__slide is-placeholder";
    li.setAttribute("role", "group");
    li.setAttribute("aria-label", "Image " + (i + 1) + " of " + SLIDES.length);

    // Placeholder is painted first; the real <img> fades in over it on load.
    var ph = document.createElement("div");
    ph.className = "ph";
    ph.innerHTML =
      '<div class="ph__frame" aria-hidden="true"></div>' +
      '<p class="ph__name"></p>' +
      '<p class="ph__hint">add this file to /images</p>';
    ph.querySelector(".ph__name").textContent = slide.src;
    li.appendChild(ph);

    var img = document.createElement("img");
    img.alt = slide.alt || "";
    img.loading = i === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.addEventListener("load", function () { li.classList.remove("is-placeholder"); });
    // A missing file is the normal state until images are supplied; keep the
    // placeholder rather than showing a torn-image glyph.
    img.addEventListener("error", function () { li.classList.add("is-placeholder"); });
    img.src = slide.src;
    li.appendChild(img);

    track.appendChild(li);
  });

  var slides = Array.prototype.slice.call(track.children);
  var current = 0;
  var timer = null;
  var DELAY = 6000;

  function render(next) {
    current = (next + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      var on = i === current;
      s.classList.toggle("is-current", on);
      // Keep off-screen slides out of the tab order.
      s.setAttribute("aria-hidden", on ? "false" : "true");
      s.querySelectorAll("img").forEach(function (im) {
        if (on) im.removeAttribute("tabindex");
        else im.setAttribute("tabindex", "-1");
      });
    });
    if (dotsBox) {
      Array.prototype.forEach.call(dotsBox.children, function (d, i) {
        d.setAttribute("aria-selected", i === current ? "true" : "false");
      });
    }
    if (capEl) capEl.innerHTML = SLIDES[current].caption;
    if (idxEl) idxEl.textContent = pad(current + 1);
  }

  function go(dir) { stop(); render(current + dir); start(); }

  if (dotsBox) {
    SLIDES.forEach(function (slide, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slider__dot";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", "false");
      b.setAttribute("aria-label", "Image " + (i + 1));
      b.addEventListener("click", function () { stop(); render(i); start(); });
      dotsBox.appendChild(b);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".slider__nav"), function (btn) {
    btn.addEventListener("click", function () { go(parseInt(btn.dataset.dir, 10) || 0); });
  });

  // Autoplay, unless the visitor asked for reduced motion.
  function start() {
    if (reduced) return;
    stop();
    timer = setInterval(function () { render(current + 1); }, DELAY);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  if (!reduced) {
    var frame = document.querySelector(".slider__frame");
    if (frame) {
      frame.addEventListener("mouseenter", stop);
      frame.addEventListener("mouseleave", start);
      frame.addEventListener("focusin", stop);
      frame.addEventListener("focusout", start);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    // Keyboard: only when focus is actually inside the slider.
    var slider = document.querySelector(".slider");
    if (slider) {
      slider.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      });
    }

    // Touch swipe.
    var x0 = null;
    var frame2 = document.querySelector(".slider__frame");
    if (frame2) {
      frame2.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      frame2.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        x0 = null;
      }, { passive: true });
    }
  }

  render(0);
  start();
  })();

  /* ---------------- Hero gesture readout ---------------- */

  // The verbs below are the real tokens the model emits, and the lines are the
  // kind of answer a front desk actually gives.
  var SCENES = [
    { verb: "wave", line: "Good evening. The lounge is on four, just past the lift." },
    { verb: "nod", line: "Yes — check-in opens at three, and your room is held until six." },
    { verb: "hand_behind_back", line: "The rate includes breakfast. Valet is beneath the porte-cochère." },
    { verb: "point", line: "The pool runs along the east corridor; towels are at the far end." },
    { verb: "gesture_open", line: "Anything else before I let you settle in?" }
  ];

  var verbEl = document.getElementById("gesture");
  var saidEl = document.getElementById("saida");
  if (!verbEl || !saidEl) return;

  // If reduced motion is on, show one complete scene and hold it.
  if (reduced) {
    verbEl.textContent = SCENES[0].verb;
    saidEl.textContent = "“" + SCENES[0].line + "”";
    return;
  }

  var index = 0;
  var timer = null;

  function typeVerb(text, done) {
    var i = 0;
    verbEl.textContent = "";
    (function step() {
      if (i >= text.length) { done(); return; }
      verbEl.textContent += text[i++];
      timer = setTimeout(step, 62 + Math.random() * 70);
    })();
  }

  function show(scene) {
    typeVerb(scene.verb, function () {
      // Beat between the verb landing and the line arriving.
      timer = setTimeout(function () {
        saidEl.style.opacity = "0";
        timer = setTimeout(function () {
          saidEl.textContent = "“" + scene.line + "”";
          saidEl.style.opacity = "1";
          timer = setTimeout(next, 4200);
        }, 280);
      }, 520);
    });
  }

  function next() {
    index = (index + 1) % SCENES.length;
    show(SCENES[index]);
  }

  // Pause while the tab is hidden — no point animating for nobody.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearTimeout(timer);
    } else {
      timer = setTimeout(next, 600);
    }
  });

  saidEl.style.transition = "opacity 280ms ease";
  show(SCENES[0]);
})();
