
```php
<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Listar todos os usuários
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'users') {
    $query = "SELECT id, nome, email, tipo, telefone, created_at FROM users ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// Vincular médico a especialidade
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'vincular') {
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "INSERT INTO medicos_especialidades (medico_id, especialidade_id) VALUES (:medico_id, :especialidade_id)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":medico_id", $data->medico_id);
    $stmt->bindParam(":especialidade_id", $data->especialidade_id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Erro ao vincular"]);
    }
}

// Deletar usuário
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Erro ao deletar usuário"]);
    }
}
?>
```

---