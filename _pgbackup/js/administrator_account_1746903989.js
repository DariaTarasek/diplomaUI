const { createApp } = Vue;

createApp({
  data() {
  return {
    activeTab: 'schedule',
    second_name: '',
    first_name: '',
    tabs: [
      { id: 'schedule', label: 'Расписание приёмов' },
      { id: 'pending', label: 'Неподтверждённые записи' }
    ],
    schedule: {
      days: [],
      timeSlots: []
    },
    appointments: {},
    pending: [],
       isPopoverVisible: false,
  };
},
  methods: {
 async fetchData() {
  try {
    const res = await fetch('http://192.168.1.207:8080/api/admin-data');
    const data = await res.json();

    this.appointments = data.appointments || {};
    this.pending = data.pending || [];
    this.first_name = data.first_name || '';
    this.second_name = data.second_name || '';

    // Получение расписания
    const scheduleRes = await fetch('http://192.168.1.207:8080/api/schedule-admin');
    const scheduleData = await scheduleRes.json();

    this.schedule = {
      days: scheduleData.days || [],
      timeSlots: scheduleData.timeSlots || []
    };


  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
  }
},

    confirmEntry(index) {
      const entry = this.pending[index];
      // Логика подтверждения
      this.pending.splice(index, 1);
    },

 togglePopover() {
            this.isPopoverVisible = !this.isPopoverVisible;
        },
        handleClickOutside(event) {
            const popover = document.getElementById('admin-profile');
            if (popover && !popover.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        },
  },


  computed: {
        fullName() {
            return [
                this.first_name,
                this.second_name,
            ]
            .filter(Boolean)
            .join(' ');
        }
    },
  mounted() {
    this.fetchData();
     document.addEventListener('click', this.handleClickOutside);
  }
}).mount('#app');
