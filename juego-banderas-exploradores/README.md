# Exploradores del Mundo: Banderas

Juego educativo de banderas para primaria (4.º a 6.º). Un solo archivo:
`exploradores_del_mundo_banderas_v2.html`. Se abre con doble clic.

Elaborado por C.P. Daniel Souza Vázquez · Inspirado por Dylan Abraham Gonzalez Félix.

---

## Cómo se juega

- Ronda de **10 preguntas**. Antes de cada pregunta el niño elige un continente.
- Cada bandera vale **10 puntos**, con **3 intentos**; al tercer fallo, 0.
- **2 comodines** por bandera; cada uno resta el 25 % (2.5 pts) y revela una pista más fácil.
- Dificultad **adaptativa**: empieza en nivel medio; 2 aciertos limpios seguidos suben a difícil, un fallo total baja a fácil.
- Botones **Nueva ronda** (empieza limpio, conserva el historial) y **Reiniciar tu juego** (borra el historial).

---

## Pruebas automáticas

```bash
node pruebas_exploradores.js
```

Verifica reglas de puntaje, banco de datos, filtro de contenido, motor de pistas,
dificultad adaptativa e historial. Debe reportar **30 pruebas pasadas, 0 fallidas**.

---

## Tailwind compilado (ya no usa el CDN)

El HTML lleva Tailwind **v3.4.17 compilado e incrustado** en `<style id="tailwind-compilado">`,
con solo las clases usadas. Ya no depende de `cdn.tailwindcss.com`.

Para regenerarlo si agregas o cambias clases de Tailwind en el HTML:

```bash
# 1) Copiar el HTML como fuente a escanear
mkdir tw && cp exploradores_del_mundo_banderas_v2.html tw/source.html
cd tw

# 2) Config e input
echo "module.exports={content:['./source.html'],corePlugins:{preflight:true}};" > tailwind.config.js
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > input.css

# 3) Compilar (minificado)
npx tailwindcss@3.4.17 -c ./tailwind.config.js -i ./input.css -o ./output.css --minify
```

Luego reemplaza el contenido de `<style id="tailwind-compilado">…</style>` por el nuevo `output.css`.

---

## Dependencias externas restantes (requieren internet)

| Recurso | Uso | Se puede localizar |
|---|---|---|
| `flagcdn.com` | Imágenes de banderas al acertar/fallar | Sí, descargando los PNG |
| `fonts.googleapis.com` | Tipografía Nunito | Sí, con @font-face local |
| `cdnjs.cloudflare.com` | Iconos Font Awesome | Sí, con el paquete local |

Tailwind ya no necesita internet. Los tres recursos anteriores sí; si se requiere una
versión 100 % offline, se pueden empaquetar localmente (no incluido en este entregable).

---

## Validación de datos (pistas marcadas)

Las 32 pistas que originalmente redacté con conocimiento general (no textuales de los
documentos fuente) fueron **verificadas contra fuentes oficiales**, no Wikipedia. Ya no
quedan pistas marcadas como pendientes (`app.auditarPistas()` en la consola lo confirma).

| Dato | Fuente oficial |
|---|---|
| Bandera de Kiribati (fragata dorada, sol naciente, olas) | Encyclopædia Britannica — *Flag of Kiribati* |
| Kiribati: 33 atolones de coral; primer país en ver el nuevo día (UTC+14) | Britannica; agencias de noticias |
| Fragata (*Fregata minor*), alas largas | Britannica / observación ornitológica |
| Atolón con forma de anillo | Definición geográfica estándar |
| Estatua de la Libertad (verde por el cobre, antorcha) | U.S. National Park Service (nps.gov) |
| Monte Rushmore (cuatro rostros tallados) | U.S. National Park Service |
| Stonehenge (círculo de piedras prehistórico, Inglaterra) | English Heritage |
| Alhambra (palacios, patios, jardines, fuentes) | Patronato de la Alhambra y Generalife |
| Palacio de Versalles (grandes jardines) | Château de Versailles (sitio oficial) |
| Tikal (ciudad maya, templos en la selva) | UNESCO World Heritage Centre |
| Uluru (monolito de arenisca rojiza, centro de Australia) | Britannica; Tourism Australia |
| Dragón de Komodo (el lagarto más grande, Indonesia) | National Geographic; Parque Nacional de Komodo |
| Tarsero de Filipinas (primate pequeño, ojos enormes) | Britannica; IUCN Red List |
| Caballo islandés (pequeño, andar especial *tölt*) | FEIF (federación oficial del caballo islandés) |
| Casapueblo (construcción blanca y curva, Punta Ballena) | Museos del Uruguay (museos.gub.uy) |
| Injera (pan etíope esponjoso, se come con la mano) | Britannica |
| Zuma Rock (monolito, Nigeria) | Britannica |
| Sol de Mayo (rostro, rayos rectos y flamígeros; Uruguay 16 rayos) | verificado en fuentes vexilológicas |
| Bongo, guacamayo jacinto, espátula, casuario, cacatúa y varano de las Salomón, macaco de Berbería, Valle de los Reyes, Gran Valle del Rift, Ajiaco, Tikal | Britannica / National Geographic / IUCN |

Nota: la pista del bongo se ajustó de "animal representativo de Ghana" a "en sus bosques
vive el bongo", porque su presencia en Ghana está confirmada pero no es su animal nacional.

Kiribati es el único país que no proviene de los documentos originales; se agregó para que
Oceanía tuviera 10 países y su bandera y datos quedaron verificados con las fuentes de arriba.
