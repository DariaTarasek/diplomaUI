document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch("http://192.168.1.207:8080/api/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin' 
    });

    if (response.ok) {
        window.location.href = "/index.html";
    } else {
        alert("Ошибка входа");
    }
});
