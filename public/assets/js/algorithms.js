const algorithms = [
    {
        title: 'Suma cifrelor unui număr',
        chapter: 'elementar',
        difficulty: 'începător',
        tags: 'cifre while numere',
        description: 'Extrage cifrele cu operatorul modulo și calculează suma lor.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, suma = 0;\n    cin >> n;\n    while (n > 0) {\n        suma += n % 10;\n        n /= 10;\n    }\n    cout << suma;\n    return 0;\n}`
    },
    {
        title: 'Cel mai mare divizor comun',
        chapter: 'elementar',
        difficulty: 'începător',
        tags: 'cmmdc euclid divizori',
        description: 'Algoritmul lui Euclid pentru cel mai mare divizor comun.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    while (b != 0) {\n        int rest = a % b;\n        a = b;\n        b = rest;\n    }\n    cout << a;\n    return 0;\n}`
    },
    {
        title: 'Frecvența valorilor din vector',
        chapter: 'vectori',
        difficulty: 'începător',
        tags: 'vector frecventa numarare',
        description: 'Numără aparițiile fiecărei valori într-un vector cu valori mici.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, x, frecventa[101] = {};\n    cin >> n;\n    for (int i = 0; i < n; i++) {\n        cin >> x;\n        frecventa[x]++;\n    }\n    for (int i = 0; i <= 100; i++)\n        if (frecventa[i]) cout << i << ": " << frecventa[i] << "\\n";\n    return 0;\n}`
    },
    {
        title: 'Transpunerea unei matrice',
        chapter: 'vectori',
        difficulty: 'începător',
        tags: 'matrice transpusa linii coloane',
        description: 'Construiește matricea transpusă schimbând liniile cu coloanele.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, m, a[20][20];\n    cin >> n >> m;\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < m; j++) cin >> a[i][j];\n    for (int j = 0; j < m; j++) {\n        for (int i = 0; i < n; i++) cout << a[i][j] << ' ';\n        cout << '\\n';\n    }\n    return 0;\n}`
    },
    {
        title: 'Sortare prin selecție',
        chapter: 'sortare',
        difficulty: 'începător',
        tags: 'sortare selection sort vector',
        description: 'Alege minimul din partea nesortată și schimbă-l cu prima poziție liberă.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, a[100];\n    cin >> n;\n    for (int i = 0; i < n; i++) cin >> a[i];\n    for (int i = 0; i < n - 1; i++) {\n        int pozMin = i;\n        for (int j = i + 1; j < n; j++)\n            if (a[j] < a[pozMin]) pozMin = j;\n        swap(a[i], a[pozMin]);\n    }\n    for (int i = 0; i < n; i++) cout << a[i] << ' ';\n    return 0;\n}`
    },
    {
        title: 'Căutare binară',
        chapter: 'sortare',
        difficulty: 'intermediar',
        tags: 'cautare binara vector sortat',
        description: 'Găsește eficient o valoare într-un vector sortat în O(log n).',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, x, a[100];\n    cin >> n;\n    for (int i = 0; i < n; i++) cin >> a[i];\n    cin >> x;\n    int st = 0, dr = n - 1, poz = -1;\n    while (st <= dr) {\n        int mij = (st + dr) / 2;\n        if (a[mij] == x) { poz = mij; break; }\n        if (a[mij] < x) st = mij + 1;\n        else dr = mij - 1;\n    }\n    cout << poz;\n    return 0;\n}`
    },
    {
        title: 'Suma de la 1 la n prin recursivitate',
        chapter: 'recursivitate',
        difficulty: 'începător',
        tags: 'recursivitate functie suma',
        description: 'Definește problema printr-un caz de bază și o problemă mai mică.',
        code: `#include <iostream>\nusing namespace std;\n\nint suma(int n) {\n    if (n == 0) return 0;\n    return n + suma(n - 1);\n}\n\nint main() {\n    int n; cin >> n;\n    cout << suma(n);\n    return 0;\n}`
    },
    {
        title: 'Permutări prin backtracking',
        chapter: 'recursivitate',
        difficulty: 'avansat',
        tags: 'backtracking permutari recursivitate',
        description: 'Generează toate permutările numerelor de la 1 la n.',
        code: `#include <iostream>\nusing namespace std;\n\nint n, p[10]; bool folosit[10];\nvoid back(int k) {\n    if (k > n) {\n        for (int i = 1; i <= n; i++) cout << p[i] << ' ';\n        cout << '\\n';\n        return;\n    }\n    for (int x = 1; x <= n; x++) {\n        if (!folosit[x]) {\n            folosit[x] = true; p[k] = x;\n            back(k + 1);\n            folosit[x] = false;\n        }\n    }\n}\nint main() { cin >> n; back(1); }`
    },
    {
        title: 'Conversie din baza 10 în baza 2',
        chapter: 'numere',
        difficulty: 'începător',
        tags: 'conversie baza binar numere',
        description: 'Construiește reprezentarea în baza 2 prin împărțiri succesive.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, cifre[32], k = 0;\n    cin >> n;\n    if (n == 0) { cout << 0; return 0; }\n    while (n > 0) { cifre[k++] = n % 2; n /= 2; }\n    while (k--) cout << cifre[k];\n    return 0;\n}`
    },
    {
        title: 'Conversie din baza b în baza 10',
        chapter: 'numere',
        difficulty: 'intermediar',
        tags: 'conversie baza numar polinom',
        description: 'Calculează valoarea unui număr într-o bază folosind schema Horner.',
        code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int b, n, rezultat = 0;\n    cin >> b >> n;\n    while (n > 0) {\n        rezultat = rezultat * b + n % 10;\n        n /= 10;\n    }\n    cout << rezultat;\n    return 0;\n}`
    },
    {
        title: 'Structură pentru elevi și medie',
        chapter: 'structuri',
        difficulty: 'începător',
        tags: 'structuri obiecte elev medie',
        description: 'Grupează datele unui elev și calculează media notelor sale.',
        code: `#include <iostream>\n#include <string>\nusing namespace std;\nstruct Elev { string nume; double nota1, nota2; };\nint main() {\n    Elev elev; cin >> elev.nume >> elev.nota1 >> elev.nota2;\n    cout << elev.nume << " " << (elev.nota1 + elev.nota2) / 2;\n    return 0;\n}`
    },
    {
        title: 'Sortare obiecte după medie',
        chapter: 'structuri',
        difficulty: 'intermediar',
        tags: 'structuri obiecte sortare medie',
        description: 'Sortează o colecție de obiecte după un câmp calculat.',
        code: `#include <iostream>\n#include <string>\nusing namespace std;\nstruct Elev { string nume; double medie; };\nint main() {\n    int n; Elev e[50]; cin >> n;\n    for (int i = 0; i < n; i++) cin >> e[i].nume >> e[i].medie;\n    for (int i = 0; i < n - 1; i++)\n        for (int j = i + 1; j < n; j++)\n            if (e[i].medie < e[j].medie) swap(e[i], e[j]);\n    for (int i = 0; i < n; i++) cout << e[i].nume << ' ' << e[i].medie << '\\n';\n}`
    },
    {
        title: 'Parcurgere BFS într-un graf',
        chapter: 'grafuri',
        difficulty: 'intermediar',
        tags: 'grafuri bfs coada parcurgere',
        description: 'Vizitează nivel cu nivel nodurile accesibile dintr-un graf.',
        code: `#include <iostream>\n#include <queue>\nusing namespace std;\nint main() {\n    int n, m, a[20][20] = {}; cin >> n >> m;\n    for (int i = 0; i < m; i++) { int x, y; cin >> x >> y; a[x][y] = a[y][x] = 1; }\n    int start; cin >> start; bool viz[20] = {}; queue<int> q;\n    q.push(start); viz[start] = true;\n    while (!q.empty()) {\n        int nod = q.front(); q.pop(); cout << nod << ' ';\n        for (int vecin = 1; vecin <= n; vecin++)\n            if (a[nod][vecin] && !viz[vecin]) { viz[vecin] = true; q.push(vecin); }\n    }\n}`
    },
    {
        title: 'Parcurgere DFS într-un graf',
        chapter: 'grafuri',
        difficulty: 'intermediar',
        tags: 'grafuri dfs recursivitate parcurgere',
        description: 'Explorează recursiv fiecare ramură înainte de a reveni.',
        code: `#include <iostream>\nusing namespace std;\nint n, a[20][20]; bool viz[20];\nvoid dfs(int nod) {\n    viz[nod] = true; cout << nod << ' ';\n    for (int vecin = 1; vecin <= n; vecin++)\n        if (a[nod][vecin] && !viz[vecin]) dfs(vecin);\n}\nint main() {\n    int m; cin >> n >> m;\n    for (int i = 0; i < m; i++) { int x, y; cin >> x >> y; a[x][y] = a[y][x] = 1; }\n    int start; cin >> start; dfs(start);\n}`
    },
    {
        title: 'Drum minim pe graf neponderat',
        chapter: 'grafuri',
        difficulty: 'avansat',
        tags: 'grafuri bfs drum minim distante',
        description: 'Folosește BFS pentru a calcula distanța minimă de la o sursă.',
        code: `#include <iostream>\n#include <queue>\nusing namespace std;\nint main() {\n    int n, m, a[30][30] = {}; cin >> n >> m;\n    for (int i = 0; i < m; i++) { int x, y; cin >> x >> y; a[x][y] = a[y][x] = 1; }\n    int start; cin >> start; int dist[30];\n    for (int i = 1; i <= n; i++) dist[i] = -1;\n    queue<int> q; q.push(start); dist[start] = 0;\n    while (!q.empty()) {\n        int nod = q.front(); q.pop();\n        for (int v = 1; v <= n; v++) if (a[nod][v] && dist[v] == -1) { dist[v] = dist[nod] + 1; q.push(v); }\n    }\n    for (int i = 1; i <= n; i++) cout << i << ": " << dist[i] << '\\n';\n}`
    }
    ,
    {
        title: 'Verificarea unui număr prim',
        chapter: 'elementar',
        difficulty: 'începător',
        tags: 'numar prim divizori primalitate',
        description: 'Verifică divizorii până la rădăcina pătrată a numărului.',
        code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n; bool prim = n >= 2;\n    for (int d = 2; d * d <= n; d++)\n        if (n % d == 0) prim = false;\n    cout << (prim ? "DA" : "NU");\n}`
    },
    {
        title: 'Ciurul lui Eratostene',
        chapter: 'elementar',
        difficulty: 'intermediar',
        tags: 'ciur eratostene numere prime',
        description: 'Marchează multiplii pentru a genera rapid numerele prime.',
        code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n; bool prim[1001];\n    for (int i = 2; i <= n; i++) prim[i] = true;\n    for (int p = 2; p * p <= n; p++) if (prim[p])\n        for (int multiplu = p * p; multiplu <= n; multiplu += p) prim[multiplu] = false;\n    for (int i = 2; i <= n; i++) if (prim[i]) cout << i << ' ';\n}`
    },
    {
        title: 'Sortare prin metoda bulelor',
        chapter: 'sortare',
        difficulty: 'începător',
        tags: 'sortare bubble sort vector',
        description: 'Compară vecinii și repetă schimburile până când vectorul este sortat.',
        code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n, a[100]; cin >> n;\n    for (int i = 0; i < n; i++) cin >> a[i];\n    for (int limita = n - 1; limita > 0; limita--)\n        for (int i = 0; i < limita; i++)\n            if (a[i] > a[i + 1]) swap(a[i], a[i + 1]);\n    for (int i = 0; i < n; i++) cout << a[i] << ' ';\n}`
    },
    {
        title: 'Interclasarea a doi vectori sortați',
        chapter: 'sortare',
        difficulty: 'intermediar',
        tags: 'interclasare vectori sortati merge',
        description: 'Unește doi vectori sortați într-un singur vector sortat.',
        code: `#include <iostream>\nusing namespace std;\nint main() {\n    int n, m, a[50], b[50], c[100]; cin >> n;\n    for (int i = 0; i < n; i++) cin >> a[i];\n    cin >> m; for (int i = 0; i < m; i++) cin >> b[i];\n    int i = 0, j = 0, k = 0;\n    while (i < n && j < m) c[k++] = a[i] < b[j] ? a[i++] : b[j++];\n    while (i < n) c[k++] = a[i++];\n    while (j < m) c[k++] = b[j++];\n    for (int p = 0; p < k; p++) cout << c[p] << ' ';\n}`
    },
    {
        title: 'Submulțimi prin backtracking',
        chapter: 'recursivitate',
        difficulty: 'avansat',
        tags: 'backtracking submultimi combinari recursivitate',
        description: 'Generează toate submulțimile unei mulțimi de n elemente.',
        code: `#include <iostream>\nusing namespace std;\nint n, x[10];\nvoid back(int k) {\n    if (k > n) {\n        for (int i = 1; i <= n; i++) if (x[i]) cout << i << ' ';\n        cout << '\\n'; return;\n    }\n    x[k] = 0; back(k + 1);\n    x[k] = 1; back(k + 1);\n}\nint main() { cin >> n; back(1); }`
    }
];

const examples = {
    'Suma cifrelor unui număr': ['2026', '10'],
    'Cel mai mare divizor comun': ['84 30', '6'],
    'Frecvența valorilor din vector': ['7 2 1 2 3 2 1 3', '1: 2\\n2: 3\\n3: 2'],
    'Transpunerea unei matrice': ['2 3\\n1 2 3\\n4 5 6', '1 4\\n2 5\\n3 6'],
    'Sortare prin selecție': ['5\\n7 2 9 1 4', '1 2 4 7 9'],
    'Căutare binară': ['6\\n1 4 7 9 12 20\\n12', '4'],
    'Suma de la 1 la n prin recursivitate': ['10', '55'],
    'Permutări prin backtracking': ['3', '1 2 3\\n1 3 2\\n2 1 3\\n2 3 1\\n3 1 2\\n3 2 1'],
    'Conversie din baza 10 în baza 2': ['13', '1101'],
    'Conversie din baza b în baza 10': ['2 1101', '13'],
    'Structură pentru elevi și medie': ['Ana 9 10', 'Ana 9.5'],
    'Sortare obiecte după medie': ['3\\nAna 9.50\\nMihai 8.75\\nIoana 10', 'Ioana 10\\nAna 9.5\\nMihai 8.75'],
    'Parcurgere BFS într-un graf': ['5 5\\n1 2\\n1 3\\n2 4\\n3 5\\n4 5\\n1', '1 2 3 4 5'],
    'Parcurgere DFS într-un graf': ['5 5\\n1 2\\n1 3\\n2 4\\n3 5\\n4 5\\n1', '1 2 4 5 3'],
    'Drum minim pe graf neponderat': ['4 4\\n1 2\\n1 3\\n2 4\\n3 4\\n1', '1: 0\\n2: 1\\n3: 1\\n4: 2'],
    'Verificarea unui număr prim': ['97', 'DA'],
    'Ciurul lui Eratostene': ['20', '2 3 5 7 11 13 17 19'],
    'Sortare prin metoda bulelor': ['5\\n5 1 4 2 8', '1 2 4 5 8'],
    'Interclasarea a doi vectori sortați': ['4\\n1 4 8 12\\n3\\n2 5 10', '1 2 4 5 8 10 12'],
    'Submulțimi prin backtracking': ['3', '\\n3\\n2\\n2 3\\n1\\n1 3\\n1 2\\n1 2 3']
};

const algorithmGrid = document.getElementById('algorithm-grid');
const algorithmSearch = document.getElementById('algorithm-search');
const chapterFilter = document.getElementById('algorithm-chapter');
const difficultyFilter = document.getElementById('algorithm-difficulty');
const algorithmEmpty = document.getElementById('algorithm-empty');
const editor = document.getElementById('code');
const language = document.getElementById('language');
const compilerWorkspace = document.getElementById('compiler-workspace');
const backToAlgorithms = document.getElementById('back-to-algorithms');
const selectedDescription = document.getElementById('selected-algorithm-description');
const exampleInput = document.getElementById('example-input');
const exampleOutput = document.getElementById('example-output');
const graphVisualization = document.getElementById('graph-visualization');
const graphCanvas = document.getElementById('graph-canvas');
let selectedGraph = null;

function normalizeExample(value) {
    return value.replaceAll('\\n', '\n');
}

function drawGraph(input, activeNodes = []) {
    if (!graphCanvas || !graphVisualization) {
        return;
    }

    const lines = normalizeExample(input).trim().split(/\s+/).map(Number);
    const nodeCount = lines[0];
    const edgeCount = lines[1];
    if (!Number.isInteger(nodeCount) || !Number.isInteger(edgeCount) || nodeCount < 1 || nodeCount > 30) {
        return;
    }

    const edges = [];
    let cursor = 2;
    for (let index = 0; index < edgeCount; index++) {
        const from = lines[cursor++];
        const to = lines[cursor++];
        if (from && to) edges.push([from, to]);
    }

    const centerX = 360;
    const centerY = 180;
    const radius = Math.min(135, 42 + nodeCount * 6);
    const positions = new Map();
    for (let node = 1; node <= nodeCount; node++) {
        const angle = ((node - 1) / nodeCount) * Math.PI * 2 - Math.PI / 2;
        positions.set(node, {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        });
    }

    graphCanvas.replaceChildren();
    edges.forEach(([from, to]) => {
        const start = positions.get(from);
        const end = positions.get(to);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', start.x);
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', end.x);
        line.setAttribute('y2', end.y);
        line.classList.add('graph-edge');
        if (activeNodes.includes(from) && activeNodes.includes(to)) line.classList.add('active');
        graphCanvas.appendChild(line);
    });

    positions.forEach(({ x, y }, node) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 24);
        circle.classList.add('graph-node');
        if (activeNodes.includes(node)) circle.style.fill = '#0891b2';
        graphCanvas.appendChild(circle);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.classList.add('graph-node-label');
        label.textContent = node;
        graphCanvas.appendChild(label);
    });

    graphVisualization.classList.remove('hidden');
}

function selectAlgorithm(algorithm) {
    const [rawInput, rawOutput] = examples[algorithm.title] || ['', 'Rulează programul pentru a vedea rezultatul.'];
    const input = normalizeExample(rawInput);
    const output = normalizeExample(rawOutput);
    editor.value = algorithm.code;
    language.value = 'cpp';
    document.getElementById('code-label').textContent = 'Cod sursa C++:';
    document.getElementById('stdin').value = input;
    selectedDescription.textContent = algorithm.description;
    exampleInput.textContent = input;
    exampleOutput.textContent = output;
    compilerWorkspace.classList.remove('hidden');
    compilerWorkspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    selectedGraph = algorithm.chapter === 'grafuri' ? input : null;
    if (selectedGraph) drawGraph(selectedGraph);
    else graphVisualization?.classList.add('hidden');
}

function hideCompiler() {
    compilerWorkspace.classList.add('hidden');
    document.getElementById('algorithm-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAlgorithms() {
    const query = algorithmSearch.value.trim().toLocaleLowerCase('ro');
    const chapter = chapterFilter.value;
    const difficulty = difficultyFilter.value;
    const visible = algorithms.filter((algorithm) => {
        const searchable = `${algorithm.title} ${algorithm.tags} ${algorithm.description}`.toLocaleLowerCase('ro');
        return (!query || searchable.includes(query)) &&
            (chapter === 'all' || algorithm.chapter === chapter) &&
            (difficulty === 'all' || algorithm.difficulty === difficulty);
    });

    algorithmGrid.innerHTML = visible.map((algorithm) => {
        const [rawInput, rawOutput] = examples[algorithm.title] || ['', 'Disponibil după rulare.'];
        const input = normalizeExample(rawInput);
        const output = normalizeExample(rawOutput);
        return `
        <article class="algorithm-card">
            <div class="algorithm-card-topline">
                <span class="resource-type">${algorithm.chapter}</span>
                <span class="difficulty difficulty-${algorithm.difficulty}">${algorithm.difficulty}</span>
            </div>
            <h3>${algorithm.title}</h3>
            <p>${algorithm.description}</p>
            <div class="algorithm-example"><span>Exemplu: </span><code>${input.replaceAll('\n', ' · ')}</code><strong>→ ${output.replaceAll('\n', ' · ')}</strong></div>
            <button class="btn btn-small" type="button" data-algorithm-index="${algorithms.indexOf(algorithm)}">Alege algoritmul</button>
        </article>
    `;
    }).join('');

    algorithmEmpty.classList.toggle('hidden', visible.length !== 0);
    algorithmGrid.querySelectorAll('[data-algorithm-index]').forEach((button) => {
        button.addEventListener('click', () => {
            const algorithm = algorithms[Number(button.dataset.algorithmIndex)];
            selectAlgorithm(algorithm);
        });
    });
}

[algorithmSearch, chapterFilter, difficultyFilter].forEach((control) => control.addEventListener('input', renderAlgorithms));
backToAlgorithms.addEventListener('click', hideCompiler);
renderAlgorithms();

window.addEventListener('compiler:run', (event) => {
    if (!selectedGraph) return;
    const output = event.detail?.stdout || '';
    const activeNodes = output.match(/\d+/g)?.map(Number) || [];
    drawGraph(selectedGraph, activeNodes);
});
