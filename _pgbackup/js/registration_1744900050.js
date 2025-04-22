document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById('registrationForm');
  const password = form.password;
  const passwordCheck = form.password_check;
  const email = form.email;

  const passwordError = document.getElementById('passwordError');
  const passwordCheckError = document.getElementById('passwordCheckError');
  const emailError = document.getElementById('emailError');

  // Проверка даты 
  const dateInput = document.getElementById("birthDate");
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const minDate = `${yyyy - 110}-${mm}-${dd}`;
    const maxDate = `${yyyy - 18}-${mm}-${dd - 1}`;
    dateInput.min = minDate;
    dateInput.max = maxDate;
  }

  // Проверка силы пароля
  function validatePassword() {
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password.value);
    if (!isValid) {
      passwordError.textContent = 'Пароль должен быть не менее 8 символов и содержать латинские буквы и цифры.';
    } else {
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
      passwordCheckError.textContent = 'Пароли не совпадают';
    } else {
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
      emailError.textContent = 'Некорректный email';
    } else {
      emailError.textContent = '';
    }
  }

  password.addEventListener('input', () => {
    validatePassword();
    validatePasswordMatch();
  });

  passwordCheck.addEventListener('input', validatePasswordMatch);
  email.addEventListener('input', validateEmail);

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

    // Проверка на лету
    phoneInput.addEventListener('input', validatePhone);
});

  // Подтверждение номера телефона 
  const requestCodeBtn = document.getElementById('requestCodeBtn');
  const verifyCodeBtn = document.getElementById('verifyCodeBtn');
  const codeSection = document.getElementById('codeSection');
  const codeInput = document.getElementById('smsCode');
  const codeMessage = document.getElementById('codeMessage');
  const phoneField = document.getElementById('phone');

  let phoneVerified = false;
  let verifiedPhoneNumber = '';

  // Запросить код
  requestCodeBtn.addEventListener('click', () => {
    const phone = phoneField.value.trim();

    if (!phone) {
      codeMessage.textContent = 'Введите номер телефона';
      return;
    }

    fetch('http://192.168.1.207:8080/api/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
      .then(res => {
        if (res.ok) {
          phoneField.readOnly = true;
          verifiedPhoneNumber = phone;
          codeSection.style.display = 'block';
          codeMessage.textContent = 'Код отправлен на номер.';
          codeMessage.classList.remove('text-danger');
          codeMessage.classList.add('text-success');
        } else {
          codeMessage.textContent = 'Ошибка при отправке кода.';
          codeMessage.classList.remove('text-success');
          codeMessage.classList.add('text-danger');
        }
      })
      .catch(() => {
        codeMessage.textContent = 'Ошибка сети при отправке кода.';
        codeMessage.classList.remove('text-success');
        codeMessage.classList.add('text-danger');
      });
  });

  // Подтверждение кода
  verifyCodeBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();

    if (!code || !verifiedPhoneNumber) {
      codeMessage.textContent = 'Введите код';
      codeMessage.classList.remove('text-success');
      codeMessage.classList.add('text-danger');
      return;
    }


    fetch('http://192.168.1.207:8080/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: verifiedPhoneNumber, code })
    })
      .then(res => {
        if (res.ok) {
          codeMessage.textContent = 'Телефон подтвержден!';
          codeMessage.classList.remove('text-danger');
          codeMessage.classList.add('text-success');
          phoneVerified = true;
        } else {
          codeMessage.textContent = 'Неверный код.';
          codeMessage.classList.remove('text-success');
          codeMessage.classList.add('text-danger');
        }
      })
      .catch(() => {
        codeMessage.textContent = 'Ошибка проверки кода.';
        codeMessage.classList.remove('text-success');
        codeMessage.classList.add('text-danger');
      });
  });

  //  Отправка формы 
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

    if (!phoneVerified) {
      alert('Подтвердите номер телефона перед регистрацией.');
      return;
    }

    const formData = {
      secondName: form.secondName.value,
      firstName: form.firstName.value,
      surname: form.surname.value,
      gender: form.gender.value,
      birthDate: form.birthDate.value,
      phone: verifiedPhoneNumber,
      email: form.email.value,
      password: form.password.value
    };

    fetch('http://192.168.1.207:8080/api/register', {
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
          phoneField.readOnly = false;
          phoneVerified = false;
          verifiedPhoneNumber = '';
          codeSection.style.display = 'none';
          codeInput.value = '';
          codeMessage.textContent = '';
          requestCodeBtn.disabled = false;
        } else {
          alert('Ошибка регистрации.');
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке данных.');
      });
  });
