```php
<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $especialidade_id = $_GET['especialidade_id'] ?? null;
    
    if ($especialidade_id) {
        $query = "SELECT DISTINCT u.id, u.nome, u.email, e.nome as especialidade 
                  FROM users u
                  JOIN medicos_especialidades me ON u.id = me.medico_id
                  JOIN especialidades e ON me.especialidade_id = e.id
                  WHERE u.tipo = 'medico' AND me.especialidade_id = :especialidade_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":especialidade_id", $especialidade_id);
    } else {
        $query = "SELECT id, nome, email FROM users WHERE tipo = 'medico'";
        $stmt = $db->prepare($query);
    }
    
    $stmt->execute();
    $medicos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($medicos);
}
?>
```

---
