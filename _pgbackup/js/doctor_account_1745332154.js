const { createApp } = Vue;

createApp({
  data() {
    return {
      activeTab: 'today',
      tabs: [
        { id: 'today', label: 'Записи на сегодня' },
        { id: 'upcoming', label: 'Расписание' },
        { id: 'completed', label: 'Завершенные приемы' }
      ],
      data: {
        today: [],
        upcoming: [],
        completed: []
      },
      scheduleDates: [],
      scheduleTimes: [
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00",
        "17:00", "18:00"
      ]
    };
  },
  computed: {
    todaySorted() {
      return [...this.data.today].sort((a, b) => a.time.localeCompare(b.time));
    }
  },
  methods: {
    fetchDoctorData() {
      fetch('http://192.168.1.207:8080/api/doctor-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки');
          return res.json();
        })
        .then(json => {
          this.data.today = json.today || [];
          this.data.upcoming = json.upcoming || [];
          this.data.completed = json.completed || [];

          // Создаем массив уникальных дат для таблицы расписания
          this.scheduleDates = [...new Set(this.data.upcoming.map(x => x.date))];
        })
        .catch(err => {
          console.error('Ошибка при получении данных:', err);
        });
    },
    getPatientByDateTime(date, time) {
      return this.data.upcoming.find(x => x.date === date && x.time === time);
    },
    isToday(dateStr) {
      const today = new Date().toISOString().split('T')[0];
      return dateStr === today;
    }
  },
  mounted() {
    this.fetchDoctorData();
  }
}).mount('#app');
