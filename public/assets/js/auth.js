const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const authMessage = document.getElementById('auth-message');
const authShell = document.querySelector('.auth-shell');
const accountPanel = document.getElementById('account-panel');

function showMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle('error', isError);
}

function showServerUnavailableMessage() {
    if (window.location.protocol === 'file:') {
        showMessage('Deschide platforma prin http://localhost:3000, nu direct prin fisierul HTML. Porneste serverul cu npm.cmd start.', true);
        return;
    }

    showMessage('Serverul nu raspunde. Verifica terminalul si porneste aplicatia cu npm.cmd start, apoi reincarca pagina.', true);
}

function showForm(formName) {
    const showLogin = formName === 'login';
    loginForm.classList.toggle('hidden', !showLogin);
    registerForm.classList.toggle('hidden', showLogin);
    loginTab.classList.toggle('active', showLogin);
    registerTab.classList.toggle('active', !showLogin);
    loginTab.setAttribute('aria-selected', String(showLogin));
    registerTab.setAttribute('aria-selected', String(!showLogin));
    showMessage('');
}

function renderAccount(user) {
    if (!user) {
        authShell.classList.remove('hidden');
        accountPanel.classList.add('hidden');
        return;
    }

    authShell.classList.add('hidden');
    accountPanel.classList.remove('hidden');
    document.getElementById('account-name').textContent = user.name;
    document.getElementById('account-email').textContent = user.email;
    document.getElementById('account-role').textContent = user.role === 'voluntar' ? 'Voluntar' : 'Elev';
    document.getElementById('account-credits').textContent = user.credits || 0;
    document.getElementById('student-progress').classList.toggle('hidden', user.role !== 'elev');
    if (user.role === 'elev') {
        loadProgress();
    }
}

async function loadProgress() {
    const response = await fetch('/api/progress', { credentials: 'same-origin' });
    if (!response.ok) return;
    const progress = await response.json();
    const percent = progress.totalLessons ? Math.min(100, Math.round((progress.lessonsLearnt / progress.totalLessons) * 100)) : 0;
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('lessons-learnt').textContent = progress.lessonsLearnt;
    document.getElementById('exercises-solved').textContent = progress.exercisesSolved;
    document.getElementById('hours-spent').textContent = progress.hoursSpent;
}

async function submitAuth(endpoint, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showMessage('Se procesează...');

    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'A apărut o eroare.');
        }
        renderAccount(result.user);
    } catch (error) {
        showMessage(error.message || 'Cererea nu a putut fi trimisa.', true);
    } finally {
        submitButton.disabled = false;
    }
}

loginTab.addEventListener('click', () => showForm('login'));
registerTab.addEventListener('click', () => showForm('register'));
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAuth('login', loginForm);
});
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAuth('register', registerForm);
});
document.getElementById('logout-button').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    renderAccount(null);
    showForm('login');
});

const params = new URLSearchParams(window.location.search);
if (params.get('mode') === 'register') {
    showForm('register');
    if (params.get('role') === 'voluntar') {
        document.getElementById('register-role').value = 'voluntar';
    }
}

if (window.location.protocol === 'file:') {
    showServerUnavailableMessage();
} else {
    fetch('/api/me', { credentials: 'same-origin' })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then((result) => renderAccount(result.user))
    .catch(showServerUnavailableMessage);
}
