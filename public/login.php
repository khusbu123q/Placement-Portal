<?php
session_start();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    if ($password === 'khusbu123@') {
        $_SESSION['authenticated'] = true;
        header('Location: view.php');
        exit;
    } else {
        $error = 'Invalid password!';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<div class="container">
    <h1>Protected Page</h1>
    <?php if ($error): ?>
        <p style="color:red;"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    <form method="post">
        <label>Password:</label>
        <input type="password" name="password" required>
        <button type="submit" class="btn">Login</button>
    </form>
</div>
</body>
</html>
