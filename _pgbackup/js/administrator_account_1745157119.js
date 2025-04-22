const { createApp } = Vue;

createApp({
  data() {
    return {
      activeTab: 'schedule',
      schedule: {
        days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
      },
      appointments: {}, // теперь тут массивы
      pending: [],
    };
  },
  methods: {
    async fetchData() {
      try {
        const res = await fetch('http://192.168.1.207:8080/api/admin-data');
        const data = await res.json();

        // Перепишем appointments в формат: appointments[day][time] = [{...}, {...}]
        const structuredAppointments = {};
        data.appointments.forEach(entry => {
          const { day, time } = entry;
          if (!structuredAppointments[day]) structuredAppointments[day] = {};
          if (!structuredAppointments[day][time]) structuredAppointments[day][time] = [];
          structuredAppointments[day][time].push(entry);
        });

        this.appointments = structuredAppointments;
        this.pending = data.pending || [];
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      }
    },
    confirmEntry(index) {
      const entry = this.pending[index];
      // Логика подтверждения (можно отправить на бэк)
      this.pending.splice(index, 1);
    }
  },
  mounted() {
    this.fetchData();
  }
}).mount('#app');
