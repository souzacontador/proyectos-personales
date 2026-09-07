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
- Al revelar la bandera (acierto o fallo) aparece una **ficha del país**: capital, moneda, idioma y código ISO.

---

## Catálogo (septiembre 2026)

**94 países soberanos**: África 20, América 20, Asia 20, Europa 20 y Oceanía 14
(Oceanía solo tiene 14 Estados soberanos). Cada país tiene perfil de bandera, pistas
en tres niveles y ficha con capital, moneda e idioma.

Países agregados en la ampliación (27):

| Continente | Nuevos |
|---|---|
| África | Túnez, Camerún, Costa de Marfil, Uganda, Zambia, Namibia, Seychelles |
| América | Panamá, Ecuador, Venezuela, Bahamas |
| Asia | Turquía, Malasia, Singapur, Sri Lanka, Bangladesh, Bután |
| Europa | Suecia, Dinamarca, Finlandia, Austria, Bélgica, Croacia |
| Oceanía | Micronesia, Islas Marshall, Nauru, Tuvalu |

Categorías de comodín: Color extra, Monumentos, Comida, Historia, Naturaleza y, nuevas,
**Capital**, **Moneda** e **Idioma**. Las tres últimas se generan automáticamente desde la
ficha de cada país al cargar; Moneda e Idioma declaran un hecho en el perfil para que el
motor no elija una pista que también aplique a un distractor (por ejemplo, el euro o el
español). Se omite cualquier pista de ficha que diría el nombre del país (capital Túnez,
rupia nepalí, dólar de Singapur).

---

## Pruebas automáticas

```bash
node pruebas_exploradores.js
```

Verifica reglas de puntaje, banco de datos (94 países, fichas, pistas generadas), filtro de
contenido, motor de pistas, dificultad adaptativa e historial. Debe reportar **34 pruebas
pasadas, 0 fallidas**.

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

La ampliación de septiembre de 2026 (ficha del país) solo usa clases que ya estaban compiladas,
por lo que no hizo falta recompilar.

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

## Fuentes de la ampliación (septiembre 2026)

Los datos nuevos provienen de tres libros de Sujata Sanyal (carpeta *LIBROS BIBLIOTECA/06 BANDERAS*):

| Libro | Uso |
|---|---|
| *Banderas del mundo: un viaje visual* | Capital, moneda, idioma, códigos ISO, soberanía e **imágenes de las banderas** (los perfiles y pistas de bandera de los 27 países nuevos se redactaron observando la bandera en el PDF). |
| *El libro de las banderas: datos para niños* | Cotejo de capital, moneda e idioma. |
| *Identificación de banderas: cuestionario de países* | Pistas fáciles (117 nuevas para los 67 países previos y las de los 27 nuevos). |

Filtro aplicado al cuestionario: se descartaron todas las preguntas sobre presidentes o monarcas,
religión, guerras, independencia y forma de gobierno. Se conservaron geografía, naturaleza,
comida, música y danza, monumentos no religiosos, deportes y festivales.

Correcciones aplicadas respecto a los libros (verificadas):

| Dato | Libro | Se usó | Motivo |
|---|---|---|---|
| Capital de Kazajistán | Nur-Sultán | Astaná | Nombre restituido en septiembre de 2022 (decreto presidencial). |
| Moneda de Cuba | Peso cubano convertible | Peso cubano | El CUC dejó de circular el 1 de enero de 2021. |
| Capital de Alemania | "Berlina" (errata) | Berlín | El segundo libro dice Berlín. |
| Idioma de China | Mandarín y uigur | Mandarín | El uigur es regional; se conservó solo la lengua nacional. |
| Idioma de Bolivia | "Español y 36 otros" | Español, quechua, aimara y otras lenguas | Combinación de los dos libros. |
| Capitales con grafía RAE | Jacarta, Dacca, Nursultán | Yakarta, Daca, Astaná | Grafía en español. |
| Moneda e idioma de Nepal | Rupia nepalí / nepalí | (solo en la ficha) | La pista se omite porque diría el nombre del país. |

No se agregó ninguna pista redactada con conocimiento general: `app.auditarPistas()` sigue
reportando 0 pendientes.

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
