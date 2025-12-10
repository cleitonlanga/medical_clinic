<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
session_start();



$database = new Database();
$db = $database->getConnection();

// GET - Listar consultas
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    $tipo = $_GET['tipo'] ?? null;
    
    if ($tipo === 'medico') {
        $query = "SELECT c.*, p.nome as paciente_nome, p.telefone 
                  FROM consultas c
                  JOIN users p ON c.paciente_id = p.id
                  WHERE c.medico_id = :user_id
                  ORDER BY c.data_consulta DESC, c.hora_consulta DESC";
    } else if ($tipo === 'paciente') {
        $query = "SELECT c.*, m.nome as medico_nome, e.nome as especialidade
                  FROM consultas c
                  JOIN users m ON c.medico_id = m.id
                  LEFT JOIN medicos_especialidades me ON m.id = me.medico_id
                  LEFT JOIN especialidades e ON me.especialidade_id = e.id
                  WHERE c.paciente_id = :user_id
                  ORDER BY c.data_consulta DESC, c.hora_consulta DESC";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    $consultas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($consultas);
}

// POST - Criar consulta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "INSERT INTO consultas (paciente_id, medico_id, data_consulta, hora_consulta, observacoes) VALUES (:paciente_id, :medico_id, :data_consulta, :hora_consulta, :observacoes)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":paciente_id", $data->paciente_id);
    $stmt->bindParam(":medico_id", $data->medico_id);
    $stmt->bindParam(":data_consulta", $data->data_consulta);
    $stmt->bindParam(":hora_consulta", $data->hora_consulta);
    $stmt->bindParam(":observacoes", $data->observacoes);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        echo json_encode(["error" => "Erro ao agendar consulta"]);
    }
}

// PUT - Atualizar status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "UPDATE consultas SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":status", $data->status);
    $stmt->bindParam(":id", $data->id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Erro ao atualizar consulta"]);
    }
}

// DELETE - Cancelar consulta
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    $query = "UPDATE consultas SET status = 'cancelada' WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Erro ao cancelar consulta"]);
    }
}
?>
