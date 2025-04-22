const { createApp } = Vue;

createApp({
  data() {
    return {
      tabs: [
        { id: 'schedule', label: 'Расписание приёмов' },
        { id: 'pending', label: 'Неподтверждённые записи' }
      ],
      activeTab: 'schedule',
      schedule: {
        days: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'],
        timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00']
      },
      appointments: {},
      pending: []
    };
  },
  mounted() {
    this.fetchAppointments();
    this.fetchPending();
  },
  methods: {
    fetchAppointments() {
      fetch('data/appointments.json')
        .then(response => response.json())
        .then(data => {
          this.appointments = data;
        })
        .catch(error => {
          console.error('Ошибка загрузки расписания:', error);
        });
    },
    fetchPending() {
      fetch('data/pending.json')
        .then(response => response.json())
        .then(data => {
          this.pending = data;
        })
        .catch(error => {
          console.error('Ошибка загрузки неподтверждённых записей:', error);
        });
    },
    confirmEntry(index) {
      // Пример логики подтверждения
      this.pending.splice(index, 1);
    }
  }
}).mount('#app');
