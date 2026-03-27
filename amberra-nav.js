// ═══ AMBERRA MULTIPAGE NAVIGATION ══════════════════════
// Загружается в <head> — только навигация, без зависимостей
const PAGES = {
  home:    'index.html',
  catalog: 'catalog.html',
  journal: 'journal.html',
  about:   'about.html',
  tryon:   'tryon.html',
  contact: 'contact.html',
};

function goTo(page) {
  const url = PAGES[page];
  if (!url) return;
  const cur = window.location.pathname.split('/').pop() || 'index.html';
  if (cur === url) { window.scrollTo({top:0,behavior:'smooth'}); return; }
  document.body.style.transition = 'opacity .18s ease';
  document.body.style.opacity = '0';
  setTimeout(() => { window.location.href = url; }, 160);
}

function setActiveNav() {
  const cur = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active', PAGES[el.dataset.page] === cur);
  });
}

// s() для scroll внутри страницы — безопасно переопределить позже
function s(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({behavior:'smooth'});
}

// Fade-in при загрузке
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.transition = 'opacity .28s ease';
  document.body.style.opacity = '1';
  setActiveNav();
  // Восстанавливаем язык
  const lang = localStorage.getItem('amb_lang') || 'en';
  if (lang !== 'en' && typeof setLang === 'function') setLang(lang, true);
  // Инициализация страницы
  if (typeof initPage === 'function') initPage();
});
