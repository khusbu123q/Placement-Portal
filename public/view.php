<?php
session_start();
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Location: login.php');
    exit;
}

if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

require_once __DIR__ . '/db.php';

$q = trim($_GET['q'] ?? '');
$sql = "SELECT id, registration_no, name, email, dob, program, interests, location, cgpa, cv_path, created_at
        FROM students";
$params = [];
$types = '';
if ($q !== '') {
  $sql .= " WHERE registration_no LIKE CONCAT('%', ?, '%')
            OR name LIKE CONCAT('%', ?, '%')
            OR email LIKE CONCAT('%', ?, '%')";
  $params = [$q, $q, $q];
  $types = 'sss';
}
$sql .= " ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
if ($types) { $stmt->bind_param($types, ...$params); }
$stmt->execute();
$res = $stmt->get_result();
$rows = $res->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submissions</title>
  <link rel="stylesheet" href="assets/styles.css" />
</head>
<body>
  <div class="table-wrap">
    <h2>Student Submissions</h2>
    <form class="filter" method="get">
      <input type="search" name="q" placeholder="Search reg no / name / email" value="<?= htmlspecialchars($q) ?>" />
      <button class="btn" type="submit">Search</button>
      <p><a href="logout.php" class="btn secondary">Logout</a></p>
      <a class="btn secondary" href="index.html">New submission</a>
    </form>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Reg. No</th>
            <th>Name</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Program</th>
            <th>Interests</th>
            <th>Location</th>
            <th>CGPA</th>
            <th>CV</th>
            <th>Created</th>
            <th>Actions</th> 
          </tr>
        </thead>
        <tbody>
        <?php if (empty($rows)): ?>
          <tr><td colspan="11">No records found.</td></tr>
        <?php else: ?>
          <?php foreach ($rows as $i => $r): ?>
            <tr>
              <td><?= $i+1 ?></td>
              <td><?= htmlspecialchars($r['registration_no']) ?></td>
              <td><?= htmlspecialchars($r['name']) ?></td>
              <td><?= htmlspecialchars($r['email']) ?></td>
              <td><?= htmlspecialchars($r['dob']) ?></td>
              <td><span class="badge"><?= htmlspecialchars($r['program']) ?></span></td>
              <td><?= htmlspecialchars($r['interests']) ?></td>
              <td><?= htmlspecialchars($r['location']) ?></td>
              <td><?= htmlspecialchars($r['cgpa']) ?></td>
              <td><?php if($r['cv_path']): ?><a href="<?= htmlspecialchars($r['cv_path']) ?>" target="_blank">PDF</a><?php endif; ?></td>
              <td><?= htmlspecialchars($r['created_at']) ?></td>
              <td>
                <form method="post" action="delete.php" onsubmit="return confirm('Delete this record permanently?');" style="display:inline">
                  <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
                  <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf']) ?>">
                  <button type="submit" class="btn danger">Delete</button>
                </form>
              </td>

            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
