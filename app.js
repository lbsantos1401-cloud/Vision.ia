/**
 * SOLTEC CLOUD - Lógica de Aplicação
 * Gerenciamento de Telas, Autenticação, Persistência via localStorage e Push Notifications
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
  // 2. GERENCIAMENTO DE VISIBILIDADE DAS TELAS
  // ==========================================================================
  // Esconde todas as telas e exibe apenas a tela solicitada
  function showScreen(screenToShow) {
    [screenLogin, screenRegister, screenDashboard].forEach(screen => {
      screen.classList.add('hidden');
    });
    screenToShow.classList.remove('hidden');
  }

  // ==========================================================================
  // 3. VERIFICAÇÃO DE SESSÃO E PERSISTÊNCIA (LOCALSTORAGE)
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
  // 4. LÓGICA DE CADASTRO DE USUÁRIO
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

    // Grava o novo usuário e estabelece a sessão ativa
    const newUser = { name, email, pin };
    localStorage.setItem('soltec_user_' + email, JSON.stringify(newUser));
    localStorage.setItem('soltec_session', JSON.stringify(newUser));

    alert('Conta criada com sucesso!');
    formRegister.reset();
    checkSession();
  });

  // ==========================================================================
  // 5. LÓGICA DE AUTENTICAÇÃO (LOGIN)
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
  // 6. NAVEGAÇÃO E EVENTOS DE INTERFACE
  // ==========================================================================
  btnGoRegister.addEventListener('click', () => showScreen(screenRegister));
  btnBackLogin.addEventListener('click', () => showScreen(screenLogin));
  linkGoLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(screenLogin);
  });

  // Controle do Modal de Configurações
  btnOpenSettings.addEventListener('click', () => modalSettings.classList.remove('hidden'));
  btnCloseSettings.addEventListener('click', () => modalSettings.classList.add('hidden'));

  // Encerramento da Sessão
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('soltec_session');
    modalSettings.classList.add('hidden');
    checkSession();
  });

  // ==========================================================================
  // 7. SIMULAÇÃO DE ESTADO DE ENERGIA (NORMAL / FALTA DE ENERGIA)
  // ==========================================================================
  let isNormalPower = true;

  btnToggleEnergy.addEventListener('click', () => {
    isNormalPower = !isNormalPower;

    if (isNormalPower) {
      energyLine.className = 'energy-line normal';
      statusCross.classList.add('hidden');
      cardStatus.className = 'status-card normal';
      statusIndicatorDot.className = 'dot green';
      statusTitle.textContent = 'Energia Normal';
      statusDescription.textContent = 'Energia da concessionária disponível.';
      btnToggleEnergy.textContent = 'Alternar p/ Falta de Energia';
    } else {
      energyLine.className = 'energy-line fault';
      statusCross.classList.remove('hidden');
      cardStatus.className = 'status-card fault';
      statusIndicatorDot.className = 'dot red';
      statusTitle.textContent = 'Falta de energia detectada';
      statusDescription.textContent = 'O sistema está sendo alimentado pelas baterias.';
      btnToggleEnergy.textContent = 'Alternar p/ Energia Normal';
    }
  });

  // ==========================================================================
  // 8. FUNCIONALIDADE DE NOTIFICAÇÕES PUSH NATIVAS
  // ==========================================================================

  // Função para criar e enviar a notificação do sistema
  function sendPushNotification() {
    const title = "SolTec Cloud";
    const options = {
      body: "teste de notificação push",
      icon: "https://via.placeholder.com/128/0066ff/ffffff?text=SOLTEC"
    };

    // Dispara a notificação nativa no sistema operacional do dispositivo
    new Notification(title, options);
  }

  // Função de verificação de suporte e permissão do navegador
  function handlePushTest() {
    // Verificação 1: O navegador suporta a API de Notificação?
    if (!("Notification" in window)) {
      alert("Este navegador não possui suporte para notificações Push.");
      return;
    }

    // Verificação 2: Permissão já concedida anteriormente
    if (Notification.permission === "granted") {
      sendPushNotification();
    } 
    // Verificação 3: Permissão ainda não solicitada
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendPushNotification();
        } else {
          alert("Permissão para notificações foi negada pelo usuário.");
        }
      });
    } 
    // Verificação 4: Permissão bloqueada nas configurações do navegador
    else {
      alert("As notificações estão bloqueadas no seu navegador. Altere as permissões nas configurações do navegador para testar.");
    }
  }

  // Associação do clique nos botões de teste à função de envio
  if (btnTestPushMain) {
    btnTestPushMain.addEventListener('click', handlePushTest);
  }
  if (btnTestPushItem) {
    btnTestPushItem.addEventListener('click', handlePushTest);
  }

  // Inicialização do aplicativo
  checkSession();
});
  
