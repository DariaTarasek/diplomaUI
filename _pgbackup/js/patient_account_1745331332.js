const { createApp } = Vue;

createApp({
  data() {
    return {
      activeTab: 'upcoming',
      patientName: '',
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
  mounted() {
    this.fetchPatientData();
  },
  methods: {
    fetchPatientData() {
      fetch('http://192.168.1.207:8080/api/patient-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки');
          return res.json();
        })
        .then(json => {
          this.patientName = json.name || '-';
          this.data.upcoming = json.upcoming || [];
          this.data.history = json.history || [];
          this.data.tests = json.tests || [];

           const nameButton = document.getElementById('patient_name');
          if (nameButton) {
            nameButton.textContent = this.patientName;
          }
        })

        .catch(err => {
          console.error('Ошибка при получении данных:', err);
        });
    }
  }
}).mount('#app');
