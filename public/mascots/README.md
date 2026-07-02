# Asset delle mascotte

Le mascotte sono animazioni **Lottie** (`<id>.json`) riprodotte in loop con
lottie-web. I file provengono dal set [Noto Animated Emoji di Google]
(https://googlefonts.github.io/noto-emoji-animation/), licenza Apache 2.0.

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
