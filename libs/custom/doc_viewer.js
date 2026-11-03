// Click-to-expand overlay viewer for slide decks and PDFs (see _includes/doc_viewer.html)
// Slide decks come from either a PDF (rendered with pdf.js) or a folder of slide-N.png images.
(function () {
  var pdfjsPromise = null;
  function loadPdfjs(libBase) {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!pdfjsPromise) {
      pdfjsPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = libBase + 'pdf.min.js';
        s.onload = function () {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = libBase + 'pdf.worker.min.js';
          resolve(window.pdfjsLib);
        };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return pdfjsPromise;
  }

  function init(root) {
    var trigger = root.querySelector('.dv-trigger');
    var overlay = root.querySelector('.dv-overlay');
    var closeBtn = overlay.querySelector('.dv-close');
    var stage = overlay.querySelector('.dv-slides');
    var images = Array.prototype.slice.call(overlay.querySelectorAll('.dv-slides img'));
    var canvas = overlay.querySelector('.dv-canvas');
    var status = overlay.querySelector('.dv-status');
    var thumbCanvas = root.querySelector('.dv-thumb');
    var dotsBox = overlay.querySelector('.dv-dots');
    var pdfUrl = root.dataset.pdf;
    var dots = [], current = 0, count = images.length, docPromise = null, renderTask = null, isOpen = false;
    document.body.appendChild(overlay); // avoid being clipped by page containers

    // ---- PDF helpers ----
    function getDoc() {
      if (!docPromise) {
        docPromise = loadPdfjs(root.dataset.lib).then(function (lib) {
          return lib.getDocument(pdfUrl).promise;
        });
      }
      return docPromise;
    }
    function drawPage(doc, pageNum, cv, cssW, cssH) {
      return doc.getPage(pageNum).then(function (page) {
        var base = page.getViewport({ scale: 1 });
        var fit = cssH ? Math.min(cssW / base.width, cssH / base.height) : cssW / base.width;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var vp = page.getViewport({ scale: fit * dpr });
        cv.width = Math.floor(vp.width);
        cv.height = Math.floor(vp.height);
        cv.style.width = Math.floor(vp.width / dpr) + 'px';
        cv.style.height = Math.floor(vp.height / dpr) + 'px';
        var task = page.render({ canvasContext: cv.getContext('2d'), viewport: vp });
        return { task: task };
      });
    }
    function fail() {
      if (status) {
        status.textContent = 'Sorry, the slides could not be loaded. Please use the buttons above.';
        status.hidden = false;
      }
      if (canvas) canvas.style.display = 'none';
    }

    // ---- slide display ----
    function buildDots() {
      for (var n = 0; n < count; n++) (function (n) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'dv-dot';
        d.setAttribute('aria-label', 'Go to slide ' + (n + 1));
        d.addEventListener('click', function () { show(n); });
        dotsBox.appendChild(d);
        dots.push(d);
      })(n);
    }
    function setDots() {
      dots.forEach(function (d, n) {
        d.classList.toggle('active', n === current);
        if (n === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    function showPdf() {
      if (renderTask) { try { renderTask.cancel(); } catch (e) {} renderTask = null; }
      status.hidden = true;
      stage.classList.add('dv-loading');
      getDoc().then(function (doc) {
        if (!count) { count = doc.numPages; buildDots(); setDots(); }
        var mine = current;
        return drawPage(doc, current + 1, canvas, stage.clientWidth, stage.clientHeight).then(function (r) {
          renderTask = r.task;
          return r.task.promise.then(function () {
            if (mine === current) stage.classList.remove('dv-loading');
          });
        });
      }).catch(function (err) {
        if (err && err.name === 'RenderingCancelledException') return;
        stage.classList.remove('dv-loading');
        fail();
      });
    }
    function loadImg(i) {
      var img = images[i];
      if (img && !img.src && img.dataset.src) img.src = img.dataset.src;
    }
    function show(i) {
      if (!count && !pdfUrl) return;
      if (count) current = (i + count) % count; else current = 0;
      setDots();
      if (pdfUrl) { showPdf(); return; }
      images.forEach(function (s, n) { s.classList.toggle('active', n === current); });
      loadImg(current); loadImg(current + 1); loadImg(current - 1);
    }

    if (images.length) buildDots();
    if (images.length || pdfUrl) {
      overlay.querySelector('.dv-prev').addEventListener('click', function () { show(current - 1); });
      overlay.querySelector('.dv-next').addEventListener('click', function () { show(current + 1); });
      var startX = null;
      stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
        startX = null;
      });
    }

    // thumbnail from page 1 of the PDF
    if (thumbCanvas && pdfUrl) {
      getDoc().then(function (doc) {
        return drawPage(doc, 1, thumbCanvas, Math.max(trigger.clientWidth, 400), 0).then(function (r) {
          return r.task.promise;
        });
      }).then(function () {
        thumbCanvas.classList.add('ready');
      }).catch(function () {});
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      if (!isOpen || !pdfUrl) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(showPdf, 150);
    });

    function onKey(e) {
      if (e.key === 'Escape') close();
      else if ((images.length || pdfUrl) && e.key === 'ArrowRight') show(current + 1);
      else if ((images.length || pdfUrl) && e.key === 'ArrowLeft') show(current - 1);
    }
    function open() {
      overlay.hidden = false;
      isOpen = true;
      document.body.classList.add('dv-open');
      var frame = overlay.querySelector('iframe');
      if (frame && !frame.src) frame.src = frame.dataset.src;
      show(0);
      document.addEventListener('keydown', onKey);
      closeBtn.focus();
      if (window.gtag) gtag('event', 'viewer_open', { resource_name: root.dataset.title });
    }
    function close() {
      overlay.hidden = true;
      isOpen = false;
      document.body.classList.remove('dv-open');
      document.removeEventListener('keydown', onKey);
      trigger.focus();
    }
    trigger.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.classList.contains('dv-stage') || e.target === stage) close();
    });
  }
  function boot() { Array.prototype.forEach.call(document.querySelectorAll('.dv'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
