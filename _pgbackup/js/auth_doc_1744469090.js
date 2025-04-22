document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("login");
  const emailError = document.getElementById("emailError");

  form.addEventListener("submit", function (e) {
    const emailValue = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(emailValue)) {
        emailError.textContent = 'Некорректный email'
         e.preventDefault(); 
        return;
      } else {
        emailError.textContent = '';
      }
  });
});
