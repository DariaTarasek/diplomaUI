const { createApp } = Vue;

createApp({
  data() {
  return {
    activeTab: 'schedule',
    fullNmae: '',
    tabs: [
      { id: 'schedule', label: 'Расписание приёмов' },
      { id: 'pending', label: 'Неподтверждённые записи' }
    ],
    schedule: {
      days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
      timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
    },
    appointments: {},
    pending: [],
  };
},
  methods: {
 async fetchData() {
  try {
    const res = await fetch('http://192.168.1.207:8080/api/admin-data');
    const data = await res.json();

    this.appointments = data.appointments || {};
    this.pending = data.pending || [];
    this.adminName = data.admin_name || '-';

     const nameButton = document.getElementById('admin_name');
          if (nameButton) {
            nameButton.textContent = this.adminName;
          }

  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
  }
},
    confirmEntry(index) {
      const entry = this.pending[index];
      // Логика подтверждения
      this.pending.splice(index, 1);
    }
  },
  computed: {
        fullName() {
            return [
                this.patient.second_name,
                this.patient.first_name,
            ]
            .filter(Boolean)
            .join(' ');
        }
    },
  mounted() {
    this.fetchData();
  }
}).mount('#app');
