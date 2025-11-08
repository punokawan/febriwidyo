// Tabs logic: accessible toggling
const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
const sections = {
  links: document.getElementById('links'),
  portfolio: document.getElementById('portfolio'),
  experience: document.getElementById('experience')
};

function setActive(name) {
  Object.keys(sections).forEach(key => {
    const active = key === name;
    sections[key].classList.toggle('is-active', active);
    sections[key].hidden = !active;
  });
  tabButtons.forEach(btn => {
    const active = btn.dataset.target === name;
    btn.setAttribute('aria-selected', String(active));
  });
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => setActive(btn.dataset.target));
});

// Default state
setActive('experience');

// Keyboard support: ArrowLeft/ArrowRight to switch tabs
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const idx = tabButtons.findIndex(b => b.getAttribute('aria-selected') === 'true');
  let next = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
  if (next < 0) next = tabButtons.length - 1;
  if (next >= tabButtons.length) next = 0;
  const target = tabButtons[next].dataset.target;
  setActive(target);
  tabButtons[next].focus();
});

// Copy-to-clipboard for any element with [data-copy]
document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const text = el.getAttribute('data-copy');
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const desc = el.querySelector('.desc');
      const prev = desc ? desc.textContent : '';
      if (desc) {
        desc.textContent = 'Copied!';
        setTimeout(() => { desc.textContent = prev; }, 1500);
      }
    }).catch(() => {
      const desc = el.querySelector('.desc');
      if (desc) desc.textContent = 'Copy failed';
    });
  });
});

// Contextual highlight: emphasize Tokopedia paper link when Tokopedia is in view or targeted
const tokopedia = document.getElementById('tokopedia');
const tokopediaPaper = tokopedia ? tokopedia.querySelector('.paper-link') : null;
if (tokopedia && tokopediaPaper) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      tokopediaPaper.classList.toggle('is-highlighted', entry.isIntersecting);
    });
  }, { threshold: 0.5 });
  observer.observe(tokopedia);

  const checkHash = () => {
    tokopediaPaper.classList.toggle('is-highlighted', location.hash === '#tokopedia');
  };
  window.addEventListener('hashchange', checkHash);
  checkHash();
}

// Removed exp-details toggle logic; bullets are shown directly