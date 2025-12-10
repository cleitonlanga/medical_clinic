const API_URL = 'https://medical-clinic-zmwf.onrender.com';

// Armazenar usuário no localStorage
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Verificar autenticação
function checkAuth() {
    const user = getUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Funções de API
async function login(email, senha) {
    const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return await response.json();
}

async function register(data) {
    const response = await fetch(`${API_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function getEspecialidades() {
    const response = await fetch(`${API_URL}/especialidades.php`);
    return await response.json();
}

async function getMedicos(especialidadeId) {
    const url = especialidadeId 
        ? `${API_URL}/medicos.php?especialidade_id=${especialidadeId}`
        : `${API_URL}/medicos.php`;
    const response = await fetch(url);
    return await response.json();
}

async function getDisponibilidades(medicoId, data) {
    const response = await fetch(`${API_URL}/disponibilidades.php?medico_id=${medicoId}&data=${data}`);
    return await response.json();
}

async function criarConsulta(data) {
    const response = await fetch(`${API_URL}/consultas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function getConsultas(userId, tipo) {
    const response = await fetch(`${API_URL}/consultas.php?user_id=${userId}&tipo=${tipo}`);
    return await response.json();
}

async function updateConsultaStatus(id, status) {
    const response = await fetch(`${API_URL}/consultas.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
    });
    return await response.json();
}

async function cancelarConsulta(id) {
    const response = await fetch(`${API_URL}/consultas.php?id=${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}

// Funções admin
async function getUsers() {
    const response = await fetch(`${API_URL}/admin.php?action=users`);
    return await response.json();
}

async function createEspecialidade(nome, descricao) {
    const response = await fetch(`${API_URL}/especialidades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao })
    });
    return await response.json();
}

async function vincularMedicoEspecialidade(medicoId, especialidadeId) {
    const response = await fetch(`${API_URL}/admin.php?action=vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medico_id: medicoId, especialidade_id: especialidadeId })
    });
    return await response.json();
}

// Função para exibir alertas
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Formatar hora
function formatTime(timeString) {
    return timeString.substring(0, 5);
}