import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CinematicArc } from './components/canvas/CinematicArc';

import './index.css';

// 1. Mount 3D Scene (L'Arc Cinématique avec Grain et Flare)
const root3d = document.getElementById('react-3d-root');
if (root3d) {
  createRoot(root3d).render(
    <StrictMode>
      <CinematicArc />
    </StrictMode>
  );
}

// 2. Le carousel Work a été retiré ! 
// On rend la liberté au HTML natif (qui embarque toutes les fonctionnalités originelles),
// mais on le booste drastiquement avec les CSS "Hover Zoom & Glass" dans index.css.
