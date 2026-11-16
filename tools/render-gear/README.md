# Rendus 3D de la planche matériel

Les visuels de `public/assets/gear/` sont des rendus 3D produits par ces scripts. Ils ne tournent ni au build ni en CI :
on ne les relance que pour changer un objet, une matière ou l'éclairage.

## Principe
- `gear3d.py` modélise chaque objet (formes génériques, aucune marque ni logo), lui donne des matières physiques
  (caoutchouc, aluminium anodisé, verre traité, papier) et le rend avec Blender Cycles, vu du dessus.
- Tous les objets partagent le même éclairage et la rotation est cuite dans le rendu : les ombres partent
  toutes dans la même direction.
- `convert.mjs` recadre, convertit en WebP et écrit `content/gear-assets.mjs` (dimensions et taille réelle en mm),
  dont `templates/gear.mjs` tire la largeur de chaque objet sur la planche.

## Relancer
```bash
pip install bpy                    # Blender en module Python
npm install --no-save sharp        # conversion d'images
node tools/render-gear/screen.mjs  # écran de la tablette
GEAR_K=0.15 python3 tools/render-gear/gear3d.py all 1150 110 /tmp/gear-out | tee /tmp/gear.log
GEAR_K=0.15 python3 tools/render-gear/gear3d.py mat-mobile 1150 110 /tmp/gear-out | tee -a /tmp/gear.log
node tools/render-gear/convert.mjs /tmp/gear-out . /tmp/gear.log
```
`GEAR_K` règle l'intensité de l'éclairage : 0.15 donne l'orange de la charte sur le tapis.
Compter environ 30 minutes sur deux cœurs.
