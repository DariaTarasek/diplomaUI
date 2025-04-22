document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recoveryForm');
  const input = document.getElementById('login');
  const loginError = document.getElementById('loginError');

  input.addEventListener('input', () => {
    const value = input.value;

    // Проверка на похожесть на email
    if (value.includes('@') || /[a-zA-Z0-6]/.test(value)) return;

    // Маска телефона
    const digits = value.replace(/\D/g, '').substring(0, 11); // только цифры, макс 11
    let formatted = '';

    if (digits.startsWith('8')) {
      formatted = '+7';
    } else if (digits.startsWith('7')) {
      formatted = '+7';
    } else if (digits.startsWith('9')) {
      formatted = '+7';
    } else if (digits.startsWith('0')) {
      formatted = digits[0];
    }

    if (digits.length > 1) {
      formatted += ' (' + digits.slice(1, 4);
    }
    if (digits.length >= 5) {
      formatted += ') ' + digits.slice(4, 7);
    }
    if (digits.length >= 8) {
      formatted += '-' + digits.slice(7, 9);
    }
    if (digits.length >= 10) {
      formatted += '-' + digits.slice(9, 11);
    }

    input.value = formatted;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawValue = input.value.trim();

    // Проверка Email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawValue);

    // Проверка номера (нач. с 7, 11 символов)
    const digits = rawValue.replace(/()-+/g, '');
    const isPhone = digits.length === 11 && /^[7]/.test(digits);

    if (!isEmail && !isPhone) {
        loginError.textContent = 'Введены некорректные данные'
      return;
    } else {
        loginError.textContent = ''
    }

    const data = {
      contact: rawValue,
      type: isEmail ? 'email' : 'phone',
    };

    try {
      const response = await fetch('/api/password-recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('На указанный контакт отправлен код восстановления пароля.');
      } else {
        alert('Ошибка на сервере. Попробуйте позже.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сети.');
    }
  });
});
