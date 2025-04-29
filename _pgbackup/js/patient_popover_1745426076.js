Vue.createApp({
    data() {
        return {
            patient: {
                secondName: '',
                firstName: '',
                surname: ''
            },
            isPopoverVisible: false
        };
    },
    computed: {
        fullName() {
            return [this.patient.secondName, this.patient.firstName, this.patient.surname]
                .filter(Boolean)
                .join(' ');
        }
    },
    mounted() {
        console.log("🟢 Vue примонтировался");
        this.fetchPatientName();

        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        fetchPatientName() {
            console.log("📡 Отправляю fetch запрос...");
            fetch('http://192.168.1.207:8080/api/patient/me')
                .then(res => {
                    if (!res.ok) throw new Error("Сервер вернул ошибку: " + res.status);
                    return res.json();
                })
                .then(data => {
                    console.log("✅ Данные пациента:", data);
                    this.patient.secondName = data.second_name;
                    this.patient.firstName = data.first_name;
                    this.patient.surname = data.surname;
                })
                .catch(err => {
                    console.error("❌ Ошибка при fetch:", err);
                });
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        }
    }
}).mount('#patient-profile');
