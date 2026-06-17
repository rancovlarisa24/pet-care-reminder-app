// app.js - logica frontend-ului. Toate cererile trec prin Nginx la /api/...,
// care le redirecționează către microserviciul potrivit. Fiecare cerere include
// token-ul JWT (din auth.js), astfel încât userul vede DOAR datele lui.
const API_BASE_URL = '/api';

// --- Referințe HTML pentru zona Animale ---
const petForm = document.getElementById('petForm');
const petsList = document.getElementById('petsList');
const petMessageBox = document.getElementById('petMessageBox');

// --- Referințe HTML pentru zona Memento-uri (Reminders) ---
const reminderForm = document.getElementById('reminderForm');
const remindersList = document.getElementById('remindersList');
const messageBox = document.getElementById('messageBox');

// --- Referințe HTML pentru zona Notificări ---
const notificationsList = document.getElementById('notificationsList');
const notificationMessageBox = document.getElementById('notificationMessageBox');

// Afișează un mesaj (succes/eroare) într-o casetă din pagină.
const showMessage = (element, message, type = 'success') => {
  element.textContent = message;
  element.className = type;
};

// Golește caseta de mesaj.
const clearMessage = (element) => {
  element.textContent = '';
  element.className = '';
};

// Formatează o dată în format românesc (sau '-' dacă lipsește).
const formatDate = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  return new Date(dateValue).toLocaleDateString('ro-RO');
};

// --- Helperi de prezentare (doar pentru afișare, nu afectează apelurile API) ---

// Scapă textul introdus de utilizator înainte de a-l pune în HTML (protecție XSS).
const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Iniţialele unui nume (pentru avatarul utilizatorului).
const initials = (name) => {
  const parts = String(name || '?').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};

// Etichete + iconițe pentru categoriile de reminder (corespund opțiunilor din formular).
const CATEGORY_INFO = {
  food: { label: 'Hrană', icon: '🍖' },
  bath: { label: 'Baie', icon: '🛁' },
  walk: { label: 'Plimbare', icon: '🦮' },
  vaccine: { label: 'Vaccin', icon: '💉' },
  medicine: { label: 'Medicamente', icon: '💊' },
  vet: { label: 'Vizită veterinar', icon: '🏥' },
  other: { label: 'Altceva', icon: '📌' },
};

// Iconiță pentru tipul animalului (avatar).
const petAvatar = (type) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('dog') || t.includes('câine') || t.includes('caine')) return '🐶';
  if (t.includes('cat') || t.includes('pisic')) return '🐱';
  if (t.includes('bird') || t.includes('pas')) return '🐦';
  if (t.includes('fish') || t.includes('pest')) return '🐠';
  if (t.includes('rabbit') || t.includes('iepur')) return '🐰';
  return '🐾';
};

// Lista animalelor utilizatorului, ținută în memorie ca să putem afișa NUMELE
// animalului (în loc de ID tehnic) și să populăm dropdown-urile de selecție.
let petsCache = [];

// Întoarce numele animalului după id (sau null dacă nu e în cache).
const petNameById = (id) => {
  const pet = petsCache.find((p) => p._id === id);
  return pet ? pet.name : null;
};

// Reumple selectoarele de animale (din formularul de creare reminder și din
// filtrul listei) pe baza animalelor curente, păstrând selecția existentă.
const refreshPetSelectors = () => {
  const createSelect = document.getElementById('petId');
  const filterSelect = document.getElementById('filterPetId');

  if (createSelect) {
    const prev = createSelect.value;
    const options = petsCache
      .map((p) => `<option value="${escapeHtml(p._id)}">${petAvatar(p.type)} ${escapeHtml(p.name)}</option>`)
      .join('');
    createSelect.innerHTML = petsCache.length
      ? `<option value="" disabled${prev ? '' : ' selected'}>Alege un animal…</option>${options}`
      : '<option value="" disabled selected>Adaugă întâi un animal</option>';
    if (prev) {
      createSelect.value = prev;
    }
  }

  if (filterSelect) {
    const prev = filterSelect.value;
    const options = petsCache
      .map((p) => `<option value="${escapeHtml(p._id)}">${petAvatar(p.type)} ${escapeHtml(p.name)}</option>`)
      .join('');
    filterSelect.innerHTML = `<option value="">Toate animalele</option>${options}`;
    filterSelect.value = prev;
  }
};

// Construiește și afișează în pagină lista de animale.
const renderPets = (pets) => {
  petsList.innerHTML = '';

  if (!pets || pets.length === 0) {
    petsList.innerHTML = '<p class="empty-state">🐾 Niciun animal încă. Adaugă unul folosind formularul.</p>';
    return;
  }

  pets.forEach((pet) => {
    const item = document.createElement('div');
    item.className = 'pet-item';

    item.innerHTML = `
      <div class="item-head">
        <span class="avatar avatar-pet">${petAvatar(pet.type)}</span>
        <div class="item-head-text">
          <h3>${escapeHtml(pet.name)}</h3>
          <span class="cat-pill">${petAvatar(pet.type)} ${escapeHtml(pet.type)}</span>
        </div>
      </div>
      <div class="meta-grid">
        <span><strong>Rasă</strong> ${escapeHtml(pet.breed)}</span>
        <span><strong>Vârstă</strong> ${escapeHtml(pet.age)} ani</span>
      </div>
      ${pet.notes ? `<p class="item-notes">${escapeHtml(pet.notes)}</p>` : ''}
      <div class="pet-actions">
        <button class="delete-pet-btn" data-id="${escapeHtml(pet._id)}">Șterge</button>
      </div>
    `;

    petsList.appendChild(item);
  });
};

// Construiește și afișează în pagină lista de memento-uri.
const renderReminders = (reminders) => {
  remindersList.innerHTML = '';

  if (!reminders || reminders.length === 0) {
    remindersList.innerHTML = '<p class="empty-state">⏰ Niciun reminder. Creează unul pentru un animal.</p>';
    return;
  }

  reminders.forEach((reminder) => {
    const item = document.createElement('div');
    item.className = 'reminder-item';

    const cat = CATEGORY_INFO[reminder.category] || { label: reminder.category || '-', icon: '📌' };
    const status = reminder.status || 'active';
    const isDone = status === 'done';
    const dateValue = reminder.reminderDate || reminder.reminder_date;
    const isOverdue = !isDone && dateValue && new Date(dateValue) < new Date(new Date().toDateString());
    const petId = reminder.petId || reminder.pet_id;
    const petName = petNameById(petId) || 'Animal șters';

    item.innerHTML = `
      <div class="item-head">
        <span class="avatar avatar-reminder">${cat.icon}</span>
        <div class="item-head-text">
          <h3>${escapeHtml(reminder.title)}</h3>
          <span class="cat-pill">${cat.icon} ${escapeHtml(cat.label)}</span>
        </div>
        <span class="status-badge ${isDone ? 'read' : 'sent'}">${isDone ? 'Realizat' : 'Activ'}</span>
      </div>
      <div class="meta-grid">
        <span><strong>Animal</strong> ${escapeHtml(petName)}</span>
        <span><strong>Data</strong> ${formatDate(dateValue)} ${isOverdue ? '<em class="overdue">· întârziat</em>' : ''}</span>
      </div>
      ${reminder.description ? `<p class="item-notes">${escapeHtml(reminder.description)}</p>` : ''}
      <div class="reminder-actions">
        ${isDone ? '' : `<button class="done-btn" data-id="${escapeHtml(reminder.id)}">Marchează realizat</button>`}
        <button class="delete-btn" data-id="${escapeHtml(reminder.id)}">Șterge</button>
      </div>
    `;

    remindersList.appendChild(item);
  });
};

// Helper generic: face un fetch autentificat (adaugă token-ul JWT), parsează
// JSON-ul și aruncă eroare dacă răspunsul nu e OK. La 401 (token expirat/invalid)
// deconectează automat utilizatorul.
const fetchJson = async (url, options = {}) => {
  const token = window.PetCareAuth ? window.PetCareAuth.getToken() : null;

  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Pentru cererile cu body trimitem mereu JSON.
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    if (window.PetCareAuth) {
      window.PetCareAuth.logout();
    }
    throw new Error('Sesiune expirată. Te rugăm să te autentifici din nou.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.message || 'Eroare API');
  }

  return result;
};

// Încarcă animalele utilizatorului logat și le afișează.
const loadPets = async () => {
  try {
    clearMessage(petMessageBox);
    const result = await fetchJson(`${API_BASE_URL}/pets`);
    petsCache = result.data || [];
    renderPets(petsCache);
    refreshPetSelectors();
    // Reafișăm reminderele ca să apară numele animalelor (nu doar ID-urile).
    if (remindersList.childElementCount > 0) {
      await loadReminders(true);
    }
  } catch (error) {
    showMessage(petMessageBox, 'Nu s-au putut încărca animalele.', 'error');
  }
};

// Trimite formularul de creare animal către API (POST /api/pets).
// userId NU se trimite din formular - vine din token (proprietarul = userul logat).
const createPet = async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById('petName').value.trim(),
    type: document.getElementById('petType').value.trim(),
    breed: document.getElementById('petBreed').value.trim(),
    age: Number(document.getElementById('petAge').value.trim()),
    notes: document.getElementById('petNotes').value.trim()
  };

  try {
    clearMessage(petMessageBox);
    await fetchJson(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    petForm.reset();
    showMessage(petMessageBox, 'Animalul a fost creat cu succes.');
    await loadPets();
  } catch (error) {
    showMessage(petMessageBox, error.message, 'error');
  }
};

// Șterge un animal după id (DELETE /api/pets/:id).
const deletePet = async (id) => {
  try {
    clearMessage(petMessageBox);
    await fetchJson(`${API_BASE_URL}/pets/${id}`, {
      method: 'DELETE'
    });
    showMessage(petMessageBox, 'Animalul a fost șters cu succes.');
    await loadPets();
  } catch (error) {
    showMessage(petMessageBox, error.message, 'error');
  }
};

// Încarcă toate memento-urile.
const loadReminders = async (silent = false) => {
  try {
    if (!silent) {
      clearMessage(messageBox);
    }
    const result = await fetchJson(`${API_BASE_URL}/reminders`);
    renderReminders(result.data);
  } catch (error) {
    showMessage(messageBox, 'Nu s-au putut încărca reminderele.', 'error');
  }
};

// Încarcă doar memento-urile active (GET /api/reminders/active).
const loadActiveReminders = async () => {
  try {
    clearMessage(messageBox);
    const result = await fetchJson(`${API_BASE_URL}/reminders/active`);
    renderReminders(result.data);
  } catch (error) {
    showMessage(messageBox, 'Nu s-au putut încărca reminderele active.', 'error');
  }
};

// Filtrează memento-urile după animalul ales în dropdown (GET /api/reminders/pet/:id).
const filterRemindersByPet = async (petId) => {
  if (!petId) {
    await loadReminders();
    return;
  }

  try {
    clearMessage(messageBox);
    const result = await fetchJson(`${API_BASE_URL}/reminders/pet/${petId}`);
    renderReminders(result.data);
  } catch (error) {
    showMessage(messageBox, 'Nu s-au putut filtra reminderele.', 'error');
  }
};

// Trimite formularul de creare memento către API (POST /api/reminders).
// La creare, Reminder Service generează automat și o notificare pentru owner.
const createReminder = async (event) => {
  event.preventDefault();

  const payload = {
    petId: document.getElementById('petId').value.trim(),
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    category: document.getElementById('category').value,
    reminderDate: document.getElementById('reminderDate').value,
    status: 'active'
  };

  try {
    clearMessage(messageBox);
    await fetchJson(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    reminderForm.reset();
    showMessage(messageBox, 'Reminder creat cu succes.');
    await loadReminders();
  } catch (error) {
    showMessage(messageBox, error.message, 'error');
  }
};

// Marchează un memento ca realizat (PUT /api/reminders/:id/done).
const markReminderAsDone = async (id) => {
  try {
    clearMessage(messageBox);
    await fetchJson(`${API_BASE_URL}/reminders/${id}/done`, {
      method: 'PUT'
    });
    showMessage(messageBox, 'Reminder marcat ca realizat.');
    await loadReminders();
  } catch (error) {
    showMessage(messageBox, error.message, 'error');
  }
};

// Șterge un memento (DELETE /api/reminders/:id).
const deleteReminder = async (id) => {
  try {
    clearMessage(messageBox);
    await fetchJson(`${API_BASE_URL}/reminders/${id}`, {
      method: 'DELETE'
    });
    showMessage(messageBox, 'Reminder șters cu succes.');
    await loadReminders();
  } catch (error) {
    showMessage(messageBox, error.message, 'error');
  }
};

// Construiește și afișează lista de notificări, cu badge de status (neexpediat/trimis/citit).
const renderNotifications = (notifications) => {
  notificationsList.innerHTML = '';

  if (!notifications || notifications.length === 0) {
    notificationsList.innerHTML = '<p class="empty-state">🔔 Nicio notificare \u00eenc\u0103. Apar automat c\u00e2nd creezi remindere.</p>';
    return;
  }

  notifications.forEach((notif) => {
    const item = document.createElement('div');
    item.className = 'notification-item';

    // Statusul notificării: în interfață avem doar „necitit” vs „citit”.
    // (Backend-ul mai are un status intermediar `sent`, tratat aici tot ca necitit.)
    const status = notif.status || 'pending';
    const isRead = status === 'read';
    const statusText = isRead ? 'Citit' : 'Necitit';

    // Tipul notificării (created/upcoming/due/overdue) => badge de urgență colorat.
    const type = notif.type || 'created';
    const typeMap = {
      created: { label: '🆕 Nou', cls: 'type-created' },
      upcoming: { label: '⏳ Se apropie', cls: 'type-upcoming' },
      due: { label: '📅 Astăzi', cls: 'type-due' },
      overdue: { label: '⚠️ Restant', cls: 'type-overdue' },
    };
    const typeInfo = typeMap[type] || typeMap.created;
    item.classList.add(`notif-${type}`);

    const createdAt = notif.created_at ?? notif.createdAt;

    item.innerHTML = `
      <div class="notification-content">
        <div class="notification-top">
          <span class="urgency-badge ${typeInfo.cls}">${typeInfo.label}</span>
          <span class="status-badge ${isRead ? 'read' : 'pending'}">${statusText}</span>
        </div>
        <p class="notification-message">${escapeHtml(notif.message)}</p>
        <div class="notification-meta">${formatDate(createdAt)}</div>
      </div>
      <div class="notification-actions">
        ${!isRead ? `<button class="mark-read-btn" data-id="${escapeHtml(notif.id)}">✓ Marchează citit</button>` : ''}
        <button class="delete-notif-btn" data-id="${escapeHtml(notif.id)}">🗑 Șterge</button>
      </div>
    `;
    notificationsList.appendChild(item);
  });
};

// Încarcă toate notificările.
const loadNotifications = async (silent = false) => {
  try {
    if (!silent) {
      clearMessage(notificationMessageBox);
    }
    const response = await fetchJson(`${API_BASE_URL}/notifications`);
    renderNotifications(response.data);
  } catch (error) {
    // În modul silențios (auto-refresh) nu deranjăm userul cu erori temporare.
    if (!silent) {
      showMessage(notificationMessageBox, error.message, 'error');
    }
  }
};

// Marchează o notificare ca citită (PUT /api/notifications/:id/read).
const markNotificationAsRead = async (id) => {
  try {
    clearMessage(notificationMessageBox);
    await fetchJson(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    await loadNotifications();
  } catch (error) {
    showMessage(notificationMessageBox, error.message, 'error');
  }
};

// Șterge o notificare (DELETE /api/notifications/:id).
const deleteNotification = async (id) => {
  try {
    clearMessage(notificationMessageBox);
    await fetchJson(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE'
    });
    showMessage(notificationMessageBox, 'Notificare ștearsă cu succes.');
    await loadNotifications();
  } catch (error) {
    showMessage(notificationMessageBox, error.message, 'error');
  }
};

// --- Conectarea formularelor și butoanelor la funcțiile de mai sus (event listeners) ---
petForm.addEventListener('submit', createPet);

reminderForm.addEventListener('submit', createReminder);

// Bara de filtre a listei de remindere (segmente Toate / Active + dropdown animal).
const reminderSegments = document.querySelectorAll('.seg-bar .seg');
const filterPetSelect = document.getElementById('filterPetId');

const setActiveSegment = (button) => {
  reminderSegments.forEach((b) => b.classList.toggle('active', b === button));
};

reminderSegments.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveSegment(button);
    if (filterPetSelect) {
      filterPetSelect.value = '';
    }
    if (button.dataset.filter === 'active') {
      loadActiveReminders();
    } else {
      loadReminders();
    }
  });
});

if (filterPetSelect) {
  filterPetSelect.addEventListener('change', () => {
    // Selectarea unui animal anulează evidențierea segmentelor Toate/Active.
    if (filterPetSelect.value) {
      reminderSegments.forEach((b) => b.classList.remove('active'));
    } else {
      const allBtn = document.querySelector('.seg-bar .seg[data-filter="all"]');
      setActiveSegment(allBtn);
    }
    filterRemindersByPet(filterPetSelect.value);
  });
}

// Click în lista de animale: detectează butonul de ștergere (event delegation).
petsList.addEventListener('click', async (event) => {
  const petId = event.target.dataset.id;

  if (!petId) {
    return;
  }

  if (event.target.classList.contains('delete-pet-btn')) {
    await deletePet(petId);
  }
});

// Click în lista de memento-uri: butoane de "done" sau "șterge".
remindersList.addEventListener('click', async (event) => {
  const reminderId = event.target.dataset.id;

  if (!reminderId) {
    return;
  }

  if (event.target.classList.contains('done-btn')) {
    await markReminderAsDone(reminderId);
  }

  if (event.target.classList.contains('delete-btn')) {
    await deleteReminder(reminderId);
  }
});

// Click în lista de notificări: butoane de marcare trimis/citit sau ștergere.
notificationsList.addEventListener('click', async (event) => {
  const notificationId = event.target.dataset.id;

  if (!notificationId) {
    return;
  }

  if (event.target.classList.contains('mark-read-btn')) {
    await markNotificationAsRead(notificationId);
  }

  if (event.target.classList.contains('delete-notif-btn')) {
    await deleteNotification(notificationId);
  }
});

// --- Pornirea aplicației ---
// Datele se încarcă DOAR după autentificare. auth.js apelează PetCareApp.start(user)
// odată ce userul e logat (la login, înregistrare sau la revenirea cu token valid).

// Auto-refresh notificări: scheduler-ul backend generează notificări pe măsură
// ce se apropie/vin/trec datele reminderelor. Reîncărcăm lista periodic (silențios)
// ca alertele să apară singure, fără ca userul să dea refresh manual.
const NOTIFICATIONS_REFRESH_MS = 30000;
let notificationsRefreshTimer = null;

const startNotificationsAutoRefresh = () => {
  if (notificationsRefreshTimer) {
    return;
  }
  notificationsRefreshTimer = setInterval(() => {
    // Nu interogăm dacă tab-ul e ascuns (economisim cereri inutile).
    if (document.hidden) {
      return;
    }
    loadNotifications(true);
  }, NOTIFICATIONS_REFRESH_MS);
};

window.PetCareApp = {
  async start() {
    // Întâi animalele (populează cache-ul de nume), apoi reminderele ca să afișeze
    // numele animalului în loc de ID-ul tehnic.
    await loadPets();
    await loadReminders();
    loadNotifications();
    startNotificationsAutoRefresh();
  }
};
