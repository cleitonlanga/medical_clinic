CREATE DATABASE IF NOT EXISTS sistema_consultas;
USE sistema_consultas;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('paciente', 'medico', 'admin') NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de especialidades
CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela relação médico-especialidade
CREATE TABLE medicos_especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medico_id INT NOT NULL,
    especialidade_id INT NOT NULL,
    FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
);

-- Tabela de disponibilidades
CREATE TABLE disponibilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medico_id INT NOT NULL,
    dia_semana ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de consultas
CREATE TABLE consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    data_consulta DATE NOT NULL,
    hora_consulta TIME NOT NULL,
    status ENUM('agendada', 'confirmada', 'cancelada', 'concluida') DEFAULT 'agendada',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir admin padrão (senha: admin123)
INSERT INTO users (nome, email, senha, tipo) VALUES 
('Administrador', 'admin@sistema.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Inserir especialidades exemplo
INSERT INTO especialidades (nome, descricao) VALUES 
('Cardiologia', 'Especialidade médica que trata do coração'),
('Dermatologia', 'Especialidade que cuida da saúde da pele'),
('Ortopedia', 'Especialidade que trata do sistema músculo-esquelético'),
('Pediatria', 'Especialidade dedicada à saúde infantil');
```