<?php
class Database {
    private $host = "localhost";
    private $db_name = "sistema_consultas";
    private $username = "root";
    private $password = "";
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8mb4");

        } catch(PDOException $e) {
            error_log("Erro de conexão: " . $e->getMessage());
            echo json_encode(["error" => "Erro na conexão com o banco de dados"]);
            return null;
        }
        return $this->conn;
    }
}

?>


