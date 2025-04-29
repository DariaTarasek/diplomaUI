const { createApp } = Vue;

createApp({
    data() {
        return {
            patient: {
                fullName: ''
            }
        };
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
           fetch('/api/patient')
    .then(res => res.json())
    .then(data => {
        this.patient.fullName = data.fullName;
    })
    .catch(err => {
        console.error('Ошибка загрузки данных пациента:', err);
        this.patient.fullName = 'Ошибка загрузки';
    });

    }}
}).mount('#patient-profile');
