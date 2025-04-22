const { createApp } = Vue;

createApp({
  data() {
    return {
      activeTab: 'schedule',
      tabs: [
        { id: 'schedule', label: 'Расписание' },
        { id: 'pending', label: 'Неподтвержденные записи' }
      ],
      schedule: {
        days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00']
      },
      appointments: {},
      pending: []
    };
  },
  mounted() {
    this.fetchAdminData();
  },
  methods: {
    fetchAdminData() {
      fetch('/api/admin-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка при загрузке данных');
          return res.json();
        })
        .then(json => {
          this.appointments = json.appointments || {};
          this.pending = json.pending || [];
        })
        .catch(err => {
          console.error('Ошибка:', err);
        });
    },
    confirmEntry(index) {
      const entry = this.pending[index];
      // Тут можно отправить POST-запрос для подтверждения
      // fetch('/api/confirm', { method: 'POST', body: JSON.stringify(entry) })

      this.pending.splice(index, 1); // удаляем из списка
      alert(`Запись подтверждена: ${entry.name}`);
    }
  }
}).mount('#app');
