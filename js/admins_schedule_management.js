const { createApp } = Vue;

createApp({
  data() {
    return {
      dayLabels: [ 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
      clinicSchedule: [],
      clinicSlotMinutes: null,
      doctors: [],
      selectedDoctor: null,
      doctorSchedule: [],
      doctorSlotMinutes: null,
      overrideForm: {
            doctor_id: null,
            date: '',
            type: 'off',
            start_time: '',
            end_time: '',
            slot_minutes: null,
        },
    isPopoverVisible: false,
    admin: {
        first_name: '',
        second_name: ''
        },
    invalidDays: [],
    invalidClinicDays: [],
    clinicSlotError: false,
    doctorSlotError: false,
    overrideSlotError: false,
    overrideErrors: {
        date: false,
        start_time: false,
        end_time: false,
        slot_minutes: false
        },
    };
  },
  computed: {
    fullName() {
      return [this.admin.first_name, this.admin.second_name].filter(Boolean).join(' ');
        },
    },
  mounted() {
    this.loadClinicSchedule();
    this.loadDoctors();
    this.fetchData(); 
    document.addEventListener('click', this.handleClickOutside);
  },
  methods: {
    togglePopover() {
        this.isPopoverVisible = !this.isPopoverVisible;
    },

    handleOverrideDateChange() {
        if (this.isValidSlot(this.clinicSlotMinutes)) {
            this.overrideForm.slot_minutes = this.clinicSlotMinutes;
        } else {
            this.overrideForm.slot_minutes = null;
    }
    },

      async fetchData() {
      try {
        const res = await fetch('http://192.168.1.207:8080/api/admin-data');
        const data = await res.json();
        this.admin.first_name = data.first_name || '';
        this.admin.second_name = data.second_name || '';
        }
        catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      }
    },

    handleClickOutside(event) {
         const popover = document.getElementById('admin-profile');
         if (popover && !popover.contains(event.target)) {
        this.isPopoverVisible = false;
        }
    },

   async loadClinicSchedule() {
  try {
    const res = await fetch('http://192.168.1.207:8080/api/clinic-schedule');
    const data = await res.json();

    const fullSchedule = Array(7).fill(null).map((_, i) => ({
      day: i,
      start_time: '',
      end_time: '',
      is_open: false
    }));


    for (const day of data.schedule) {
      fullSchedule[day.day] = day;
    }

    this.clinicSchedule = fullSchedule;
    this.clinicSlotMinutes = data.slot_minutes;
  } catch (err) {
    console.error('Ошибка при загрузке расписания клиники', err);
  }
},

    validateTimeInterval(start, end, minDuration) {
        if (!start || !end) return false;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        return endMin > startMin && (endMin - startMin) >= minDuration;
    },

    isValidSlot(slot) {
        return slot >= 5 && slot <= 180;
    },


    isValidDateOverride(dateStr) {
        const today = new Date();
        const date = new Date(dateStr);
        const in3Months = new Date();
        in3Months.setMonth(in3Months.getMonth() + 3);
        return date >= today.setHours(0,0,0,0) && date <= in3Months;
    },

    clinicTimeBoundsForDay(day) {
        const clinicDay = this.clinicSchedule.find(d => d.day === day);
        if (!clinicDay || !clinicDay.is_open) return null;
        return {
            start: clinicDay.start_time,
            end: clinicDay.end_time,
        };
    },

    isWithinClinicTime(start, end, clinicBounds) {
        if (!clinicBounds) {
            this.overrideErrors.date = true;
            return false
        };
        return (
            start >= clinicBounds.start &&
            end <= clinicBounds.end &&
            this.validateTimeInterval(start, end, this.clinicSlotMinutes)
        );
    },


    async saveClinicSchedule() {
        this.invalidClinicDays = [];
        this.clinicSlotError = false;

        if (!this.isValidSlot(this.clinicSlotMinutes)) {
            this.clinicSlotError = true;
            alert('Продолжительность приема должна составлять от 5 до 180 минут');
            return;
        }

        for (const day of this.clinicSchedule) {
            if (day.is_open && !this.validateTimeInterval(day.start_time, day.end_time, this.clinicSlotMinutes)) {
            this.invalidClinicDays.push(day.day);
            }
        }

        if (this.invalidClinicDays.length > 0) {
            alert('Проверьте корректность расписания клиники');
            return;
        }


        try {
            const res = await fetch('http://192.168.1.207:8080/api/clinic-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule: this.clinicSchedule,
            slot_minutes: this.clinicSlotMinutes,
          }),
        });
        if (!res.ok) throw new Error('Ошибка при сохранении');
        alert('Расписание клиники сохранено');
      } catch (err) {
        console.error(err);
        alert('Не удалось сохранить расписание клиники');
      }
    },
    async loadDoctors() {
      try {
        const res = await fetch('http://192.168.1.207:8080/api/get-doctors');
        this.doctors = await res.json();
      } catch (err) {
        console.error('Ошибка при загрузке списка врачей', err);
      }
    },

async fetchDoctorSchedule() {
  if (!this.selectedDoctor) return;
  try {
    const res = await fetch(`http://192.168.1.207:8080/api/doctor-schedule/${this.selectedDoctor}`);
    const data = await res.json();

    const fullSchedule = Array(7).fill(null).map((_, i) => ({
      day: i,
      start_time: '',
      end_time: '',
      is_open: false
    }));

    for (const day of data.schedule) {
        fullSchedule[day.day] = {
            ...fullSchedule[day.day], 
            ...day,
            is_open: day.is_open !== undefined ? day.is_open : true
        };
    }
    this.doctorSchedule = fullSchedule;
    this.doctorSlotMinutes = data.slot_minutes;
  } catch (err) {
    console.error('Ошибка при загрузке расписания врача', err);
  }
}
,
    async saveDoctorSchedule() {
        this.invalidDays = [];
        this.doctorSlotError = false;

        if (!this.isValidSlot(this.doctorSlotMinutes)) {
            this.doctorSlotError = true;
            alert('Продолжительность приема должна составлять от 5 до 180 минут');
            return;
        }

        for (const day of this.doctorSchedule) {
            if (day.is_open) {
            const clinicBounds = this.clinicTimeBoundsForDay(day.day);

            if (!this.validateTimeInterval(day.start_time, day.end_time, this.doctorSlotMinutes)) {
                this.invalidDays.push(day.day);
                continue;
            }

            if (!this.isWithinClinicTime(day.start_time, day.end_time, clinicBounds)) {
                this.invalidDays.push(day.day);
                continue;
            }
            }
        }

        if (this.invalidDays.length > 0) {
            alert('Проверьте корректность расписания врача');
            return;
        }

    try {
        const res = await fetch(`http://192.168.1.207:8080/api/doctor-schedule/${this.selectedDoctor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            schedule: this.doctorSchedule,
            slot_minutes: this.doctorSlotMinutes,
        }),
        });
        if (!res.ok) throw new Error('Ошибка при сохранении');
        alert('Расписание врача сохранено');
    } catch (err) {
        console.error(err);
        alert('Не удалось сохранить расписание врача');
    }
    }, 

    async saveOverride() {
        this.overrideErrors = {
            date: false,
            start_time: false,
            end_time: false,
            slot_minutes: false
        };


        if (!this.isValidDateOverride(this.overrideForm.date)) {
             this.overrideErrors.date = true;
             alert('Недопустимая дата. Выберите дату не позднее трех месяцев от текущей.');
            return;
    }

    if (this.overrideForm.type === 'work') {
        if (!this.validateTimeInterval(this.overrideForm.start_time, this.overrideForm.end_time, this.overrideForm.slot_minutes)) {
            this.overrideErrors.start_time = true;
            this.overrideErrors.end_time = true;
            alert('Недопустимый интервал времени');
            return;
            }

            const day = new Date(this.overrideForm.date).getDay();
            const clinicBounds = this.clinicTimeBoundsForDay(day === 0 ? 6 : day - 1);

            if (!this.isWithinClinicTime(this.overrideForm.start_time, this.overrideForm.end_time, clinicBounds)) {
                this.overrideErrors.start_time = true;
                this.overrideErrors.end_time = true;
                alert('Выбранные параметры не соответствуют расписанию клиники');
                return;
            }

           if (!this.isValidSlot(this.overrideForm.slot_minutes)) {
                this.overrideErrors.slot_minutes = true;
                this.overrideSlotError = true;
                alert('Продолжительность приема должна составлять от 5 до 180 минут');
                return;
           } else {
                this.overrideSlotError = false;
            }

        }
      try {
        const res = await fetch('http://192.168.1.207:8080/api/doctor-overrides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.overrideForm),
        });
        if (!res.ok) throw new Error('Ошибка при сохранении переопределения');
        alert('Переопределение сохранено');
        // Очистка формы
        this.overrideForm = {
          doctor_id: null,
          date: '',
          type: 'off',
          start_time: '',
          end_time: '',
          slot_minutes: null,
        };
      } catch (err) {
        console.error(err);
        alert('Не удалось сохранить переопределение');
      }
    },
  }
}).mount('#app');
