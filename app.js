const $ = (id) => document.getElementById(id);
const authScreen = $("authScreen"), dashboardScreen = $("dashboardScreen"), transmitterScreen = $("transmitterScreen");
let creatingAccount = false;
let currentUser = null;
let devices = [];
let invites = [];
let sharingWatch = null;

function showScreen(screen) {
  [authScreen, dashboardScreen, transmitterScreen].forEach(el => el.classList.add("hidden"));
  screen.classList.remove("hidden");
}
function setAuthMode(create) {
  creatingAccount = create;
  $("authTitle").textContent = create ? "Criar conta administrativa" : "Bem-vindo de volta";
  $("authSubtitle").textContent = create ? "Cadastre um administrador para acessar o painel." : "Entre na sua conta para acessar os dispositivos vinculados.";
  $("authSubmit").textContent = create ? "Criar conta" : "Entrar";
  $("authSwitch").innerHTML = create
    ? 'Já tem uma conta? <button class="text-button" id="switchMode" type="button">Fazer login</button>'
    : 'Ainda não tem conta? <button class="text-button" id="switchMode" type="button">Criar administrador</button>';
  $("password").autocomplete = create ? "new-password" : "current-password";
  $("switchMode").addEventListener("click", () => setAuthMode(!creatingAccount));
}
$("switchMode").addEventListener("click", () => setAuthMode(true));

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}
$("authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  if (password.length < 6) return alert("A senha precisa ter pelo menos 6 caracteres.");
  if (!crypto.subtle) return alert("Para este protótipo, abra o site por HTTPS (por exemplo, GitHub Pages).");
  const passHash = await hashPassword(password);
  // Hash local apenas para demonstração. Isto NÃO substitui autenticação no servidor.
  const stored = JSON.parse(localStorage.getItem("gps_demo_account") || "null");
  if (creatingAccount) {
    if (stored) return alert("Já existe uma conta demonstrativa neste navegador. Faça login.");
    localStorage.setItem("gps_demo_account", JSON.stringify({ email, passHash }));
    currentUser = email;
    enterDashboard();
  } else {
    if (!stored || stored.email !== email || stored.passHash !== passHash) return alert("E-mail ou senha incorretos. Se ainda não tem conta, crie uma.");
    currentUser = email;
    enterDashboard();
  }
});
function enterDashboard() {
  $("sidebarEmail").textContent = currentUser;
  showScreen(dashboardScreen);
  renderDevices();
  navigate("overview");
}
$("logoutBtn").addEventListener("click", () => { currentUser = null; $("password").value = ""; showScreen(authScreen); setAuthMode(false); });
$("profileBtn").addEventListener("click", () => alert("Conta demonstrativa: " + currentUser));

function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $("page-" + page).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  const titles = { overview: "Visão geral", devices: "Dispositivos", links: "Gerar link" };
  $("pageTitle").textContent = titles[page];
}
document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.page)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.go)));

function deviceMarkup(device) {
  return `<div class="device-row"><div><span class="device-name">${escapeHtml(device.name)}</span><span class="device-sub">Criado ${device.created}</span></div><div><span class="status">Aguardando conexão</span></div><div class="device-sub">Sem localização</div><button class="row-action" data-revoke="${device.id}">Revogar</button></div>`;
}
function emptyMarkup() { return '<div class="empty-state"><b>Nenhum dispositivo por enquanto</b>Gere um link de convite para começar a vincular aparelhos.</div>'; }
function renderDevices() {
  $("totalDevices").textContent = devices.length;
  $("onlineDevices").textContent = "0";
  $("pendingLinks").textContent = invites.length;
  $("overviewDevices").innerHTML = devices.length ? devices.slice(0,4).map(deviceMarkup).join("") : emptyMarkup();
  $("allDevices").innerHTML = devices.length ? devices.map(deviceMarkup).join("") : emptyMarkup();
  document.querySelectorAll("[data-revoke]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.revoke;
    if (confirm("Revogar este vínculo demonstrativo?")) {
      devices = devices.filter(d => d.id !== id);
      renderDevices();
    }
  }));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
$("linkForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("deviceName").value.trim();
  if (!name) return;
  const id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)) ;
  const token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const base = location.href.split("?")[0].split("#")[0];
  const link = `${base}?convite=${encodeURIComponent(token)}`;
  invites.push({ id, token, name });
  devices.push({ id, name, created: new Date().toLocaleDateString("pt-BR") });
  $("linkOutput").value = link;
  $("generatedLink").classList.remove("hidden");
  $("deviceName").value = "";
  renderDevices();
});
$("copyLink").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("linkOutput").value); $("copyLink").textContent = "Copiado!"; }
  catch { $("linkOutput").select(); document.execCommand("copy"); $("copyLink").textContent = "Copiado!"; }
  setTimeout(() => $("copyLink").textContent = "Copiar", 1600);
});

function checkInviteRoute() {
  const params = new URLSearchParams(location.search);
  if (params.has("convite")) {
    showScreen(transmitterScreen);
    $("transmitterName").value = "Meu celular";
  }
}
$("startSharing").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("sharingStatus").textContent = "Este navegador não oferece suporte à localização.";
    return;
  }
  $("sharingStatus").textContent = "Aguardando autorização de localização…";
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude, accuracy } = position.coords;
    $("sharingStatus").textContent = `Permissão concedida. GPS detectado (precisão aproximada: ${Math.round(accuracy)} m). Envio ao servidor será implementado na próxima versão.`;
    $("startSharing").classList.add("hidden");
    $("stopSharing").classList.remove("hidden");
    // A V1 apenas demonstra a autorização; não transmite nem armazena coordenadas.
  }, error => {
    const messages = { 1: "Permissão negada. Para compartilhar, autorize a localização nas configurações do navegador.", 2: "Não foi possível determinar a localização.", 3: "A solicitação de localização expirou." };
    $("sharingStatus").textContent = messages[error.code] || "Não foi possível acessar a localização.";
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
});
$("stopSharing").addEventListener("click", () => {
  if (sharingWatch !== null) navigator.geolocation.clearWatch(sharingWatch);
  sharingWatch = null;
  $("sharingStatus").textContent = "Compartilhamento interrompido pelo usuário.";
  $("stopSharing").classList.add("hidden");
  $("startSharing").classList.remove("hidden");
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
checkInviteRoute();
