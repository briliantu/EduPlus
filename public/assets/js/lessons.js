const lessonSearch = document.getElementById('lesson-search');
const lessonItems = [...document.querySelectorAll('[data-lesson]')];
const lessonCount = document.getElementById('lesson-count');
const lessonLibrary = document.getElementById('lesson-library');
const volunteerPanel = document.getElementById('volunteer-panel');
const lessonForm = document.getElementById('lesson-form');
const practicePanel = document.getElementById('practice-panel');
let currentUser = null;
let lessons = [];

function updateLessonResults() {
    const query = lessonSearch.value.trim().toLocaleLowerCase('ro');
    let visibleCount = 0;
    lessonItems.forEach((lesson) => {
        const matches = !query || lesson.dataset.lesson.includes(query);
        lesson.hidden = !matches;
        if (matches) visibleCount += 1;
    });
    lessonCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'lecție găsită' : 'lecții găsite'}`;
    document.querySelectorAll('.lesson-library article').forEach((lesson) => {
        lesson.hidden = Boolean(query) && !lesson.dataset.search.includes(query);
    });
}

function createText(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
}

function renderLibrary() {
    lessonLibrary.replaceChildren();
    lessons.forEach((lesson) => {
        const card = document.createElement('article');
        card.className = 'community-lesson';
        card.dataset.search = `${lesson.title} ${lesson.subject} ${lesson.summary}`.toLocaleLowerCase('ro');
        card.append(createText('span', 'badge', lesson.subject));
        card.append(createText('h3', '', lesson.title));
        card.append(createText('p', 'compiler-help', lesson.summary));
        card.append(createText('p', 'lesson-author', `Creată de ${lesson.author}`));
        const actions = createText('div', 'lesson-actions', '');
        if (currentUser?.role === 'elev') {
            const saveButton = createText('button', 'btn btn-outline', lesson.saved ? '★ Salvată' : '☆ Salvează');
            saveButton.type = 'button';
            saveButton.addEventListener('click', async () => {
                const response = await fetch(`/api/lessons/${lesson.id}/save`, { method: 'POST', credentials: 'same-origin' });
                if (response.ok) {
                    lesson.saved = (await response.json()).saved;
                    renderLibrary();
                }
            });
            actions.append(saveButton);
            const practiceButton = createText('button', 'btn', 'Intră în mini-practică');
            practiceButton.type = 'button';
            practiceButton.addEventListener('click', () => openPractice(lesson));
            actions.append(practiceButton);
        } else if (!currentUser) {
            actions.append(createText('span', 'compiler-help', 'Autentifică-te pentru a salva și exersa'));
        }
        card.append(actions);
        lessonLibrary.append(card);
    });
    updateLessonResults();
}

function openPractice(lesson) {
    practicePanel.classList.remove('hidden');
    document.getElementById('practice-title').textContent = lesson.title;
    document.getElementById('practice-content').textContent = lesson.content;
    document.getElementById('practice-message').textContent = '';
    const exercises = document.getElementById('practice-exercises');
    exercises.replaceChildren();
    lesson.exercises.forEach((exercise, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'practice-exercise';
        wrapper.append(createText('h3', '', `${index + 1}. ${exercise.question}`));
        if (exercise.options) {
            const select = document.createElement('select');
            select.append(createText('option', '', 'Alege un răspuns'));
            exercise.options.forEach((option) => {
                const choice = createText('option', '', option);
                choice.value = option;
                select.append(choice);
            });
            wrapper.append(select);
        } else {
            const input = document.createElement('input');
            input.placeholder = 'Răspunsul tău';
            wrapper.append(input);
        }
        const button = createText('button', 'btn btn-outline', 'Verifică');
        button.type = 'button';
        button.addEventListener('click', async () => {
            const answerControl = wrapper.querySelector('select, input');
            const response = await fetch(`/api/lessons/${lesson.id}/attempt`, {
                method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseIndex: index, answer: answerControl.value, minutesSpent: 2 })
            });
            const result = await response.json();
            document.getElementById('practice-message').textContent = response.ok
                ? (result.correct ? (result.completed ? 'Felicitări! Ai încheiat această mini-practică.' : 'Corect. Continuă cu următorul exercițiu.') : 'Mai încearcă. Recitește explicația și verifică pașii.')
                : result.message;
            if (result.correct) button.disabled = true;
            if (result.completed) loadProgress();
        });
        wrapper.append(button);
        exercises.append(wrapper);
    });
    practicePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadProgress() {
    if (!currentUser || currentUser.role !== 'elev') return;
    const response = await fetch('/api/progress', { credentials: 'same-origin' });
    if (!response.ok) return;
    const progress = await response.json();
    document.getElementById('progress-summary').textContent = `${progress.lessonsLearnt}/${progress.totalLessons} lecții finalizate`;
}

async function loadLessons() {
    const [lessonsResponse, meResponse] = await Promise.all([
        fetch('/api/lessons'), fetch('/api/me', { credentials: 'same-origin' })
    ]);
    lessons = (await lessonsResponse.json()).lessons;
    currentUser = (await meResponse.json()).user;
    volunteerPanel.classList.toggle('hidden', currentUser?.role !== 'voluntar');
    renderLibrary();
    loadProgress();
}

lessonSearch.addEventListener('input', updateLessonResults);
document.getElementById('close-practice').addEventListener('click', () => practicePanel.classList.add('hidden'));
lessonForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(lessonForm);
    const exercises = [1, 2, 3].map((number) => ({
        type: 'text', question: formData.get(`question-${number}`), answer: formData.get(`answer-${number}`)
    })).filter((exercise) => exercise.question && exercise.answer);
    const payload = Object.fromEntries(formData);
    payload.exercises = exercises;
    const response = await fetch('/api/lessons', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    const message = document.getElementById('lesson-form-message');
    message.textContent = response.ok ? `Lecția a fost publicată. Ai acum ${result.credits} credite.` : result.message;
    message.classList.toggle('error', !response.ok);
    if (response.ok) {
        lessonForm.reset();
        await loadLessons();
    }
});

loadLessons().catch(() => {
    lessonLibrary.append(createText('p', 'form-message error', 'Lecțiile nu au putut fi încărcate.'));
});
