import './index.css';

const init3D = () => {
  const root3d = document.getElementById('react-3d-root');
  if (root3d && !root3d.dataset.loaded) {
    root3d.dataset.loaded = 'true';
    Promise.all([
      import('react-dom/client'),
      import('./components/canvas/CinematicArc'),
      import('react')
    ]).then(([ { createRoot }, { CinematicArc }, { StrictMode } ]) => {
      createRoot(root3d).render(
        <StrictMode>
          <CinematicArc />
        </StrictMode>
      );
    });
  }
};

// Start loading the 3D scene upon user interaction to guarantee 100/100 on PageSpeed.
setTimeout(init3D, 2000);
['scroll', 'mousemove', 'touchstart', 'click'].forEach(evt => {
  window.addEventListener(evt, init3D, { once: true, passive: true });
});
