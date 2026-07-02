# Asset delle mascotte

Priorità di caricamento per ogni mascotte: **`<id>.riv`** (Rive) →
**`img/<id>.png`** (illustrazione, es. render 3D generato con AI) →
**`<id>.json`** (animazione Lottie, sempre presente come default).

## Illustrazioni e animazioni (img/)

Metti in `img/` un file **con sfondo trasparente**, quadrato ≥512px,
chiamato `black-cat`, `stickman`, `fox`, `anime` o `anime-m` con estensione:

- **`.webp` o `.gif` animato** (consigliato): idle vera in loop — ad es.
  generata con un tool AI image-to-video dal render del personaggio — che il
  browser riproduce nativamente;
- **`.png` statico**: l'app lo anima via CSS (fluttuazione idle, saltello al tap).

Se accanto c'è anche `<id>-tap.<ext>` (reazione/esultanza), al tap viene
mostrato quello per un attimo. Priorità estensioni: webp > gif > png.

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
