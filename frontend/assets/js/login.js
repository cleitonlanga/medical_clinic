const API_URL = 'https://medical-clinic-b8lv.onrender.com/api'; 

        function showAlert(message, type) {
            const alertBox = document.getElementById('alertBox');
            alertBox.className = `alert alert-${type}`;
            alertBox.textContent = message;
            alertBox.style.display = 'block';
            setTimeout(() => {
                alertBox.style.display = 'none';
            }, 5000);
        }

        function saveUser(user) {
            localStorage.setItem('user', JSON.stringify(user));
        }

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            
            try {
                const response = await fetch(`${API_URL}/auth.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    saveUser(result.user);
                    showAlert('Login realizado com sucesso!', 'success');
                    
                    setTimeout(() => {
                        if (result.user.tipo === 'admin') {
                            window.location.href = 'admin-dashboard.html';
                        } else if (result.user.tipo === 'medico') {
                            window.location.href = 'medico-dashboard.html';
                        } else {
                            window.location.href = 'paciente-dashboard.html';
                        }
                    }, 1000);
                } else {
                    showAlert(result.error || 'Erro ao fazer login', 'error');
                }
            } catch (error) {
                showAlert('Erro de conexão com o servidor', 'error');
                console.error(error);
            }
        });