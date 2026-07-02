# File Rive delle mascotte

L'app cerca in questa cartella un file Rive per ogni mascotte; se il file manca
viene mostrato automaticamente il fallback SVG animato integrato.

Nomi attesi (vedi `lib/mascots.ts`):

- `black-cat.riv` — gatta nera "Kira"
- `stickman.riv` — stickman "Stick"
- `fox.riv` — volpe "Kitsune"
- `anime.riv` — coach anime "Yui" (atletica)
- `anime-m.riv` — coach anime "Hiro" (muscoloso)

## Come creare/esportare un file

1. Apri l'editor gratuito su https://rive.app (oppure remixa una mascotte dalla
   [community](https://rive.app/community/)).
2. Crea una **state machine chiamata `Mascot`** con almeno:
   - un'animazione di idle in loop come stato di default;
   - un **input trigger chiamato `tap`** collegato a una transizione verso
     l'animazione di reazione (che poi rientra nell'idle).
3. Esporta il file (`Download > .riv`) e copialo qui con il nome atteso.

Nient'altro da fare: al prossimo avvio l'app usa il file Rive al posto dell'SVG.
