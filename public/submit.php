<?php
// Handle form submission: validate, save file, insert DB
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/db.php';

function sanitize($s){
  return trim($s ?? '');
}

$registration_no = sanitize($_POST['registration_no'] ?? '');
$name            = sanitize($_POST['name'] ?? '');
$email           = sanitize($_POST['email'] ?? '');
$dob             = sanitize($_POST['dob'] ?? '');
$program         = sanitize($_POST['program'] ?? '');
$location        = sanitize($_POST['location'] ?? '');
$cgpa            = sanitize($_POST['cgpa'] ?? '');
$interestsArr    = $_POST['interests'] ?? [];
$interests       = is_array($interestsArr) ? implode(', ', array_slice($interestsArr, 0, 2)) : '';

if (!$registration_no || !$name || !$email || !$dob || !$program) {
  http_response_code(400);
  echo '<div class="message error">Missing required fields.</div>';
  exit;
}

// Upload CV if provided
$cv_path = NULL;
if (!empty($_FILES['cv']['name'])) {
  $allowed = ['pdf' => 'application/pdf'];
  $fileTmp = $_FILES['cv']['tmp_name'];
  $fileName = basename($_FILES['cv']['name']);
  $fileType = mime_content_type($fileTmp);
  $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  if (!in_array($fileType, $allowed) || $ext !== 'pdf') {
    echo '<div class="message error">CV must be a PDF.</div>';
    exit;
  }
  if ($_FILES['cv']['size'] > 8*1024*1024) { // 8MB
    echo '<div class="message error">CV file too large (max 8MB).</div>';
    exit;
  }
  $safeName = preg_replace('/[^a-zA-Z0-9._-]+/', '_', $registration_no . '_' . $fileName);
  $dest = __DIR__ . '/uploads/' . $safeName;
  if (!move_uploaded_file($fileTmp, $dest)) {
    echo '<div class="message error">Failed to save CV.</div>';
    exit;
  }
  $cv_path = 'uploads/' . $safeName;
}

// Insert into DB (use INSERT ... ON DUPLICATE KEY UPDATE by unique registration_no)
$sql = "INSERT INTO students (registration_no, name, email, dob, program, interests, location, cgpa, cv_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name), email=VALUES(email), dob=VALUES(dob), program=VALUES(program),
          interests=VALUES(interests), location=VALUES(location), cgpa=VALUES(cgpa),
          cv_path=IFNULL(VALUES(cv_path), cv_path)";
$stmt = $conn->prepare($sql);
$cgpaVal = ($cgpa === '' ? NULL : $cgpa);

$stmt->bind_param(
    "sssssssss",
    $registration_no,
    $name,
    $email,
    $dob,
    $program,
    $interests,
    $location,
    $cgpaVal,
    $cv_path
);

if (!$stmt->execute()) {
  echo '<div class="message error">DB error: ' . htmlspecialchars($stmt->error) . '</div>';
  exit;
}

$stmt->close();
$conn->close();

header('Location: success.html');
exit;
?>