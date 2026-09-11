const lessonSearch = document.getElementById('lesson-search');
const lessonItems = [...document.querySelectorAll('[data-lesson]')];
const lessonCount = document.getElementById('lesson-count');

function updateLessonResults() {
    const query = lessonSearch.value.trim().toLocaleLowerCase('ro');
    let visibleCount = 0;

    lessonItems.forEach((lesson) => {
        const matches = !query || lesson.dataset.lesson.includes(query);
        lesson.hidden = !matches;
        if (matches) {
            visibleCount += 1;
        }
    });

    lessonCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'lecție găsită' : 'lecții găsite'}`;
}

lessonSearch.addEventListener('input', updateLessonResults);
updateLessonResults();
