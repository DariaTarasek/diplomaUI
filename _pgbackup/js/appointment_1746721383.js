const { createApp, ref, reactive, onMounted, computed, watch, nextTick } = Vue;

createApp({
  setup() {
    const specialties = ref([]);
    const doctors = ref([]);
    const schedule = ref({});
    const maxSlots = ref(0);
    const selectedDoctorId = ref(null);
    const selectedSpecialization = ref(null);
    const selectedDoctor = ref(null);
    const selectedSlot = ref(null);
    const step = ref(1);

    const authFirstName = ref("");
    const authSecondName = ref("");

    const isPopoverVisible = ref(false)

    const isAuthorized = ref(false)

    const patient = reactive({
      second_name: '',
      first_name: '',
      surname: '',
      birth_date: '',
      gender: '',
      phone: ''
    });

    const errors = reactive({
      phone: '',
      first_name: '',
      second_name: ''
    });

    const phoneDigits = () => patient.phone.replace(/\D/g, '');

    const validatePhone = () => {
      if (phoneDigits().length !== 11) {
        errors.phone = 'Введите полный 11-значный номер телефона.';
        return false;
      } else {
        errors.phone = '';
        return true;
      }
    };

    const validateName = () => {
      errors.first_name = patient.first_name.trim() ? '' : 'Имя не может быть пустым';
      errors.second_name = patient.second_name.trim() ? '' : 'Фамилия не может быть пустой';
      return !errors.first_name && !errors.second_name;
    };

    const fetchSpecialties = async () => {
      const res = await fetch('http://192.168.1.207:8080/api/specialties');
      specialties.value = await res.json();
    };

    const fetchDoctors = async (specialtyId) => {
  const res = await fetch(`http://192.168.1.207:8080/api/doctors?specialty=${specialtyId}`);
  const rawDoctors = await res.json();

  // Добавляем поле fullName каждому врачу
  doctors.value = rawDoctors.map(doc => ({
    ...doc,
    fullName: `${doc.second_name} ${doc.first_name} ${doc.surname}`.trim()
  }));
};


    const fetchSchedule = async (doctorId) => {
      const res = await fetch(`http://192.168.1.207:8080/api/schedule?doctor_id=${doctorId}`);
      schedule.value = await res.json();
      maxSlots.value = Math.max(...Object.values(schedule.value).map(day => day.length));
    };

    const selectSlot = (slot) => {
      selectedSlot.value = slot;
      step.value = 2;
    };

    const back = () => {
      step.value = 1;
      selectedSlot.value = null;
    };

    const submitForm = async () => {
      if (!selectedSlot.value || !selectedDoctorId.value) {
        alert('Выберите врача и время');
        return;
      }

      if (!validatePhone() || !validateName()) return;

      const payload = {
        doctor_id: selectedDoctorId.value,
        slot: selectedSlot.value,
        patient: { ...patient }
      };

      const res = await fetch('http://192.168.1.207:8080/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Запись успешно создана!');
        location.reload();
      } else {
        alert('Ошибка при записи. Попробуйте позже.');
      }
    };

    const loadPatientData = async () => {
      try {
        const res = await fetch('http://192.168.1.207:8080/api/patient/me');
        if (!res.ok) return;
        isAuthorized.value = true;
        const data = await res.json();
        authFirstName.value = data.first_name;
        authSecondName.value = data.second_name;
        Object.assign(patient, {
          second_name: data.second_name || '',
          first_name: data.first_name || '',
          surname: data.surname || '',
          birth_date: data.birthDate || '',
          gender: data.gender || '',
          phone: data.phone || ''
        });
      } catch {
        console.warn('Пациент не авторизован');
      }
    };

    const fullName = computed(() => {
  return [authFirstName.value, authSecondName.value].filter(Boolean).join(' ');
    });

const birthDateAttrs = reactive({ min: '', max: '' });

const validateDateRange = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  birthDateAttrs.min = `${yyyy - 110}-${mm}-${dd}`;
  birthDateAttrs.max = `${yyyy - 18}-${mm}-${dd}`;
};


        function handleClickOutside(event) {
            const popover = document.getElementById('patient-profile');
            if (popover && !popover.contains(event.target)) {
                isPopoverVisible = false;
            }
        }

    onMounted(() => {
      fetchSpecialties();
      loadPatientData();
      validateDateRange();
      document.addEventListener('click', this.handleClickOutside);
    });

    
watch(step, (newVal) => {
  if (newVal === 2) {
    nextTick(() => {
      const phoneInput = document.getElementById('phone');
      if (phoneInput && !phoneInput.dataset.masked) {
        const mask = IMask(phoneInput, {
          mask: '+{7} (000) 000-00-00'
        });
        phoneInput.dataset.masked = "true"; // чтобы не маскировать повторно
        mask.on('accept', () => {
            const digits = mask.value.replace(/\D/g, '');
            const valid = digits.length === 11 && digits.startsWith('7');
            phoneError.value = digits && !valid ? 'Неверный формат телефона' : '';
            patient.phone = mask.value;
          });
      }
    });
  }
});

const onPhoneInput = () => {
  // Маска уже точно применилась
  validatePhone();
};

//watch(() => patient.phone, () => {
  //nextTick(() => {
    //validatePhone();
  //});
//});

watch(() => patient.first_name, () => {
  validateName();
});

watch(() => patient.second_name, () => {
  validateName();
});

    return {
      specialties,
      doctors,
      schedule,
      maxSlots,
      selectedDoctorId,
      selectedSpecialization,
      selectedDoctor,
      selectedSlot,
      step,
      patient,
      errors,
      fetchDoctors,
      fetchSchedule,
      selectSlot,
      back,
      submitForm,
      validatePhone,
      validateName,
      isAuthorized,
      isPopoverVisible,
      fullName,
      birthDateAttrs,
      onPhoneInput
    };
  }
}).mount("#app");
