const { createApp } = Vue;

createApp({
  data() {
    return {
      patient: {
        secondName: '',
        firstName: '',
        surname: ''
      },
      isPopoverVisible: false,
      activeTab: 'upcoming',
      tabs: [
        { id: 'upcoming', label: 'Предстоящие записи' },
        { id: 'history', label: 'История посещений' },
        { id: 'tests', label: 'Анализы / Исследования' }
      ],
      data: {
        upcoming: [],
        history: [],
        tests: []
      }
    };
  },
  computed: {
    fullName() {
      return [this.patient.secondName, this.patient.firstName, this.patient.surname]
        .filter(Boolean)
        .join(' ');
    }
  },
  mounted() {
    this.fetchPatientName();
    this.fetchPatientData();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    fetchPatientName() {
      fetch('http://192.168.1.207:8080/api/patient/me')
        .then(res => res.json())
        .then(data => {
          this.patient.secondName = data.second_name;
          this.patient.firstName = data.first_name;
          this.patient.surname = data.surname;
        })
        .catch(console.error);
    },
    fetchPatientData() {
      fetch('http://192.168.1.207:8080/api/patient-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки');
          return res.json();
        })
        .then(json => {
          this.patient.secondName = data.second_name;
          this.patient.firstName = data.first_name;
          this.patient.surname = data.surname; 
          this.data.upcoming = json.upcoming || [];
          this.data.history = json.history || [];
          this.data.tests = json.tests || [];
        })
        .catch(err => {
          console.error('Ошибка при получении данных:', err);
        });
    },
    togglePopover() {
      this.isPopoverVisible = !this.isPopoverVisible;
    },
    handleClickOutside(event) {
      const popover = document.getElementById('patient-profile');
      if (popover && !popover.contains(event.target)) {
        this.isPopoverVisible = false;
      }
    }
  }
}).mount('#app');
