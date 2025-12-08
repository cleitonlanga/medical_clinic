```php
<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "SELECT * FROM especialidades ORDER BY nome";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $especialidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($especialidades);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "INSERT INTO especialidades (nome, descricao) VALUES (:nome, :descricao)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":nome", $data->nome);
    $stmt->bindParam(":descricao", $data->descricao);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        echo json_encode(["error" => "Erro ao criar especialidade"]);
    }
}
?>
```

---
