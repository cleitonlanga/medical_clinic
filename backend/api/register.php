<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->nome) || empty($data->email) || empty($data->senha)) {
        echo json_encode(["error" => "Todos os campos são obrigatórios"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Verificar se email já existe
    $check = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($check);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["error" => "Email já cadastrado"]);
        exit;
    }

    $query = "INSERT INTO users (nome, email, senha, tipo, telefone) VALUES (:nome, :email, :senha, :tipo, :telefone)";
    $stmt = $db->prepare($query);

    $senha_hash = password_hash($data->senha, PASSWORD_DEFAULT);
    $tipo = $data->tipo ?? 'paciente';

    $stmt->bindParam(":nome", $data->nome);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":senha", $senha_hash);
    $stmt->bindParam(":tipo", $tipo);
    $stmt->bindParam(":telefone", $data->telefone);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Usuário cadastrado com sucesso"]);
    } else {
        echo json_encode(["error" => "Erro ao cadastrar usuário"]);
    }
}
?>