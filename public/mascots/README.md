# Asset delle mascotte

Priorità di caricamento per ogni mascotte: **`<id>.riv`** (Rive) →
**`img/<id>.png`** (illustrazione, es. render 3D generato con AI) →
**`<id>.json`** (animazione Lottie, sempre presente come default).

## Illustrazioni 3D (img/)

Metti in `img/` un PNG (o WebP) **con sfondo trasparente**, idealmente
quadrato ≥512px, chiamato `black-cat.png`, `stickman.png`, `fox.png`,
`anime.png`, `anime-m.png`. L'app lo anima via CSS (fluttuazione idle,
saltello con squash al tap). Se accanto c'è anche `<id>-tap.png` (stessa
mascotte in posa esultante), al tap viene mostrato quello per un attimo.

## Animazioni Lottie (default)

Le Lottie di default (`<id>.json`) provengono dal set [Noto Animated Emoji
di Google](https://googlefonts.github.io/noto-emoji-animation/), licenza
Apache 2.0.

- `black-cat.json` — gattina "Kira" (+ `black-cat-tap.json`, reazione occhi a
  cuore riprodotta una volta al tap)
- `stickman.json` — fantasmino "Boo"
- `fox.json` — volpe "Kitsune"
- `anime.json` — ballerina "Yui"
- `anime-m.json` — bicipite "Hiro"

## Override con Rive

Se accanto al `.json` è presente un file `<id>.riv`, l'app usa quello.

1. Apri l'editor gratuito su https://rive.app (oppure remixa una mascotte dalla
   [community](https://rive.app/community/)).
2. Crea una **state machine chiamata `Mascot`** con almeno:
   - un'animazione di idle in loop come stato di default;
   - un **input trigger chiamato `tap`** collegato a una transizione verso
     l'animazione di reazione (che poi rientra nell'idle).
3. Esporta il file (`Download > .riv`) e copialo qui con il nome atteso.
