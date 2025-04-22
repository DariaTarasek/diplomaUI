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
        today: [],
        upcoming: [],
        completed: []
      }
    };
  },
  mounted() {
    this.fetchDoctorData();
  },
  methods: {
    fetchDoctorData() {
      fetch('/api/doctor-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки');
          return res.json();
        })
        .then(json => {
          this.data.today = json.today || [];
          this.data.upcoming = json.upcoming || [];
          this.data.completed = json.completed || [];
        })
        .catch(err => {
          console.error('Ошибка при получении данных:', err);
        });
    }
  }
}).mount('#app');
