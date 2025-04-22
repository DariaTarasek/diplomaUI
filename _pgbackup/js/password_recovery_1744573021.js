document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recoveryForm');
  const input = document.getElementById('login');
  const loginError = document.getElementById('loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawValue = input.value.trim();

    // Проверка Email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawValue);

    // Проверка номера (нач. с 7, 11 символов)
    const digits = rawValue.replace(/[()\-\+]/g, '');
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
