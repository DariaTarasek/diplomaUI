const { createApp } = Vue;

createApp({
  data() {
    return {
      activeTab: 'today',
      second_name: '',
      first_name: '',
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
      ],
     isPopoverVisible: false,
    };
  },
  computed: {
    todaySorted() {
      return [...this.data.today].sort((a, b) => a.time.localeCompare(b.time));
    },
    fullName() {
        return [
            this.admin.first_name,
            this.admin.second_name
        ]
        .filter(Boolean)
        .join(' ');
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
          this.doctorName = json.doctor_name || '-';

          this.scheduleDates = [...new Set(this.data.upcoming.map(x => x.date))];

          const nameButton = document.getElementById('doctor_name');
          if (nameButton) {
            nameButton.textContent = this.doctorName;
          }
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
    },
     togglePopover() {
            this.isPopoverVisible = !this.isPopoverVisible;
        },
        handleClickOutside(event) {
            const popover = document.getElementById('admin-profile');
            if (popover && !popover.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        }
  },
  mounted() {
    this.fetchDoctorData();
    document.addEventListener('click', this.handleClickOutside);
  }
}).mount('#app');
