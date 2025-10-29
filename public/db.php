<?php
// MAMP defaults: MySQL runs on port 8889 with root/root
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = 'root';
$DB_NAME = 'Placements';
$DB_PORT = 8889;

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($conn->connect_error) {
  http_response_code(500);
  die('Database connection failed: ' . $conn->connect_error);
}
?>