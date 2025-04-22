const { createApp } = Vue;

createApp({
  data() {
    return {
      activeTab: 'upcoming',
      tabs: [
        { id: 'today', label: 'Записи на сегодня' },
        { id: 'upcoming', label: 'Расписание' },
        { id: 'completed', label: 'Завершенные приемы' }
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
      fetch('/api/patient-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки');
          return res.json();
        })
        .then(json => {
          this.data.upcoming = json.upcoming || [];
          this.data.history = json.history || [];
          this.data.tests = json.tests || [];
        })
        .catch(err => {
          console.error('Ошибка при получении данных:', err);
        });
    }
  }
}).mount('#app');
