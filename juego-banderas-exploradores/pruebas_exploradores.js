/**
 * Suite de pruebas de "Exploradores del Mundo: Banderas"
 * Ejecutar:  node pruebas_exploradores.js
 * Extrae el motor del archivo HTML (sin abrir navegador) y verifica las
 * reglas de negocio, el banco de datos, el filtro de contenido, el motor de
 * pistas discriminantes, la dificultad adaptativa y el historial.
 */
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, 'exploradores_del_mundo_banderas_v2.html');
const html = fs.readFileSync(HTML, 'utf8');
const s = html.indexOf('<script>\n    /* ====') + '<script>'.length;
const e = html.lastIndexOf('</script>');
const code = html.slice(s, e);

// Entorno mínimo (sin DOM): localStorage en memoria, window/document inertes
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const window = { addEventListener() {} };
const document = { addEventListener() {}, getElementById() { return null; } };
const M = new Function('window', 'document', 'localStorage',
    code + '\nreturn { REGLAS, COSTO_COMODIN, CONTINENTES, DATABASE, sanitizeDatabase, motivoBloqueo, normalizar, HintEngine, Adaptativo, Historial, shuffle, pick, fmtPts };'
)(window, document, localStorage);

let pasadas = 0, fallidas = 0;
function test(nombre, fn) {
    try { fn(); pasadas++; console.log(`  ✓ ${nombre}`); }
    catch (err) { fallidas++; console.log(`  ✗ ${nombre}\n      ${err.message}`); }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const eq = (a, b, msg) => assert(a === b, `${msg}: esperado ${JSON.stringify(b)}, obtenido ${JSON.stringify(a)}`);

const { REGLAS, COSTO_COMODIN, CONTINENTES, DATABASE, sanitizeDatabase, motivoBloqueo, HintEngine, Adaptativo, Historial, shuffle, pick } = M;
const { db, reporte } = sanitizeDatabase(DATABASE);
const todos = Object.values(db).flat();

console.log('\n1. Reglas de negocio');
test('10 preguntas por ronda, base 10, 3 intentos, 2 comodines, 4 opciones', () => {
    eq(REGLAS.PREGUNTAS_POR_RONDA, 10, 'preguntas'); eq(REGLAS.PUNTOS_BASE, 10, 'base');
    eq(REGLAS.INTENTOS, 3, 'intentos'); eq(REGLAS.COMODINES, 2, 'comodines'); eq(REGLAS.OPCIONES, 4, 'opciones');
});
test('Cada comodín resta 25% del base: 10 → 7.5 → 5', () => {
    eq(COSTO_COMODIN, 2.5, 'costo');
    const pts = n => Math.max(0, REGLAS.PUNTOS_BASE - n * COSTO_COMODIN);
    eq(pts(0), 10, '0 comodines'); eq(pts(1), 7.5, '1 comodín'); eq(pts(2), 5, '2 comodines');
});
test('Puntaje máximo de ronda = 100', () => eq(REGLAS.PREGUNTAS_POR_RONDA * REGLAS.PUNTOS_BASE, 100, 'máximo'));
test('Categorías de comodín limitadas a la regla 3', () => {
    eq(REGLAS.CATEGORIAS_COMODIN.join('|'), 'Color extra|Monumentos|Comida|Historia|Naturaleza', 'categorías');
});

console.log('\n2. Banco de datos');
test('5 continentes con al menos 10 países cada uno', () => {
    eq(CONTINENTES.length, 5, 'continentes');
    for (const c of CONTINENTES) assert(db[c.key].length >= 10, `${c.nombre} tiene ${db[c.key].length}`);
});
test('IDs únicos y códigos ISO de dos letras', () => {
    const ids = new Set(todos.map(p => p.id)); eq(ids.size, todos.length, 'ids únicos');
    for (const p of todos) assert(/^[a-z]{2}$/.test(p.iso), `ISO inválido en ${p.nombre}`);
});
test('Cada país tiene ≥2 pistas difíciles, ≥2 medias y ≥2 fáciles tras el filtro', () => {
    for (const p of todos) for (const n of ['D', 'M', 'F']) {
        const c = p.pistas.filter(h => h.n === n).length;
        assert(c >= 2, `${p.nombre} nivel ${n}: ${c}`);
    }
});
test('Ninguna pista bloqueada por el filtro ni por el nombre del país', () => eq(reporte.eliminadas.length, 0, JSON.stringify(reporte.eliminadas.slice(0, 3))));
test('Los hechos de cada pista existen en el perfil de su país', () => eq(reporte.inconsistentes.length, 0, JSON.stringify(reporte.inconsistentes.slice(0, 3))));
test('Toda pista de bandera (D/M) declara al menos un hecho', () => {
    const sin = todos.flatMap(p => p.pistas.filter(h => h.n !== 'F' && (!h.f || !h.f.length)).map(h => `${p.nombre}: ${h.t}`));
    eq(sin.length, 0, sin.slice(0, 3).join(' | '));
});
test('Reporte de pistas pendientes de verificación (informativo)', () => {
    console.log(`      ${reporte.pendientes.length} pista(s) marcadas: ` + [...new Set(reporte.pendientes.map(x => x.pais))].join(', '));
});

console.log('\n3. Filtro de contenido');
test('Bloquea conflictos bélicos', () => { eq(motivoBloqueo('Lleva un fusil AK-47'), 'conflictos', 'AK-47'); eq(motivoBloqueo('Homenaje al ejército'), 'conflictos', 'ejército con acento'); });
test('Bloquea religión', () => { eq(motivoBloqueo('La mezquita más grande'), 'religion', 'mezquita'); eq(motivoBloqueo('representa a la diosa del sol'), 'religion', 'diosa'); });
test('Bloquea política', () => { eq(motivoBloqueo('símbolo del partido'), 'politica', 'partido'); eq(motivoBloqueo('tras la revolución'), 'politica', 'revolución'); });
test('No bloquea texto neutro', () => { eq(motivoBloqueo('Una estrella verde en el centro; se come café con pan'), null, 'neutro'); eq(motivoBloqueo('Tiene forma de armadillo'), null, 'armadillo ≠ arma'); });

console.log('\n4. Motor de pistas discriminantes');
function simular(nivel, n = 20000) {
    let ambInicial = 0, ambFinal = 0;
    for (let i = 0; i < n; i++) {
        const cont = pick(CONTINENTES).key;
        const c = pick(db[cont]);
        const dis = shuffle(db[cont].filter(x => x.id !== c.id)).slice(0, 3);
        const usadas = new Set(), rev = [];
        const h1 = HintEngine.elegir(c, nivel, usadas, dis, rev); rev.push(h1);
        if (HintEngine.ambiguos(rev, dis).length) ambInicial++;
        const niv2 = nivel === 'D' ? ['M', 'F'] : ['F', 'F'];
        for (const lv of niv2) rev.push(HintEngine.elegir(c, lv, usadas, dis, rev));
        if (HintEngine.ambiguos(rev, dis).length) ambFinal++;
    }
    return { inicial: ambInicial / n, final: ambFinal / n };
}
test('Nivel medio: la pista inicial deja ambigüedad en ≤ 3% de las preguntas', () => {
    const r = simular('M'); console.log(`      ambigüedad inicial M: ${(r.inicial * 100).toFixed(2)}%`);
    assert(r.inicial <= 0.03, `${(r.inicial * 100).toFixed(2)}%`);
});
test('Nivel difícil: la pista inicial deja ambigüedad en ≤ 15% de las preguntas', () => {
    const r = simular('D'); console.log(`      ambigüedad inicial D: ${(r.inicial * 100).toFixed(2)}%`);
    assert(r.inicial <= 0.15, `${(r.inicial * 100).toFixed(2)}%`);
});
test('Con los dos comodines usados nunca queda ambigüedad', () => {
    for (const lv of ['F', 'M', 'D']) { const r = simular(lv, 5000); eq(r.final, 0, `nivel ${lv}`); }
});
test('Nunca repite el texto de una pista dentro de la misma pregunta', () => {
    for (let i = 0; i < 3000; i++) {
        const c = pick(todos); const usadas = new Set(); const rev = [];
        const ts = ['D', 'M', 'F'].map(lv => { const h = HintEngine.elegir(c, lv, usadas, [], rev); rev.push(h); return h.t; });
        eq(new Set(ts).size, 3, `${c.nombre}: ${ts.join(' | ')}`);
    }
});
test('Si un nivel está vacío degrada al siguiente sin romperse', () => {
    const fake = { nombre: 'X', perfil: [], pistas: [{ n: 'F', c: 'Comida', t: 'solo fácil', f: [] }] };
    const h = HintEngine.elegir(fake, 'D', new Set(), [], []);
    eq(h.t, 'solo fácil', 'degradación'); eq(h.degradada, true, 'marcada');
});

console.log('\n5. Dificultad adaptativa');
test('Empieza en nivel medio y sus comodines son fáciles', () => { Adaptativo.reiniciar(); eq(Adaptativo.nivelInicial(), 'M', 'inicial'); eq(Adaptativo.nivelesComodin().join(''), 'FF', 'comodines'); });
test('Dos aciertos limpios seguidos suben a difícil; comodines media y fácil', () => {
    Adaptativo.reiniciar();
    eq(Adaptativo.registrar({ acierto: true, comodines: 0, fallos: 0 }), null, 'primer acierto');
    eq(Adaptativo.registrar({ acierto: true, comodines: 0, fallos: 0 }), 'sube', 'segundo acierto');
    eq(Adaptativo.nivelInicial(), 'D', 'nivel'); eq(Adaptativo.nivelesComodin().join(''), 'MF', 'comodines');
});
test('Un fallo total baja de nivel; no baja de fácil', () => {
    Adaptativo.reiniciar();
    eq(Adaptativo.registrar({ acierto: false, comodines: 2, fallos: 3 }), 'baja', 'baja'); eq(Adaptativo.nivelInicial(), 'F', 'fácil');
    eq(Adaptativo.registrar({ acierto: false, comodines: 0, fallos: 3 }), null, 'ya en el mínimo');
});
test('Acierto con ayuda mantiene el nivel y corta la racha', () => {
    Adaptativo.reiniciar();
    Adaptativo.registrar({ acierto: true, comodines: 0, fallos: 0 });
    eq(Adaptativo.registrar({ acierto: true, comodines: 1, fallos: 0 }), null, 'con comodín');
    eq(Adaptativo.registrar({ acierto: true, comodines: 0, fallos: 0 }), null, 'racha reiniciada');
    eq(Adaptativo.nivelInicial(), 'M', 'sigue medio');
});
test('No sube más allá de difícil', () => {
    Adaptativo.reiniciar();
    for (let i = 0; i < 6; i++) Adaptativo.registrar({ acierto: true, comodines: 0, fallos: 0 });
    eq(Adaptativo.nivelInicial(), 'D', 'tope');
});

console.log('\n6. Historial entre rondas (score-and-reset)');
test('Registra rondas y calcula mejor y promedio', () => {
    Historial.limpiar();
    Historial.agregar({ fecha: '2026-09-06T10:00:00Z', puntaje: 40, aciertos: 5, errores: 5, banderas: [{ id: 'ARG' }], duracion: 100 });
    Historial.agregar({ fecha: '2026-09-06T11:00:00Z', puntaje: 70, aciertos: 8, errores: 2, banderas: [{ id: 'BRA' }], duracion: 90 });
    const r = Historial.resumen();
    eq(r.rondas, 2, 'rondas'); eq(r.mejor, 70, 'mejor'); eq(r.promedio, 55, 'promedio'); eq(r.ultimas[0].puntaje, 70, 'orden');
});
test('Recuerda banderas recientes para ofrecer banderas nuevas', () => {
    const v = Historial.vistasRecientes(3); assert(v.has('ARG') && v.has('BRA'), 'vistas');
});
test('"Reiniciar tu juego" borra el historial', () => { Historial.limpiar(); eq(Historial.resumen().rondas, 0, 'vacío'); });

console.log('\n7. Ronda de 10 sin repetir país');
test('Oceanía elegida 10 veces seguidas produce 10 países distintos', () => {
    const used = new Set();
    for (let q = 0; q < 10; q++) { const pool = db.Oceania.filter(c => !used.has(c.id)); assert(pool.length, `sin países en la pregunta ${q + 1}`); used.add(pick(pool).id); }
    eq(used.size, 10, 'distintos');
});
test('Barajado Fisher-Yates conserva los elementos', () => {
    const a = [1, 2, 3, 4, 5]; const b = shuffle(a); eq([...b].sort().join(), '1,2,3,4,5', 'elementos'); eq(a.join(), '1,2,3,4,5', 'no muta');
});

console.log(`\n${pasadas} pruebas pasadas, ${fallidas} fallidas.`);
process.exit(fallidas ? 1 : 0);
