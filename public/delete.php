<?php
// delete.php – deletes a student row by id, also removes uploaded CV file (if any)

session_start();
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Location: login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: view.php?ok=0&msg=Invalid+request+method');
    exit;
}

// CSRF check
if (empty($_POST['csrf']) || !hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'])) {
    header('Location: view.php?ok=0&msg=Invalid+CSRF+token');
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) {
    header('Location: view.php?ok=0&msg=Invalid+ID');
    exit;
}

require_once __DIR__ . '/db.php';

// 1) Fetch cv_path so we can delete file after row removal
$cvPath = null;
$stmt = $conn->prepare("SELECT cv_path FROM students WHERE id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$stmt->bind_result($cvPath);
$found = $stmt->fetch();
$stmt->close();

if (!$found) {
    $conn->close();
    header('Location: view.php?ok=0&msg=Record+not+found');
    exit;
}

// 2) Delete the row
$del = $conn->prepare("DELETE FROM students WHERE id = ?");
$del->bind_param('i', $id);
$ok = $del->execute();
$err = $del->error;
$del->close();
$conn->close();

// 3) Remove the file if present
if ($ok && $cvPath) {
    $file = __DIR__ . '/' . $cvPath;
    if (is_file($file)) { @unlink($file); }
}

if ($ok) {
    header('Location: view.php?ok=1&msg=Record+deleted');
} else {
    header('Location: view.php?ok=0&msg=' . urlencode('Delete failed: ' . $err));
}
exit;
