const accountSlot = document.querySelector('.account-nav-slot');

function renderAccountNavigation(user) {
    if (!accountSlot || !user) {
        return;
    }

    const roleLabel = user.role === 'voluntar' ? 'Voluntar' : 'Elev';
    const accountLink = document.createElement('a');
    accountLink.href = window.location.pathname.includes('/pages/') ? 'auth.html' : 'pages/auth.html';
    accountLink.className = 'account-menu';
    accountLink.setAttribute('aria-label', `Contul lui ${user.name}`);

    const icon = document.createElement('span');
    icon.className = 'account-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = user.name.charAt(0).toUpperCase();

    const copy = document.createElement('span');
    copy.className = 'account-copy';
    const name = document.createElement('strong');
    name.textContent = user.name;
    const role = document.createElement('small');
    role.textContent = roleLabel;
    copy.append(name, role);
    accountLink.append(icon, copy);
    accountSlot.replaceChildren(accountLink);
}

if (window.location.protocol !== 'file:') {
    fetch('/api/me', { credentials: 'same-origin' })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('Account request failed')))
        .then((result) => renderAccountNavigation(result.user))
        .catch(() => {});
}
