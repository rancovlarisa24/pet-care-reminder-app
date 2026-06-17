// notificationRoutes.js - endpoint-urile REST expuse de Notification Service
// (montate la /api/notifications).
const express = require('express');
const notificationController = require('../controllers');
const { requireAuth, requireInternal } = require('../middleware/auth');

const router = express.Router();

// Creare notificare - DOAR intern (apel din Reminder Service cu X-Internal-Key).
router.post('/', requireInternal, notificationController.createNotification);

// Toate rutele de mai jos sunt pentru utilizatorul logat (vede DOAR notificările lui).
router.get('/', requireAuth, notificationController.getAllNotifications);
router.put('/:id/sent', requireAuth, notificationController.markNotificationAsSent);
router.put('/:id/read', requireAuth, notificationController.markNotificationAsRead);
router.delete('/:id', requireAuth, notificationController.deleteNotification);

module.exports = router;
