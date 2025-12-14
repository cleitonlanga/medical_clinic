const API_URL = 'https://medical-clinic-qwnh.onrender.com/api';
        const user = (() => {
            try { return JSON.parse(localStorage.getItem('user')); } catch(e) { return null; }
        })();

        function requireAuth(){
            if (!user) return window.location.href = 'index.html';
            if (user.tipo !== 'medico') {
                if (user.tipo === 'paciente') window.location.href = 'paciente-dashboard.html';
                if (user.tipo === 'admin') window.location.href = 'admin-dashboard.html';
            }
            document.getElementById('userName').textContent = user?.nome || '';
        }
        function logout(){ localStorage.removeItem('user'); window.location.href = 'index.html'; }
        function showAlert(msg, type='success'){ const box=document.getElementById('alertBox'); box.className=`alert alert-${type==='success'?'success':'error'}`; box.textContent=msg; box.style.display='block'; setTimeout(()=>box.style.display='none',5000); }

        requireAuth();

        const filterDate = document.getElementById('filterDate');
        const btnLoad = document.getElementById('btnLoad');
        const btnToday = document.getElementById('btnToday');
        const agendaContainer = document.getElementById('agendaContainer');

        btnToday.addEventListener('click', ()=> {
            const today = new Date().toISOString().slice(0,10);
            filterDate.value = today;
            loadAgenda(today);
        });

        btnLoad.addEventListener('click', ()=> {
            if (!filterDate.value) return showAlert('Escolha uma data', 'error');
            loadAgenda(filterDate.value);
        });

        // load agenda (all future/past depending on date filter). We'll request server: GET consultas.php?user_id=..&tipo=medico
        async function loadAgenda(dateFilter=null){
            agendaContainer.innerHTML = '<div class="card">Carregando agenda...</div>';
            try {
                const res = await fetch(`${API_URL}/consultas.php?user_id=${user.id}&tipo=medico`);
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    agendaContainer.innerHTML = '<div class="card">Nenhuma consulta na agenda</div>';
                    return;
                }

                // optionally filter by date
                const filtered = dateFilter ? data.filter(c => c.data_consulta === dateFilter) : data;

                // group by date (descending)
                const grouped = {};
                filtered.forEach(c => {
                    if (!grouped[c.data_consulta]) grouped[c.data_consulta] = [];
                    grouped[c.data_consulta].push(c);
                });

                const dates = Object.keys(grouped).sort((a,b)=> new Date(a)-new Date(b));
                if (dates.length === 0) {
                    agendaContainer.innerHTML = '<div class="card">Nenhuma consulta para a data selecionada</div>';
                    return;
                }

                agendaContainer.innerHTML = dates.map(date => {
                    const items = grouped[date].map(c => {
                        const statusClass = `status-${c.status}`;
                        const patientInfo = `<div class="info"><strong>${c.paciente_nome}</strong><div style="color:#666;font-size:13px">${c.paciente_telefone || 'Telefone não informado'}</div></div>`;
                        const actions = `
                            ${c.status !== 'confirmada' && c.status !== 'concluida' && c.status !== 'cancelada' ? `<button class="btn" onclick="updateStatus(${c.id}, 'confirmada')">Confirmar</button>` : ''}
                            ${c.status !== 'concluida' && c.status !== 'cancelada' ? `<button class="btn" onclick="updateStatus(${c.id}, 'concluida')" style="background:#28a745;color:#fff;margin-left:8px">Concluir</button>` : ''}
                            ${c.status !== 'cancelada' ? `<button class="btn" onclick="cancelConsulta(${c.id})" style="background:#f8d7da;margin-left:8px">Cancelar</button>` : ''}
                        `;
                        return `<div class="consulta">
                                    <div class="left">
                                        <div style="font-weight:700">${c.hora_consulta}</div>
                                        ${patientInfo}
                                    </div>
                                    <div style="display:flex;align-items:center;gap:12px">
                                        <div class="badge ${statusClass}">${c.status}</div>
                                        <div style="min-width:200px; text-align:right">${actions}</div>
                                    </div>
                                </div>`;
                    }).join('');
                    const formattedDate = new Date(date).toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });
                    return `<div class="card agenda-day"><h3 style="margin-bottom:8px">${formattedDate}</h3>${items}</div>`;
                }).join('');

            } catch (err) {
                agendaContainer.innerHTML = '<div class="card">Erro ao carregar agenda</div>';
            }
        }

        // update status (PUT)
        async function updateStatus(id, status) {
            try {
                const res = await fetch(`${API_URL}/consultas.php`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ id, status })
                });
                const json = await res.json();
                if (json.success) {
                    showAlert('Status atualizado', 'success');
                    loadAgenda(filterDate.value || null);
                } else showAlert(json.error || 'Erro ao atualizar', 'error');
            } catch (err) {
                showAlert('Erro de comunicação', 'error');
            }
        }

        async function cancelConsulta(id) {
            if (!confirm('Deseja cancelar esta consulta?')) return;
            try {
                const res = await fetch(`${API_URL}/consultas.php?id=${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (json.success) {
                    showAlert('Consulta cancelada', 'success');
                    loadAgenda(filterDate.value || null);
                } else showAlert(json.error || 'Erro ao cancelar', 'error');
            } catch (err) {
                showAlert('Erro de comunicação', 'error');
            }
        }

        (function init() {
            const today = new Date().toISOString().slice(0,10);
            filterDate.value = today;
            loadAgenda();
        })();