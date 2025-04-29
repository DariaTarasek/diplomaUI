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
        this.fetchPatientName();
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        fetchPatientName() {
            fetch('http://192.168.1.207:8080/api/patient/me')
                .then(res => res.json())
                .then(data => {
                    this.patient.secondName = data.second_name;
                    this.patient.firstName = data.first_name;
                    this.patient.surname = data.surname;
                })
                .catch(err => console.error(err));
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        }
    }
}).mount('#patient-profile');
