<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
require_once '../config/database.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->email) || empty($data->senha)) {
        echo json_encode(["error" => "Email e senha são obrigatórios"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

  

    $query = "SELECT id, nome, email, tipo, senha FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
 

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->senha, $row['senha'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_tipo'] = $row['tipo'];
            
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $row['id'],
                    "nome" => $row['nome'],
                    "email" => $row['email'],
                    "tipo" => $row['tipo']
                ]
            ]);
        } else {
            echo json_encode(["error" => "Email ou Senha incorreta"]);
        }
    } else {
        echo json_encode(["error" => "Usuário não encontrado"]);
    }
}
?>
