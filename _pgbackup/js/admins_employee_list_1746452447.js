const { createApp, ref, reactive, watch, onMounted } = Vue;


createApp({
  setup() {
    const search = ref('');
    const filters = reactive({ role: '', specialty: '' });
    const staff = ref([]);
    const specialties = ref([]);
    const form = reactive({
      id: '',
      second_name: '',
      first_name: '',
      surname: '',
      email: '',
      specialty: '',
      gender: '',
      phone: '',
      experience: '',
      education: ''
    });

    const emailError = ref('');
    const phoneError = ref('');
    let modal = null;


    async function loadSpecialties() {
      specialties.value = await (await fetch('http://192.168.1.207:8080/api/admin/specialties')).json();
    }

    async function loadStaff() {
      const params = new URLSearchParams();
      if (search.value) params.append('search', search.value);
      if (specialty.value) params.append('specialty', filters.specialty);
    

      const res = await fetch(`http://192.168.1.207:8080/api/staff?${params}`);
      staff.value = await res.json();
    }

    function getSpecialtyName(id) {
      return specialties.value.find(s => s.id === id)?.name || '-';
    }

    loadStaff();


  function openEdit(s) {
  Object.assign(form, s);
  emailError.value = '';
  phoneError.value = '';
  modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();

  setTimeout(() => {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      // Удаляем старую маску, если была
      if (phoneInput.maskRef?.destroy) {
        phoneInput.maskRef.destroy();
      }

      // Нормализация номера
      let digits = (form.phone || '').replace(/\D/g, '');

      digits = digits.slice(1);

      // Создаем маску
      const mask = IMask(phoneInput, {
        mask: '+7 (000) 000-00-00',
        lazy: false,
        overwrite: true
      });

      // Привязываем маску к элементу
      phoneInput.maskRef = mask;

     mask.on('accept', () => {
        const digits = mask.value.replace(/\D/g, ''); // Удаляем все кроме цифр
        const valid = digits.length === 11 && digits.startsWith('7');
        phoneError.value = digits && !valid ? 'Неверный формат телефона' : '';
        form.phone = mask.value;
    });



      // Устанавливаем значение без потерь
      mask.unmaskedValue = digits;
      form.phone = mask.value;
    }
  }, 300);
}

    function saveStaff() {
      const phoneValid = !phoneError.value && form.phone;
      const emailValid = !emailError.value && form.email;

      if (!phoneValid || !emailValid) {
        return;
      }

      const payload = {
        id: form.id,
        first_name: form.first_name,
        second_name: form.second_name,
        surname: form.surname,
        phone: form.phone,
        email: form.email,
        specialty: form.specialty,
        experience: form.experience,
        education:form.education
      };

      fetch('http://192.168.1.207:8080/api/save-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            loadStaff();
            if (modal) modal.hide();
          } else {
            alert('Ошибка при сохранении');
          }
        });
    }


    watch(() => form.email, (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      emailError.value = val && !emailRegex.test(val) ? 'Неверный формат email' : '';
    });

    onMounted(() => {
      loadRoles();
      loadSpecialties();
      loadStaff();
    });

    return {
      search,
      filters,
      staff,
      specialties,
      form,
      emailError,
      phoneError,
      loadStaff,
      getSpecialtyName,
      openEdit,
      saveStaff,
    };
  }
}).mount('#app');
