/**
 * SOLTEC CLOUD - Service Worker para Notificações Push Movel
 */

// Escuta o evento de exibição de notificação no celular
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
