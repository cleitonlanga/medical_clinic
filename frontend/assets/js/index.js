 const API_URL = "http://localhost/medical-appointment-system/backend/api";
      const alertBox = document.getElementById("alertBox");

      function showAlert(msg, type = "success") {
        alertBox.className = `alert alert-${
          type === "success" ? "success" : "error"
        }`;
        alertBox.textContent = msg;
        alertBox.style.display = "block";
        setTimeout(() => (alertBox.style.display = "none"), 5000);
      }

      // NOTE: These assume backend endpoints:
      // POST ${API_URL}/auth.php {email, senha} -> returns { success:true, user:{id,nome,email,tipo,...} }
      // POST ${API_URL}/register.php {nome,email,senha,telefone,tipo:'paciente'} -> returns { success:true, user:... }

      document
        .getElementById("btnLogin")
        .addEventListener("click", async () => {
          const email = document.getElementById("loginEmail").value.trim();
          const senha = document.getElementById("loginSenha").value.trim();
          const tipo = document.getElementById("loginTipo").value;

          if (!email || !senha)
            return showAlert("Preencha email e senha", "error");

          try {
            const res = await fetch(`${API_URL}/auth.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, senha }),
            });
            const json = await res.json();
            if (json.success && json.user) {
              // enforce chosen role only if backend returns that role matches user.tipo
              // If backend does not return user, you may emulate locally.
              const user = json.user;
              // if user role doesn't match selected type, allow login but redirect according to user.tipo
              localStorage.setItem("user", JSON.stringify(user));
              if (user.tipo === "admin")
                window.location.href = "admin-dashboard.html";
              else if (user.tipo === "medico")
                window.location.href = "medico-dashboard.html";
              else window.location.href = "paciente-dashboard.html";
            } else {
              showAlert(json.error || "Credenciais inválidas", "error");
            }
          } catch (err) {
            showAlert("Erro de comunicação com o servidor", "error");
          }
        });

      document
        .getElementById("btnRegister")
        .addEventListener("click", async () => {
          const nome = document.getElementById("regNome").value.trim();
          const email = document.getElementById("regEmail").value.trim();
          const senha = document.getElementById("regSenha").value.trim();
          const telefone = document.getElementById("regTelefone").value.trim();

          if (!nome || !email || !senha)
            return showAlert("Preencha nome, email e senha", "error");

          try {
            const res = await fetch(`${API_URL}/register.php`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nome,
                email,
                senha,
                telefone,
                tipo: "paciente",
              }),
            });
            const json = await res.json();
            if (json.success && json.user) {
              localStorage.setItem("user", JSON.stringify(json.user));
              showAlert("Conta criada com sucesso!", "success");
              window.location.href = "paciente-dashboard.html";
            } else {
              showAlert(json.error || "Erro ao cadastrar", "error");
            }
          } catch (err) {
            showAlert("Erro de comunicação com o servidor", "error");
          }
        });

      // Guest quick-entry: create a temporary local user for demo (no backend)
      document.getElementById("btnGuest").addEventListener("click", () => {
        const demo = {
          id: 0,
          nome: "Convidado",
          email: "guest@local",
          tipo: "paciente",
        };
        localStorage.setItem("user", JSON.stringify(demo));
        window.location.href = "paciente-dashboard.html";
      });