const compilerConfig = {
    c: {
        label: 'C',
        languageId: 50
    },
    cpp: {
        label: 'C++',
        languageId: 54
    }
};

const defaultCode = {
    c: `#include <stdio.h>

int main(void) {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("Suma este: %d\\n", a + b);
    } else {
        printf("Introdu doua numere in caseta de intrare.\\n");
    }
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << "Suma este: " << a + b << endl;
    } else {
        cout << "Introdu doua numere in caseta de intrare." << endl;
    }
    return 0;
}`
};

const codeEditor = document.getElementById('code');
const languageSelect = document.getElementById('language');
const runButton = document.getElementById('run-code');
const clearOutputButton = document.getElementById('clear-output');
const outputBox = document.getElementById('output');

if (codeEditor && languageSelect && runButton && outputBox) {

function setOutput(message, isError = false) {
    outputBox.textContent = message;
    outputBox.classList.toggle('error', isError);
}

function updateLanguage() {
    const language = languageSelect.value;
    const config = compilerConfig[language];

    document.getElementById('code-label').textContent = `Cod sursa ${config.label}:`;
    codeEditor.value = defaultCode[language];
}

function formatCompilerResult(result) {
    const compileOutput = result.compile_output?.trim();
    const runOutput = result.stdout?.trim();
    const errorOutput = result.stderr?.trim();
    const status = result.status?.id;

    if (status === 6 || compileOutput) {
        return `Eroare de compilare:\n${compileOutput || 'Compilatorul a returnat o eroare fara detalii.'}`;
    }

    if (status !== 3) {
        const details = errorOutput || result.message || runOutput;
        return `Eroare la executare${status ? ` (status ${status})` : ''}:\n${details || 'Programul s-a oprit fara mesaje.'}`;
    }

    return runOutput || 'Programul s-a executat fara afisaj.';
}

async function runCode() {
    const language = languageSelect.value;
    const config = compilerConfig[language];
    const code = codeEditor.value;
    const stdin = document.getElementById('stdin').value;

    runButton.disabled = true;
    setOutput(`Se compileaza si se executa codul ${config.label}...`);

    try {
        const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language_id: config.languageId,
                source_code: code,
                stdin,
                cpu_time_limit: 3,
                wall_time_limit: 5
            })
        });

        const result = await response.json();

        if (!response.ok) {
            const message = result.message || result.error || `Serverul a returnat HTTP ${response.status}.`;
            throw new Error(message);
        }

        setOutput(formatCompilerResult(result), result.status?.id !== 3);
        window.dispatchEvent(new CustomEvent('compiler:run', { detail: result }));
    } catch (error) {
        setOutput(`Eroare de conexiune la serverul de compilare:\n${error.message}`, true);
    } finally {
        runButton.disabled = false;
    }
}

languageSelect.addEventListener('change', updateLanguage);
runButton.addEventListener('click', runCode);
clearOutputButton?.addEventListener('click', () => setOutput('Rezultatul execuției va apărea aici...'));
codeEditor.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runCode();
    }
});
}
