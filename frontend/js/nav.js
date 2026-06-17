// nav.js - navigarea aplicatiei (meniul lateral). Pur vizual: arata/ascunde
// vederile si actualizeaza titlul din bara de sus. Nu apeleaza microserviciile.
(function () {
  const navLinks = document.querySelectorAll('#mainNav .nav-link');
  const views = document.querySelectorAll('.view');
  const viewTitle = document.getElementById('viewTitle');
  const viewSubtitle = document.getElementById('viewSubtitle');
  const stepBadge = document.getElementById('stepBadge');

  // Metadate pentru fiecare vedere: titlu, subtitlu (pasul din flux) si pozitia.
  const meta = {
    'view-account': {
      title: 'Contul meu',
      subtitle: 'Datele contului tău',
      step: '',
    },
    'view-pets': {
      title: 'Animalele mele',
      subtitle: 'Pasul 1 · Adaugă animalele tale',
      step: 'Pasul 1 / 3',
    },
    'view-reminders': {
      title: 'Remindere',
      subtitle: 'Pasul 2 · Programează o activitate (generează automat o notificare)',
      step: 'Pasul 2 / 3',
    },
    'view-notifications': {
      title: 'Notificări',
      subtitle: 'Pasul 3 · Vezi alertele generate din remindere',
      step: 'Pasul 3 / 3',
    },
  };

  // Comuta la vederea ceruta si actualizeaza interfata.
  const showView = (viewId) => {
    views.forEach((v) => v.classList.toggle('active', v.id === viewId));
    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.view === viewId));

    // Pe pagina de cont ascundem bara de sus (titlu/subtitlu) - nu e necesara.
    document.body.classList.toggle('hide-topbar', viewId === 'view-account');

    const info = meta[viewId];
    if (info) {
      viewTitle.textContent = info.title;
      viewSubtitle.textContent = info.subtitle;
      stepBadge.textContent = info.step;
      // Ascundem complet badge-ul cand nu are continut (ex: pagina de cont).
      stepBadge.hidden = !info.step;
    }

    // Derulare in sus la schimbarea vederii (util pe ecrane mici).
    const content = document.querySelector('.content');
    if (content) {
      content.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => showView(link.dataset.view));
  });

  // Stare initiala: vederea marcata `active` in HTML (implicit contul meu).
  const initial = document.querySelector('.view.active');
  if (initial) {
    document.body.classList.toggle('hide-topbar', initial.id === 'view-account');
  }
})();
