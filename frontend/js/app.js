const API_BASE_URL = "http://localhost:3003";

const reminderForm = document.getElementById("reminderForm");
const loadRemindersBtn = document.getElementById("loadRemindersBtn");
const loadActiveRemindersBtn = document.getElementById("loadActiveRemindersBtn");
const filterByPetBtn = document.getElementById("filterByPetBtn");
const remindersList = document.getElementById("remindersList");
const messageBox = document.getElementById("messageBox");

const showMessage = (message, type = "success") => {
  messageBox.textContent = message;
  messageBox.className = type;
};

const clearMessage = () => {
  messageBox.textContent = "";
  messageBox.className = "";
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  return new Date(dateValue).toLocaleDateString("ro-RO");
};

const renderReminders = (reminders) => {
  remindersList.innerHTML = "";

  if (!reminders || reminders.length === 0) {
    remindersList.innerHTML = "<p>Nu există remindere pentru afișare.</p>";
    return;
  }

  reminders.forEach((reminder) => {
    const item = document.createElement("div");
    item.className = "reminder-item";

    item.innerHTML = `
      <h3>${reminder.title}</h3>
      <p class="reminder-meta"><strong>Pet ID:</strong> ${reminder.pet_id}</p>
      <p class="reminder-meta"><strong>Categorie:</strong> ${reminder.category || "-"}</p>
      <p class="reminder-meta"><strong>Data:</strong> ${formatDate(reminder.reminder_date)}</p>
      <p class="reminder-meta"><strong>Status:</strong> ${reminder.status}</p>
      <p>${reminder.description || ""}</p>

      <div class="reminder-actions">
        <button class="done-btn" data-id="${reminder.id}">Marchează done</button>
        <button class="delete-btn" data-id="${reminder.id}">Șterge</button>
      </div>
    `;

    remindersList.appendChild(item);
  });
};

const loadReminders = async () => {
  try {
    clearMessage();

    const response = await fetch(`${API_BASE_URL}/reminders`);
    const result = await response.json();

    renderReminders(result.data);
    showMessage("Reminderele au fost încărcate.");
  } catch (error) {
    showMessage("Nu s-au putut încărca reminderele.", "error");
  }
};

const loadActiveReminders = async () => {
  try {
    clearMessage();

    const response = await fetch(`${API_BASE_URL}/reminders/active`);
    const result = await response.json();

    renderReminders(result.data);
    showMessage("Reminderele active au fost încărcate.");
  } catch (error) {
    showMessage("Nu s-au putut încărca reminderele active.", "error");
  }
};

const filterRemindersByPet = async () => {
  const petId = document.getElementById("filterPetId").value.trim();

  if (!petId) {
    showMessage("Introdu un Pet ID pentru filtrare.", "error");
    return;
  }

  try {
    clearMessage();

    const response = await fetch(`${API_BASE_URL}/reminders/pet/${petId}`);
    const result = await response.json();

    renderReminders(result.data);
    showMessage(`Reminderele pentru ${petId} au fost încărcate.`);
  } catch (error) {
    showMessage("Nu s-au putut filtra reminderele.", "error");
  }
};

const createReminder = async (event) => {
  event.preventDefault();

  const payload = {
    petId: document.getElementById("petId").value.trim(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value,
    reminderDate: document.getElementById("reminderDate").value,
    status: "active"
  };

  try {
    clearMessage();

    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Eroare la creare reminder.");
    }

    reminderForm.reset();
    showMessage("Reminder creat cu succes.");
    await loadReminders();
  } catch (error) {
    showMessage(error.message, "error");
  }
};

const markReminderAsDone = async (id) => {
  try {
    clearMessage();

    const response = await fetch(`${API_BASE_URL}/reminders/${id}/done`, {
      method: "PUT"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Eroare la marcarea reminderului.");
    }

    showMessage("Reminder marcat ca done.");
    await loadReminders();
  } catch (error) {
    showMessage(error.message, "error");
  }
};

const deleteReminder = async (id) => {
  try {
    clearMessage();

    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Eroare la ștergerea reminderului.");
    }

    showMessage("Reminder șters cu succes.");
    await loadReminders();
  } catch (error) {
    showMessage(error.message, "error");
  }
};

reminderForm.addEventListener("submit", createReminder);
loadRemindersBtn.addEventListener("click", loadReminders);
loadActiveRemindersBtn.addEventListener("click", loadActiveReminders);
filterByPetBtn.addEventListener("click", filterRemindersByPet);

remindersList.addEventListener("click", async (event) => {
  const reminderId = event.target.dataset.id;

  if (!reminderId) {
    return;
  }

  if (event.target.classList.contains("done-btn")) {
    await markReminderAsDone(reminderId);
  }

  if (event.target.classList.contains("delete-btn")) {
    await deleteReminder(reminderId);
  }
});

loadReminders();