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
            isEditing: false,
            newPassword: '',
            confirmPassword: '',
            newPasswordError: '',
            confirmPasswordError: ''
        };
    },
    mounted() {
        this.fetchAdminData();
    },
    methods: {
        fetchAdminData() {
            fetch('http://192.168.1.207:8080/api/admin-profile')
                .then(response => response.json())
                .then(data => {
                    this.admin = data.profile;
                    this.userRole = data.role; // например: 'admin' или 'superadmin'
                })
                .catch(error => console.error('Ошибка загрузки профиля:', error));
        },
        saveProfile() {
            fetch('http://192.168.1.207:8080/api/update-admin-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.admin)
            })
            .then(response => {
                if (response.ok) {
                    this.isEditing = false;
                } else {
                    alert('Ошибка сохранения профиля');
                }
            });
        },
        changePassword() {
            this.validatePassword();

            if (this.newPasswordError || this.confirmPasswordError) return;

            fetch('http://192.168.1.207:8080/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: this.newPassword })
            })
            .then(response => {
                if (response.ok) {
                    alert('Пароль успешно изменен');
                    this.newPassword = '';
                    this.confirmPassword = '';
                } else {
                    alert('Ошибка при смене пароля');
                }
            });
        },
        validatePassword() {
            const strongRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (!this.newPassword) {
                this.newPasswordError = 'Введите новый пароль.';
            } else if (!strongRegex.test(this.newPassword)) {
                this.newPasswordError = 'Пароль должен содержать минимум 8 символов, включая буквы и цифры.';
            } else {
                this.newPasswordError = '';
            }

            if (this.confirmPassword !== this.newPassword) {
                this.confirmPasswordError = 'Пароли не совпадают.';
            } else {
                this.confirmPasswordError = '';
            }
        }
    }
}).mount('#app');
