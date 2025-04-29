const { createApp } = Vue;

createApp({
    data() {
        return {
            patient: {
            secondName: '',
            firstName: '',
            surname: ''
            }
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

        const btn = document.getElementById('patient_name_btn');
        const popover = document.getElementById('profile-popover');

        document.addEventListener('click', (event) => {
            if (btn.contains(event.target)) {
                popover.style.display = (popover.style.display === 'none' || !popover.style.display) ? 'block' : 'none';
            } else if (!popover.contains(event.target)) {
                popover.style.display = 'none';
            }
        });
    },
    methods: {
        fetchPatientName() {
           fetch('"http://192.168.1.207:8080/api/patient/me"')
    .then(res => res.json())
    .then(data => {
        this.patient.secondName = data.second_name;
        this.patient.firstName = data.first_name;
        this.patient.surname = data.surname;
    })
    .catch(err => {
        console.error('Ошибка загрузки данных пациента:', err);
    });

    }}
    
}).mount('#patient-profile');
