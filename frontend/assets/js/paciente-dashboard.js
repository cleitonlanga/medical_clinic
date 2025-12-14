const API_URL = "https://medical-clinic-qwnh.onrender.com/api";
const user = (() => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
})();

function requireAuth() {
  if (!user) {
    window.location.href = "index.html";
  } else if (user.tipo !== "paciente") {
    // redirect to correct dashboard if wrong role
    if (user.tipo === "medico") window.location.href = "medico-dashboard.html";
    if (user.tipo === "admin") window.location.href = "admin-dashboard.html";
  }
  document.getElementById("userName").textContent = user?.nome || "";
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function showAlert(msg, type = "success") {
  const box = document.getElementById("alertBox");
  box.className = `alert alert-${type === "success" ? "success" : "error"}`;
  box.textContent = msg;
  box.style.display = "block";
  setTimeout(() => (box.style.display = "none"), 5000);
}

requireAuth();

// state
let selectedTime = null;
let selectedMedico = null;

// UI refs
const selectEspecialidade = document.getElementById("selectEspecialidade");
const selectMedico = document.getElementById("selectMedico");
const inputData = document.getElementById("inputData");
const timesContainer = document.getElementById("timesContainer");
const btnAgendar = document.getElementById("btnAgendar");
const resMedico = document.getElementById("resMedico");
const resData = document.getElementById("resData");
const resHora = document.getElementById("resHora");
const btnClear = document.getElementById("btnClearSelection");

// load especialidades
async function loadEspecialidades() {
  try {
    const res = await fetch(`${API_URL}/especialidades.php`);
    const data = await res.json();
    selectEspecialidade.innerHTML = '<option value="">Selecione...</option>';
    data.forEach((e) => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.nome;
      selectEspecialidade.appendChild(opt);
    });
  } catch (err) {
    selectEspecialidade.innerHTML =
      '<option value="">Erro ao carregar</option>';
  }
}

// load medicos filtered by especialidade
async function loadMedicos(especialidadeId) {
  try {
    const url = especialidadeId
      ? `${API_URL}/medicos.php?especialidade_id=${especialidadeId}`
      : `${API_URL}/medicos.php`;
    const res = await fetch(url);
    const data = await res.json();
    selectMedico.innerHTML = '<option value="">Selecione o médico...</option>';
    data.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent =
        m.nome + (m.especialidade ? ` — ${m.especialidade}` : "");
      selectMedico.appendChild(opt);
    });
  } catch (err) {
    selectMedico.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

// load available times for medico + date
async function loadDisponibilidades(medicoId, dataISO) {
  timesContainer.innerHTML =
    '<div style="color:#777">Carregando horários...</div>';
  selectedTime = null;
  resHora.textContent = "—";
  try {
    const url = `${API_URL}/disponibilidades.php?medico_id=${medicoId}&data=${dataISO}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.error) {
      timesContainer.innerHTML = `<div style="color:#b00">${json.error}</div>`;
      return;
    }

    // Build a list of times from disponibilidades (hora_inicio .. hora_fim in time slots of 30 minutes)
    const disponibilidades = json.disponibilidades || [];
    const ocupados = json.horarios_ocupados || [];
    const slots = [];

    disponibilidades.forEach((d) => {
      const start = d.hora_inicio;
      const end = d.hora_fim;
      // create 30-min slots between start and end
      let [h, s] = start.split(":").map(Number);
      let [he, se] = end.split(":").map(Number);
      let cur = new Date(
        `${dataISO}T${String(h).padStart(2, "0")}:${String(s).padStart(
          2,
          "0"
        )}:00`
      );
      const endDate = new Date(
        `${dataISO}T${String(he).padStart(2, "0")}:${String(se).padStart(
          2,
          "0"
        )}:00`
      );
      while (cur < endDate) {
        const hh = String(cur.getHours()).padStart(2, "0");
        const mm = String(cur.getMinutes()).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
        cur.setMinutes(cur.getMinutes() + 30);
      }
    });

    // filter out occupied times
    const available = slots.filter((t) => !ocupados.includes(t));

    if (available.length === 0) {
      timesContainer.innerHTML =
        '<div style="color:#777">Nenhum horário disponível.</div>';
      return;
    }

    timesContainer.innerHTML = "";
    available.forEach((t) => {
      const div = document.createElement("div");
      div.className = "time";
      div.textContent = t;
      div.onclick = () => {
        document
          .querySelectorAll(".time")
          .forEach((x) => x.classList.remove("selected"));
        div.classList.add("selected");
        selectedTime = t;
        resHora.textContent = t;
      };
      timesContainer.appendChild(div);
    });
  } catch (err) {
    timesContainer.innerHTML =
      '<div style="color:#b00">Erro ao carregar horários</div>';
  }
}

// book appointment
btnAgendar.addEventListener("click", async () => {
  if (!selectedMedico) return showAlert("Selecione um médico.", "error");
  if (!inputData.value) return showAlert("Escolha uma data.", "error");
  if (!selectedTime) return showAlert("Selecione um horário.", "error");

  const payload = {
    paciente_id: user.id,
    medico_id: selectedMedico,
    data_consulta: inputData.value,
    hora_consulta: selectedTime,
    observacoes: document.getElementById("observacoes").value || "",
  };

  try {
    const res = await fetch(`${API_URL}/consultas.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      showAlert("Consulta agendada com sucesso!", "success");
      loadHistory();
      // refresh times to remove the booked slot
      loadDisponibilidades(selectedMedico, inputData.value);
      clearSelection();
    } else {
      showAlert(json.error || "Erro ao agendar", "error");
    }
  } catch (err) {
    showAlert("Erro de comunicação com o servidor", "error");
  }
});

// clear selection
function clearSelection() {
  selectedTime = null;
  resHora.textContent = "—";
  resMedico.textContent = "—";
  resData.textContent = "—";
  document.getElementById("observacoes").value = "";
  document
    .querySelectorAll(".time")
    .forEach((x) => x.classList.remove("selected"));
}
btnClear.addEventListener("click", clearSelection);

// update summary when selections change
selectMedico.addEventListener("change", (e) => {
  selectedMedico = e.target.value || null;
  const opt = e.target.selectedOptions[0];
  resMedico.textContent = opt ? opt.textContent : "—";
  if (selectedMedico && inputData.value)
    loadDisponibilidades(selectedMedico, inputData.value);
});

selectEspecialidade.addEventListener("change", (e) => {
  const id = e.target.value || null;
  loadMedicos(id);
});

inputData.addEventListener("change", () => {
  resData.textContent = inputData.value
    ? new Date(inputData.value).toLocaleDateString("pt-BR")
    : "—";
  if (selectedMedico && inputData.value)
    loadDisponibilidades(selectedMedico, inputData.value);
});

// history loading
async function loadHistory() {
  const tbody = document.getElementById("historyBody");
  tbody.innerHTML =
    '<tr><td colspan="5" style="text-align:center">Carregando...</td></tr>';
  try {
    const res = await fetch(
      `${API_URL}/consultas.php?user_id=${user.id}&tipo=paciente`
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center">Nenhuma consulta encontrada</td></tr>';
      return;
    }
    tbody.innerHTML = data
      .map((c) => {
        const statusClass = `status-${c.status}`;
        const date = new Date(c.data_consulta).toLocaleDateString("pt-BR");
        const actions =
          c.status !== "cancelada" && c.status !== "concluida"
            ? `<button class="btn" onclick="cancelConsulta(${c.id})" style="background:#f8d7da; margin-right:6px;">Cancelar</button>`
            : "";
        return `<tr>
                        <td>${date}</td>
                        <td>${c.hora_consulta}</td>
                        <td>${c.medico_nome || "—"}</td>
                        <td><span class="badge ${statusClass}">${
          c.status
        }</span></td>
                        <td>${actions}</td>
                    </tr>`;
      })
      .join("");
  } catch (err) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center">Erro ao carregar histórico</td></tr>';
  }
}

// cancel consulta
async function cancelConsulta(id) {
  if (!confirm("Deseja cancelar esta consulta?")) return;
  try {
    const res = await fetch(`${API_URL}/consultas.php?id=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      showAlert("Consulta cancelada", "success");
      loadHistory();
      if (selectedMedico && inputData.value)
        loadDisponibilidades(selectedMedico, inputData.value);
    } else {
      showAlert(json.error || "Erro ao cancelar", "error");
    }
  } catch (err) {
    showAlert("Erro de comunicação", "error");
  }
}

// init
(function init() {
  loadEspecialidades();
  loadMedicos(null);
  loadHistory();
})();
