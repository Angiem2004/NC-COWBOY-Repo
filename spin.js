// Interactive equipment viewer.
//
// Two modes, set via data-mode on .spin-viewer:
//   "tilt"   — single photo, drag tilts it in 3D (placeholder until real
//              360 photos are shot). Uses the <img class="spin-img">.
//   "frames" — true drag-to-spin. Point data-path/data-frames/data-pad/data-ext
//              at a folder of evenly-rotated photos (e.g. spin/frame-01.jpg …).
//              Swapping the placeholder for the real thing = set data-mode="frames",
//              drop the photos in the folder, set data-frames to the count.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.spin-viewer').forEach(function (viewer) {
    var mode = viewer.getAttribute('data-mode') || 'tilt';
    var img  = viewer.querySelector('.spin-img');
    if (!img) return;

    var dragging = false;
    var startX = 0;

    if (mode === 'frames') {
      var count = parseInt(viewer.getAttribute('data-frames'), 10) || 24;
      var path  = viewer.getAttribute('data-path') || 'spin/frame-';
      var pad   = parseInt(viewer.getAttribute('data-pad'), 10) || 2;
      var ext   = viewer.getAttribute('data-ext') || '.jpg';
      var frames = [];
      for (var i = 1; i <= count; i++) {
        var src = path + String(i).padStart(pad, '0') + ext;
        var im = new Image(); im.src = src; frames.push(src);
      }
      var current = 0, startFrame = 0, pxPerFrame = 14;
      var show = function (n) { n = ((n % count) + count) % count; current = n; img.src = frames[n]; };
      var down = function (x) { dragging = true; startX = x; startFrame = current; viewer.classList.add('spun'); };
      var move = function (x) { if (dragging) show(startFrame + Math.round((x - startX) / pxPerFrame)); };
      var up = function () { dragging = false; };
      bind(down, move, up);
    } else {
      // tilt placeholder
      var rot = 0, startRot = 0;
      var apply = function (deg) {
        rot = Math.max(-30, Math.min(30, deg));
        img.style.transform = 'rotateY(' + rot + 'deg) scale(1.02)';
      };
      var down = function (x) { dragging = true; startX = x; startRot = rot; img.style.transition = 'none'; viewer.classList.add('spun'); };
      var move = function (x) { if (dragging) apply(startRot + (x - startX) * 0.16); };
      var up = function () { if (!dragging) return; dragging = false; img.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)'; apply(0); };
      bind(down, move, up);
    }

    function bind(down, move, up) {
      viewer.addEventListener('mousedown', function (e) { e.preventDefault(); down(e.clientX); });
      window.addEventListener('mousemove', function (e) { move(e.clientX); });
      window.addEventListener('mouseup', up);
      viewer.addEventListener('touchstart', function (e) { down(e.touches[0].clientX); }, { passive: true });
      viewer.addEventListener('touchmove', function (e) { if (dragging) { e.preventDefault(); move(e.touches[0].clientX); } }, { passive: false });
      viewer.addEventListener('touchend', up);
    }
  });
});
