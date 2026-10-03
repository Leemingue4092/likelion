function renderMath(root) {
  if (typeof renderMathInElement !== 'function') return;
  renderMathInElement(root || document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\(', right: '\\)', display: false }
    ],
    throwOnError: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  });
}

window.renderMath = renderMath;

function bootPage() {
  renderMath(document.body);

  document.querySelectorAll('.answer-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.nextElementSibling;
      if (!target) return;
      const open = target.classList.toggle('open');
      btn.textContent = open ? '해설 닫기' : '해설 보기';
    });
  });

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
    if (href === 'problems.html' && path.startsWith('problems')) a.classList.add('active');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPage);
} else {
  bootPage();
}
