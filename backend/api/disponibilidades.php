<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $medico_id = $_GET['medico_id'] ?? null;
    $data = $_GET['data'] ?? null;
    
    if ($medico_id && $data) {
        // Buscar disponibilidades do médico para o dia da semana
        $dia_semana = date('w', strtotime($data));
        $dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        $dia_nome = $dias[$dia_semana];
        
        $query = "SELECT * FROM disponibilidades WHERE medico_id = :medico_id AND dia_semana = :dia_semana";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":medico_id", $medico_id);
        $stmt->bindParam(":dia_semana", $dia_nome);
        $stmt->execute();
        
        $disponibilidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Buscar consultas já agendadas
        $query2 = "SELECT hora_consulta FROM consultas WHERE medico_id = :medico_id AND data_consulta = :data AND status != 'cancelada'";
        $stmt2 = $db->prepare($query2);
        $stmt2->bindParam(":medico_id", $medico_id);
        $stmt2->bindParam(":data", $data);
        $stmt2->execute();
        
        $horarios_ocupados = $stmt2->fetchAll(PDO::FETCH_COLUMN);
        
        echo json_encode([
            "disponibilidades" => $disponibilidades,
            "horarios_ocupados" => $horarios_ocupados
        ]);
    } else {
        echo json_encode(["error" => "Parâmetros inválidos"]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "INSERT INTO disponibilidades (medico_id, dia_semana, hora_inicio, hora_fim) VALUES (:medico_id, :dia_semana, :hora_inicio, :hora_fim)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":medico_id", $data->medico_id);
    $stmt->bindParam(":dia_semana", $data->dia_semana);
    $stmt->bindParam(":hora_inicio", $data->hora_inicio);
    $stmt->bindParam(":hora_fim", $data->hora_fim);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        echo json_encode(["error" => "Erro ao criar disponibilidade"]);
    }
}
?>
