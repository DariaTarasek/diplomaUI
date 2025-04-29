const { createApp } = Vue;

createApp({
    data() {
        return {
            patient: {
                second_name: '',
                first_name: '',
                surname: '',
                birthDate: '',
                gender: '',
                phone: '',
                email: '',
            },
            showEmailModal: false,
            showPasswordModal: false,
            newEmail: '',
            newPassword: '',
            confirmPassword: ''
        };
    },
    mounted() {
        this.fetchPatientData();
    },
    methods: {
        fetchPatientData() {
            fetch('/api/patient-profile') // сюда вставить твой API-адрес
                .then(response => response.json())
                .then(data => {
                    this.patient = data;
                })
                .catch(error => {
                    console.error('Ошибка загрузки профиля:', error);
                });
        },
        changeEmail() {
            fetch('/api/change-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.newEmail })
            })
            .then(response => {
                if (response.ok) {
                    this.patient.email = this.newEmail;
                    this.showEmailModal = false;
                    this.newEmail = '';
                } else {
                    alert('Ошибка при смене email');
                }
            });
        },
        changePassword() {
            if (this.newPassword !== this.confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }
            fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: this.newPassword })
            })
            .then(response => {
                if (response.ok) {
                    this.showPasswordModal = false;
                    this.newPassword = '';
                    this.confirmPassword = '';
                } else {
                    alert('Ошибка при смене пароля');
                }
            });
        }
    }
}).mount('#app');

