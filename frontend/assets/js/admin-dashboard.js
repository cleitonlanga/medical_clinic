const API_URL = "https://medical-clinic-qwnh.onrender.com/api";

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function requireAuth() {
  if (!user) {
    window.location.href = "login.html";
  } else if (user.tipo !== "admin") {
    // redirect to correct dashboard if wrong role
    if (user.tipo === "medico") window.location.href = "medico-dashboard.html";
    if (user.tipo === "paciente") window.location.href = "paciente-dashboard.html";
  }
  document.getElementById('userName').textContent = user?.nome || '';
}


function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function showAlert(message, type) {
  const alertBox = document.getElementById("alertBox");
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 5000);
}



const user = getUser();
requireAuth();

document.getElementById("userName").textContent = user.nome;

// Cadastrar especialidade
document
  .getElementById("especialidadeForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeEsp").value;
    const descricao = document.getElementById("descricaoEsp").value;

    const response = await fetch(`${API_URL}/especialidades.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao }),
    });

    const result = await response.json();

    if (result.success) {
      showAlert("Especialidade cadastrada com sucesso!", "success");
      document.getElementById("especialidadeForm").reset();
      loadEspecialidades();
    } else {
      showAlert(result.error || "Erro ao cadastrar", "error");
    }
  });

// Vincular médico a especialidade
document
  .getElementById("vincularForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const medicoId = document.getElementById("medicoVinc").value;
    const especialidadeId = document.getElementById("especialidadeVinc").value;

    const response = await fetch(`${API_URL}/admin.php?action=vincular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medico_id: medicoId,
        especialidade_id: especialidadeId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showAlert("Médico vinculado à especialidade com sucesso!", "success");
      document.getElementById("vincularForm").reset();
    } else {
      showAlert(
        result.error || "Erro ao vincular. Talvez já esteja vinculado.",
        "error"
      );
    }
  });

// Carregar médicos
async function loadMedicos() {
  const response = await fetch(`${API_URL}/medicos.php`);
  const medicos = await response.json();
  const select = document.getElementById("medicoVinc");
  select.innerHTML = '<option value="">Selecione...</option>';

  medicos.forEach((med) => {
    const option = document.createElement("option");
    option.value = med.id;
    option.textContent = med.nome;
    select.appendChild(option);
  });
}

// Carregar especialidades
async function loadEspecialidades() {
  const response = await fetch(`${API_URL}/especialidades.php`);
  const especialidades = await response.json();
  const select = document.getElementById("especialidadeVinc");
  select.innerHTML = '<option value="">Selecione...</option>';

  especialidades.forEach((esp) => {
    const option = document.createElement("option");
    option.value = esp.id;
    option.textContent = esp.nome;
    select.appendChild(option);
  });
}

// Carregar usuários
async function loadUsers() {
  const response = await fetch(`${API_URL}/admin.php?action=users`);
  const users = await response.json();
  const tbody = document.getElementById("usersList");

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center;">Nenhum usuário cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map(
      (u) => `
                <tr>
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td><span class="badge badge-${u.tipo}">${u.tipo}</span></td>
                    <td>${u.telefone || "Não informado"}</td>
                    <td>${new Date(u.created_at).toLocaleDateString(
                      "pt-BR"
                    )}</td>
                </tr>
            `
    )
    .join("");
}

// Inicializar
loadMedicos();
loadEspecialidades();
loadUsers();
