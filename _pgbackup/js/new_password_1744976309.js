document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById('newPasswordForm');
  const password = form.password;
  const passwordCheck = form.passwordCheck;

  const passwordError = document.getElementById('passwordError');
  const passwordCheckError = document.getElementById('passwordCheckError');

  // Проверка силы пароля
  function validatePassword() {
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password.value);
    if (!isValid) {
        password.classList.add('is-invalid');
        passwordError.textContent = 'Пароль должен быть не менее 8 символов и содержать латинские буквы и цифры.';
    } else {
        password.classList.remove('is-invalid');
        passwordError.textContent = '';
    }
  }

  // Проверка совпадения паролей
  function validatePasswordMatch() {
    if (passwordCheck.value === '') {
      passwordCheckError.textContent = '';
      return;
    }
    if (password.value !== passwordCheck.value) {
        passwordCheck.classList.add('is-invalid');
        passwordCheckError.textContent = 'Пароли не совпадают';
    } else {
        passwordCheck.classList.remove('is-invalid');
        passwordCheckError.textContent = '';
    }
  }

   password.addEventListener('input', () => {
    validatePassword();
    validatePasswordMatch();
  });

  passwordCheck.addEventListener('input', validatePasswordMatch);
  });