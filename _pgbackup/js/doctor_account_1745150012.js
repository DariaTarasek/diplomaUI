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
      },
      weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      timeSlots: [
        '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00'
      ]
    };
  },
  computed: {
    sortedToday() {
      return [...this.data.today].sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    }
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
    },
    getPatientAt(dayLabel, time) {
      // Сопоставим короткие имена дней с датами в data.upcoming
      const dayMap = {
        'Вс': 0, 'Пн': 1, 'Вт': 2, 'Ср': 3, 'Чт': 4, 'Пт': 5, 'Сб': 6
      };

      const today = new Date();
      const targetDay = new Date(today);
      targetDay.setDate(
        today.getDate() + ((7 + dayMap[dayLabel] - today.getDay()) % 7)
      );

      const dayStr = targetDay.toISOString().split('T')[0]; // формат YYYY-MM-DD

      return this.data.upcoming.find(
        item => item.date === dayStr && item.time === time
      );
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
