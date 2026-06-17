// notificationMessages.js - construiește mesaje îmbogățite pentru notificări și
// calculează "etapa" unui memento în funcție de cât mai este până la data lui.
// Folosit atât la crearea reminderului (type 'created'), cât și de scheduler
// (type 'upcoming' / 'due' / 'overdue').

// Pragul (în zile) sub care un memento este considerat "se apropie".
const UPCOMING_DAYS = 3;

// Aduce o dată la miezul nopții (ignoră ora), pentru a număra corect zilele întregi.
const atMidnight = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Câte zile întregi sunt de azi până la data reminderului (negativ = în trecut).
const daysUntil = (reminderDate) => {
  const today = atMidnight(new Date());
  const target = atMidnight(reminderDate);
  return Math.round((target - today) / 86400000);
};

// Determină etapa curentă a unui memento. Întoarce null dacă e prea departe în
// viitor (nu generăm încă notificare). Etapele sunt monotone în timp:
// scheduled -> upcoming -> due -> overdue, fiecare anunțată o singură dată.
const computeStage = (reminderDate) => {
  const n = daysUntil(reminderDate);
  if (n < 0) return { type: 'overdue', days: n };
  if (n === 0) return { type: 'due', days: n };
  if (n <= UPCOMING_DAYS) return { type: 'upcoming', days: n };
  return null; // încă prea departe
};

// Formatează data în stil românesc scurt (ex: 31 dec. 2025).
const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString('ro-RO', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return String(value);
  }
};

// Construiește textul notificării în funcție de tip, incluzând numele animalului.
const buildMessage = (reminder, petName, type) => {
  const pet = petName || 'animalul tău';
  const title = reminder.title;
  const date = formatDate(reminder.reminder_date || reminder.reminderDate);
  const n = Math.abs(daysUntil(reminder.reminder_date || reminder.reminderDate));

  switch (type) {
    case 'created':
      return `🆕 Reminder nou: „${title}” pentru ${pet} — ${date}`;
    case 'upcoming':
      return `⏳ Peste ${n} ${n === 1 ? 'zi' : 'zile'}: „${title}” pentru ${pet} (${date})`;
    case 'due':
      return `📅 Astăzi: „${title}” pentru ${pet}`;
    case 'overdue':
      return `⚠️ Restant: „${title}” pentru ${pet} (era pe ${date})`;
    default:
      return `Reminder: ${title}`;
  }
};

module.exports = {
  UPCOMING_DAYS,
  daysUntil,
  computeStage,
  buildMessage,
  formatDate,
};
