document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  // Hardcoded credentials for demo
  const validUsername = 'admin';
  const validPassword = 'password123';

  if (username === validUsername && password === validPassword) {
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'dashboard.html';
  } else {
    errorMsg.textContent = 'Invalid username or password.';
  }
});
