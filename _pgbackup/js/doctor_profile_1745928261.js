const { createApp } = Vue;

createApp({
    data() {
        return {
            doctor: {
                second_name: '',
                first_name: '',
                surname: '',
                birthDate: '',
                gender: '',
                education: '',
                experience: '',
                phone: '',
                email: '',
            },
            showPasswordModal: false,
            newPassword: '',
            confirmPassword: '',
            newPasswordError: '',
            confirmPasswordError: '',
            isPopoverVisible: false, // добавили для поповера
        };
    },
    computed: {
        fullName() {
            return [
                this.doctor.second_name,
                this.doctor.first_name,
                this.doctor.surname
            ]
            .filter(Boolean)
            .join(' ');
        }
    },
    mounted() {
        this.fetchDoctorData();
        document.addEventListener('click', this.handleClickOutside);

    // добавка для тултипов:
    this.$nextTick(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    });
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        fetchDoctorData() {
            fetch('http://192.168.1.207:8080/api/doctor-profile')
                .then(response => response.json())
                .then(data => {
                    this.doctor = data;
                })
                .catch(error => {
                    console.error('Ошибка загрузки профиля:', error);
                });
        },
        changePassword() {
    this.newPasswordError = '';
    this.confirmPasswordError = '';

    const isStrongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(this.newPassword);
    if (!isStrongPassword) {
        this.newPasswordError = 'Пароль должен быть не менее 8 символов и содержать латинские буквы и цифры.';
        return;
    }

    if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordError = 'Пароли не совпадают';
        return;
    }

    fetch('http://192.168.1.207:8080/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.newPassword })
    })
    .then(response => {
        if (response.ok) {
            this.showPasswordModal = false;
            this.newPassword = '';
            this.confirmPassword = '';
            this.newPasswordError = '';
            this.confirmPasswordError = '';
        } else {
            this.newPasswordError = 'Ошибка при смене пароля';
        }
    });
},
        togglePopover() {
            this.isPopoverVisible = !this.isPopoverVisible;
        },
        handleClickOutside(event) {
            const popover = document.getElementById('doctor-profile');
            if (popover && !popover.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        }
    }
}).mount('#app');
