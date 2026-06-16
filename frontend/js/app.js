const API_BASE_URL = '/api';

const petForm = document.getElementById('petForm');
const loadPetsBtn = document.getElementById('loadPetsBtn');
const filterPetsByUserBtn = document.getElementById('filterPetsByUserBtn');
const petsList = document.getElementById('petsList');
const petMessageBox = document.getElementById('petMessageBox');

const reminderForm = document.getElementById('reminderForm');
const loadRemindersBtn = document.getElementById('loadRemindersBtn');
const loadActiveRemindersBtn = document.getElementById('loadActiveRemindersBtn');
const filterByPetBtn = document.getElementById('filterByPetBtn');
const remindersList = document.getElementById('remindersList');
const messageBox = document.getElementById('messageBox');

const showMessage = (element, message, type = 'success') => {
  element.textContent = message;
  element.className = type;
};

const clearMessage = (element) => {
  element.textContent = '';
  element.className = '';
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  return new Date(dateValue).toLocaleDateString('ro-RO');
};

const renderPets = (pets) => {
  petsList.innerHTML = '';

  if (!pets || pets.length === 0) {
    petsList.innerHTML = '<p>Nu există animale pentru afișare.</p>';
    return;
  }

  pets.forEach((pet) => {
    const item = document.createElement('div');
    item.className = 'pet-item';

    item.innerHTML = `
      <h3>${pet.name}</h3>
      <p class="pet-meta"><strong>User ID:</strong> ${pet.userId}</p>
      <p class="pet-meta"><strong>Tip:</strong> ${pet.type}</p>
      <p class="pet-meta"><strong>Rasă:</strong> ${pet.breed}</p>
      <p class="pet-meta"><strong>Vârstă:</strong> ${pet.age}</p>
      <p>${pet.notes || ''}</p>
      <div class="pet-actions">
        <button class="delete-pet-btn" data-id="${pet._id}">Șterge</button>
      </div>
    `;

    petsList.appendChild(item);
  });
};

const renderReminders = (reminders) => {
  remindersList.innerHTML = '';

  if (!reminders || reminders.length === 0) {
    remindersList.innerHTML = '<p>Nu există remindere pentru afișare.</p>';
    return;
  }

  reminders.forEach((reminder) => {
    const item = document.createElement('div');
    item.className = 'reminder-item';

    item.innerHTML = `
      <h3>${reminder.title}</h3>
      <p class="reminder-meta"><strong>Pet ID:</strong> ${reminder.petId || reminder.pet_id}</p>
      <p class="reminder-meta"><strong>Categorie:</strong> ${reminder.category || '-'}</p>
      <p class="reminder-meta"><strong>Data:</strong> ${formatDate(reminder.reminderDate || reminder.reminder_date)}</p>
      <p class="reminder-meta"><strong>Status:</strong> ${reminder.status}</p>
      <p>${reminder.description || ''}</p>
      <div class="reminder-actions">
        <button class="done-btn" data-id="${reminder.id}">Marchează done</button>
        <button class="delete-btn" data-id="${reminder.id}">Șterge</button>
      </div>
    `;

    remindersList.appendChild(item);
  });
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Eroare API');
  }

  return result;
};

const loadPets = async () => {
  try {
    clearMessage(petMessageBox);
    const result = await fetchJson(`${API_BASE_URL}/pets`);
    renderPets(result.data);
    showMessage(petMessageBox, 'Animalele au fost încărcate.');
  } catch (error) {
    showMessage(petMessageBox, 'Nu s-au putut încărca animalele.', 'error');
  }
};

const filterPetsByUser = async () => {
  const userId = document.getElementById('filterPetUserId').value.trim();

  if (!userId) {
    showMessage(petMessageBox, 'Introdu un User ID pentru filtrare.', 'error');
    return;
  }

  try {
    clearMessage(petMessageBox);
    const result = await fetchJson(`${API_BASE_URL}/pets/user/${userId}`);
    renderPets(result.data);
    showMessage(petMessageBox, `Animalele pentru user ${userId} au fost încărcate.`);
  } catch (error) {
    showMessage(petMessageBox, 'Nu s-au putut filtra animalele.', 'error');
  }
};

const createPet = async (event) => {
  event.preventDefault();

  const payload = {
    userId: Number(document.getElementById('petUserId').value.trim()),
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

const loadReminders = async () => {
  try {
    clearMessage(messageBox);
    const result = await fetchJson(`${API_BASE_URL}/reminders`);
    renderReminders(result.data);
    showMessage(messageBox, 'Reminderele au fost încărcate.');
  } catch (error) {
    showMessage(messageBox, 'Nu s-au putut încărca reminderele.', 'error');
  }
};

const loadActiveReminders = async () => {
  try {
    clearMessage(messageBox);
    const result = await fetchJson(`${API_BASE_URL}/reminders/active`);
    renderReminders(result.data);
    showMessage(messageBox, 'Reminderele active au fost încărcate.');
  } catch (error) {
    showMessage(messageBox, 'Nu s-au putut încărca reminderele active.', 'error');
  }
};

const filterRemindersByPet = async () => {
  const petId = document.getElementById('filterPetId').value.trim();

  if (!petId) {
    showMessage(messageBox, 'Introdu un Pet ID pentru filtrare.', 'error');
    return;
  }

  try {
    clearMessage(messageBox);
    const result = await fetchJson(`${API_BASE_URL}/reminders/pet/${petId}`);
    renderReminders(result.data);
    showMessage(messageBox, `Reminderele pentru ${petId} au fost încărcate.`);
  } catch (error) {
    showMessage(messageBox, 'Nu s-au putut filtra reminderele.', 'error');
  }
};

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

const markReminderAsDone = async (id) => {
  try {
    clearMessage(messageBox);
    await fetchJson(`${API_BASE_URL}/reminders/${id}/done`, {
      method: 'PUT'
    });
    showMessage(messageBox, 'Reminder marcat ca done.');
    await loadReminders();
  } catch (error) {
    showMessage(messageBox, error.message, 'error');
  }
};

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

petForm.addEventListener('submit', createPet);
loadPetsBtn.addEventListener('click', loadPets);
filterPetsByUserBtn.addEventListener('click', filterPetsByUser);

reminderForm.addEventListener('submit', createReminder);
loadRemindersBtn.addEventListener('click', loadReminders);
loadActiveRemindersBtn.addEventListener('click', loadActiveReminders);
filterByPetBtn.addEventListener('click', filterRemindersByPet);

petsList.addEventListener('click', async (event) => {
  const petId = event.target.dataset.id;

  if (!petId) {
    return;
  }

  if (event.target.classList.contains('delete-pet-btn')) {
    await deletePet(petId);
  }
});

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

loadPets();
loadReminders();
