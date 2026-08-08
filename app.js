/**
 * SOLTEC CLOUD - Lógica de Aplicação & Motor de Estados (Agente ESP32)
 * Gerenciamento de Telas, Autenticação, Persistência e Notificações Push via Hardware
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. SELEÇÃO DE ELEMENTOS DO DOM (MAPEAMENTO DA INTERFACE)
  // ==========================================================================
  const screenLogin = document.getElementById('screen-login');
  const screenRegister = document.getElementById('screen-register');
  const screenDashboard = document.getElementById('screen-dashboard');
  const modalSettings = document.getElementById('modal-settings');

  // Formulários de Entrada
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // Botões de Navegação e Ações
  const btnGoRegister = document.getElementById('btn-go-register');
  const btnBackLogin = document.getElementById('btn-back-login');
  const linkGoLogin = document.getElementById('link-go-login');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnLogout = document.getElementById('btn-logout');

  // Exibição do Perfil do Usuário
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayEmail = document.getElementById('user-display-email');

  // Elementos do Gráfico/Diagrama de Energia
  const btnToggleEnergy = document.getElementById('btn-toggle-energy');
  const energyLine = document.getElementById('energy-line');
  const statusCross = document.getElementById('status-cross');
  const cardStatus = document.getElementById('card-status');
  const statusIndicatorDot = document.getElementById('status-indicator-dot');
  const statusTitle = document.getElementById('status-title');
  const statusDescription = document.getElementById('status-description');

  // Botões do Teste Push
  const btnTestPushMain = document.getElementById('btn-test-push-main');
  const btnTestPushItem = document.getElementById('btn-test-push');

  // ==========================================================================
  // 2. REGISTRO DO SERVICE WORKER (PARA SUPORTE PUSH EM CELULARES)
  // ==========================================================================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.error('Falha ao registrar o Service Worker:', error);
      });
  }

  // ==========================================================================
  // 3. GERENCIAMENTO DE VISIBILIDADE DAS TELAS
  // ==========================================================================
  function showScreen(screenToShow) {
    [screenLogin, screenRegister, screenDashboard].forEach(screen => {
      screen.classList.add('hidden');
    });
    screenToShow.classList.remove('hidden');
  }

  // ==========================================================================
  // 4. VERIFICAÇÃO DE SESSÃO E PERSISTÊNCIA (LOCALSTORAGE)
  // ==========================================================================
  function checkSession() {
    const loggedUser = JSON.parse(localStorage.getItem('soltec_session'));
    if (loggedUser) {
      userDisplayName.textContent = loggedUser.name;
      userDisplayEmail.textContent = loggedUser.email;
      showScreen(screenDashboard);
    } else {
      showScreen(screenLogin);
    }
  }

  // ==========================================================================
  // 5. LÓGICA DE CADASTRO DE USUÁRIO
  // ==========================================================================
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pin = document.getElementById('reg-pin').value;
    const confirmPin = document.getElementById('reg-confirm-pin').value;

    if (pin !== confirmPin) {
      alert('Os PINs digitados não coincidem!');
      return;
    }

    if (pin.length !== 6) {
      alert('O PIN deve ter exatamente 6 dígitos.');
      return;
    }

    const newUser = { name, email, pin };
    localStorage.setItem('soltec_user_' + email, JSON.stringify(newUser));
    localStorage.setItem('soltec_session', JSON.stringify(newUser));

    alert('Conta criada com sucesso!');
    formRegister.reset();
    checkSession();
  });

  // ==========================================================================
  // 6. LÓGICA DE AUTENTICAÇÃO (LOGIN)
  // ==========================================================================
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const pin = document.getElementById('login-pin').value;

    const storedUserRaw = localStorage.getItem('soltec_user_' + email);

    if (!storedUserRaw) {
      alert('Usuário não encontrado. Crie uma conta primeiro!');
      return;
    }

    const storedUser = JSON.parse(storedUserRaw);

    if (storedUser.pin === pin) {
      localStorage.setItem('soltec_session', JSON.stringify(storedUser));
      formLogin.reset();
      checkSession();
    } else {
      alert('PIN incorreto!');
    }
  });

  // ==========================================================================
  // 7. NAVEGAÇÃO E EVENTOS DE INTERFACE
  // ==========================================================================
  btnGoRegister.addEventListener('click', () => showScreen(screenRegister));
  btnBackLogin.addEventListener('click', () => showScreen(screenLogin));
  linkGoLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(screenLogin);
  });

  btnOpenSettings.addEventListener('click', () => modalSettings.classList.remove('hidden'));
  btnCloseSettings.addEventListener('click', () => modalSettings.classList.add('hidden'));

  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('soltec_session');
    modalSettings.classList.add('hidden');
    checkSession();
  });

  // ==========================================================================
  // 8. MOTOR DE ESTADOS E AGENTE DE MENSAGENS (INTEGRAÇÃO ESP32)
  // ==========================================================================

  // Função interna para disparar a notificação push no dispositivo
  function sendPushMessage(messageText) {
    const title = "SolTec Cloud - Alerta";
    const options = {
      body: messageText,
      icon: "https://via.placeholder.com/128/0066ff/ffffff?text=SOLTEC",
      badge: "https://via.placeholder.com/72/0066ff/ffffff?text=ST",
      vibrate: [200, 100, 200, 100, 200]
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }

  // O AGENTE INTELIGENTE: Avalia o comando recebido do hardware ESP32
  function processHardwareMessage(payload) {
    console.log("Mensagem recebida do ESP32:", payload);

    if (payload === "grid_off") {
      // Estado 1: Falta de energia detectada
      energyLine.className = 'energy-line fault';
      statusCross.classList.remove('hidden');
      cardStatus.className = 'status-card fault';
      statusIndicatorDot.className = 'dot red';
      statusTitle.textContent = 'Falta de energia detectada';
      statusDescription.textContent = 'O sistema está sendo alimentado pelas baterias.';
      btnToggleEnergy.textContent = 'Alternar p/ Energia Normal';

      // Dispara a notificação push correspondente
      sendPushMessage("Atenção, falta de energia da concessionária detectada, sistema de baterias ativado.");

    } else if (payload === "grid_on") {
      // Estado 2: Rede restabelecida
      energyLine.className = 'energy-line normal';
      statusCross.classList.add('hidden');
      cardStatus.className = 'status-card normal';
      statusIndicatorDot.className = 'dot green';
      statusTitle.textContent = 'Energia Normal';
      statusDescription.textContent = 'Energia da concessionária disponível. Baterias em carga.';
      btnToggleEnergy.textContent = 'Alternar p/ Falta de Energia';

      // Dispara a notificação push correspondente
      sendPushMessage("Conexão com a rede da concessionária foi reestabelecida, baterias em carga.");
    } else {
      console.warn("Comando desconhecido recebido do hardware:", payload);
    }
  }

  // ==========================================================================
  // 9. SIMULAÇÃO DE BOTÕES (SIMULANDO O ENVIO DE MENSAGENS PELO ESP32)
  // ==========================================================================
  let isNormalPower = true;

  btnToggleEnergy.addEventListener('click', () => {
    isNormalPower = !isNormalPower;

    // Simula o ESP32 enviando a mensagem dependendo do estado alternado
    if (!isNormalPower) {
      processHardwareMessage("grid_off");
    } else {
      processHardwareMessage("grid_on");
    }
  });

  // Testar Push Padrão (Manual)
  function handlePushTest() {
    if (!("Notification" in window)) {
      alert("Este navegador não possui suporte para notificações Push.");
      return;
    }

    if (Notification.permission === "granted") {
      sendPushMessage("teste de notificação push");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendPushMessage("teste de notificação push");
        } else {
          alert("Permissão para notificações negada.");
        }
      });
    } else {
      alert("Notificações bloqueadas no navegador.");
    }
  }

  if (btnTestPushMain) {
    btnTestPushMain.addEventListener('click', handlePushTest);
  }
  if (btnTestPushItem) {
    btnTestPushItem.addEventListener('click', handlePushTest);
  }

  // Inicialização do aplicativo
  checkSession();
});
    
