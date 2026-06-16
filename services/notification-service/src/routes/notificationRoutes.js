// notificationRoutes.js - endpoint-urile REST expuse de Notification Service
// (montate la /api/notifications).
const express = require('express');
const notificationController = require('../controllers');

const router = express.Router();

// Create notification
router.post('/', notificationController.createNotification);

// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get notification by id
router.get('/:id', notificationController.getNotification);

// Get notifications by user id
router.get('/user/:userId', notificationController.getNotificationsByUserId);

// Get notifications by reminder id
router.get('/reminder/:reminderId', notificationController.getNotificationsByReminderId);

// Mark notification as sent
router.put('/:id/sent', notificationController.markNotificationAsSent);

// Mark notification as read
router.put('/:id/read', notificationController.markNotificationAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
