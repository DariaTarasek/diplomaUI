const { createApp } = Vue;

createApp({
  data() {
    return {
      admin: {
        second_name: '',
        first_name: '',
        surname: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
      },
      userRole: '', // 'admin' или 'superadmin'
      showEmailModal: false,
      showPasswordModal: false,
      newEmail: '',
      newPassword: '',
      confirmPassword: '',
      newEmailError: '',
      newPasswordError: '',
      confirmPasswordError: '',
    };
  },
  mounted() {
    this.fetchAdminData();

    this.$nextTick(() => {
      const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltips.map(el => new bootstrap.Tooltip(el));
    });
  },
  methods: {
    fetchAdminData() {
      fetch('http://192.168.1.207:8080/api/admin-profile')
        .then(res => res.json())
        .then(data => {
          this.admin = data.profile;
          this.userRole = data.role;
        })
        .catch(err => console.error('Ошибка загрузки профиля:', err));
    },
    changeEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(this.newEmail)) {
        this.newEmailError = 'Некорректный формат email.';
        return;
      }
      fetch('http://192.168.1.207:8080/api/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.newEmail })
      })
        .then(res => {
          if (res.ok) {
            this.admin.email = this.newEmail;
            this.showEmailModal = false;
            this.newEmail = '';
          } else {
            alert('Ошибка при смене email');
          }
        });
    },
    changePassword() {
      const strongRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

      if (!this.newPassword || !strongRegex.test(this.newPassword)) {
        this.newPasswordError = 'Пароль должен содержать минимум 8 символов, включая буквы и цифры.';
        return;
      } else {
        this.newPasswordError = '';
      }

      if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordError = 'Пароли не совпадают.';
        return;
      } else {
        this.confirmPasswordError = '';
      }

      fetch('http://192.168.1.207:8080/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.newPassword })
      })
        .then(res => {
          if (res.ok) {
            this.showPasswordModal = false;
            this.newPassword = '';
            this.confirmPassword = '';
          } else {
            alert('Ошибка при смене пароля');
          }
        });
    },
    saveProfile() {
      fetch('http://192.168.1.207:8080/api/update-admin-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.admin)
      })
        .then(res => {
          if (!res.ok) alert('Ошибка при сохранении профиля');
        });
    }
  }
}).mount('#app');
