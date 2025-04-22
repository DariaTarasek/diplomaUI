document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById('registrationForm');
  const password = form.password;
  const passwordCheck = form.password_check;
  const email = form.email;

  const passwordError = document.getElementById('passwordError');
  const passwordCheckError = document.getElementById('passwordCheckError');
  const emailError = document.getElementById('emailError');

  const roleSelect = document.getElementById('role');
  const doctorFields = document.getElementById('doctorFields');

  // Проверка роли
  roleSelect.addEventListener('change', function () {
    if (this.value === 'doctor') {
      doctorFields.style.display = 'block';
    } else {
      doctorFields.style.display = 'none';
    }
  });

// Валидация номера телефона
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');

    
    const validatePhone = () => {
        const digits = phoneInput.value.replace(/\D/g, '');

        if (digits.length !== 11) {
            phoneInput.classList.add('is-invalid');
            phoneError.textContent = 'Введите полный 11-значный номер телефона.';
            return
        } else {
            phoneInput.classList.remove('is-invalid');
            phoneError.textContent = '';
           return
        }
    };

    phoneInput.addEventListener('input', validatePhone);



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

  // Проверка email
  function validateEmail() {
    const value = email.value.trim();
    if (value.length === 0) {
      emailError.textContent = '';
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(value)) {
        email.classList.add('is-invalid');
        emailError.textContent = 'Некорректный email';
    } else {
        email.classList.remove('is-invalid');
        emailError.textContent = '';
    }
  }

  password.addEventListener('input', () => {
    validatePassword();
    validatePasswordMatch();
  });

  passwordCheck.addEventListener('input', validatePasswordMatch);
  email.addEventListener('input', validateEmail);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    validatePassword();
    validatePasswordMatch();
    validateEmail();

    if (
      passwordError.textContent ||
      passwordCheckError.textContent ||
      emailError.textContent
    ) {
      return;
    }

    const formData = {
      secondName: form.secondName.value,
      firstName: form.firstName.value,
      surname: form.surname.value,
      gender: form.gender.value,
      phone: form.phone.value,
      email: form.email.value,
      password: form.password.value,
      role: form.role.value,
      education: form.education.value,
      experience: form.experience.value
    };

    fetch('/employee-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (response.ok) {
          alert('Регистрация прошла успешно!');
          form.reset();
        } else {
          alert('Ошибка регистрации.');
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке данных.');
      });
  });
  });