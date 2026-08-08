/**
 * SOLTEC CLOUD - Lógica de Aplicação
 * Gerenciamento de Telas, Autenticação e Persistência via localStorage
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // SELEÇÃO DE ELEMENTOS DO DOM
  // ==========================================================================
  const screenLogin = document.getElementById('screen-login');
  const screenRegister = document.getElementById('screen-register');
  const screenDashboard = document.getElementById('screen-dashboard');
  const modalSettings = document.getElementById('modal-settings');

  // Formulários
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // Botões de Navegação
  const btnGoRegister = document.getElementById('btn-go-register');
  const btnBackLogin = document.getElementById('btn-back-login');
  const linkGoLogin = document.getElementById('link-go-login');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnLogout = document.getElementById('btn-logout');

  // Elementos de Perfil
  const userDisplayName = document.getElementById('user-display-name');
  const userDisplayEmail = document.getElementById('user-display-email');

  // Controle de Simulação de Energia
  const btnToggleEnergy = document.getElementById('btn-toggle-energy');
  const energyLine = document.getElementById('energy-line');
  const statusCross = document.getElementById('status-cross');
  const cardStatus = document.getElementById('card-status');
  const statusIndicatorDot = document.getElementById('status-indicator-dot');
  const statusTitle = document.getElementById('status-title');
  const statusDescription = document.getElementById('status-description');

  // Botões de Push
  const btnTestPushMain = document.getElementById('btn-test-push-main');

  // ==========================================================================
  // GERENCIAMENTO DE TELAS
  // ==========================================================================
  function showScreen(screenToShow) {
    [screenLogin, screenRegister, screenDashboard].forEach(screen => {
      screen.classList.add('hidden');
    });
    screenToShow.classList.remove('hidden');
  }

  // ==========================================================================
  // PERSISTÊNCIA DE DADOS (LOCALSTORAGE) E VERIFICAÇÃO DE SESSÃO
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
  // LÓGICA DE CADASTRO
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

    // Guardar usuário cadastrado no localStorage
    const newUser = { name, email, pin };
    localStorage.setItem('soltec_user_' + email, JSON.stringify(newUser));

    // Logar automaticamente
    localStorage.setItem('soltec_session', JSON.stringify(newUser));

    alert('Conta criada com sucesso!');
    formRegister.reset();
    checkSession();
  });

  // ==========================================================================
  // LÓGICA DE LOGIN
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
  // NAVEGAÇÃO DE BOTÕES
  // ==========================================================================
  btnGoRegister.addEventListener('click', () => showScreen(screenRegister));
  btnBackLogin.addEventListener('click', () => showScreen(screenLogin));
  linkGoLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(screenLogin);
  });

  // Modal de Configurações
  btnOpenSettings.addEventListener('click', () => {
    modalSettings.classList.remove('hidden');
  });

  btnCloseSettings.addEventListener('click', () => {
    modalSettings.classList.add('hidden');
  });

  // Logout
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('soltec_session');
    modalSettings.classList.add('hidden');
    checkSession();
  });

  // ==========================================================================
  // SIMULAÇÃO DE ESTADO DE ENERGIA (NORMAL vs FALTA DE ENERGIA)
  // ==========================================================================
  let isNormalPower = true;

  btnToggleEnergy.addEventListener('click', () => {
    isNormalPower = !isNormalPower;

    if (isNormalPower) {
      // Estado Normal
      energyLine.className = 'energy-line normal';
      statusCross.classList.add('hidden');
      cardStatus.className = 'status-card normal';
      statusIndicatorDot.className = 'dot green';
      statusTitle.textContent = 'Energia Normal';
      statusDescription.textContent = 'Energia da concessionária disponível.';
      btnToggleEnergy.textContent = 'Alternar p/ Falta de Energia';
    } else {
      // Estado de Falta de Energia
      energyLine.className = 'energy-line fault';
      statusCross.classList.remove('hidden');
      cardStatus.className = 'status-card fault';
      statusIndicatorDot.className = 'dot red';
      statusTitle.textContent = 'Falta de energia detectada';
      statusDescription.textContent = 'O sistema está sendo alimentado pelas baterias.';
      btnToggleEnergy.textContent = 'Alternar p/ Energia Normal';
    }
  });

  // Testar Push Notificação
  btnTestPushMain.addEventListener('click', () => {
    alert('Notificação Push enviada com sucesso para o seu dispositivo!');
  });

  // Inicializar verificação ao carregar a página
  checkSession();
});
