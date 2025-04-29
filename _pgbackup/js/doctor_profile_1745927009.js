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
                education: '',
                experience: '',
                phone: '',
                email: '',
            },
            showPasswordModal: false,
            newPassword: '',
            confirmPassword: '',
            isPopoverVisible: false, // добавили для поповера
            activeTab: 'upcoming',
            tabs: [
                { id: 'upcoming', label: 'Предстоящие записи' },
                { id: 'history', label: 'История посещений' },
                { id: 'tests', label: 'Анализы / Исследования' }
            ],
            data: {
                upcoming: [],
                history: [],
                tests: []
            }
        };
    },
    computed: {
        fullName() {
            return [
                this.patient.second_name,
                this.patient.first_name,
                this.patient.surname
            ]
            .filter(Boolean)
            .join(' ');
        }
    },
    mounted() {
        this.fetchPatientData();
        document.addEventListener('click', this.handleClickOutside);

    // Вот добавка для тултипов:
    this.$nextTick(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    });
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        fetchPatientData() {
            fetch('http://192.168.1.207:8080/api/patient-profile')
                .then(response => response.json())
                .then(data => {
                    this.patient = data;
                    this.data.upcoming = data.upcoming || [];
                    this.data.history = data.history || [];
                    this.data.tests = data.tests || [];
                })
                .catch(error => {
                    console.error('Ошибка загрузки профиля:', error);
                });
        },
        changeEmail() {
            fetch('http://192.168.1.207:8080/api/change-email', {
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
                } else {
                    alert('Ошибка при смене пароля');
                }
            });
        },
        togglePopover() {
            this.isPopoverVisible = !this.isPopoverVisible;
        },
        handleClickOutside(event) {
            const popover = document.getElementById('patient-profile');
            if (popover && !popover.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        }
    }
}).mount('#app');
