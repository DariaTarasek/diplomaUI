const { createApp, ref, reactive, watch, onMounted } = Vue;


createApp({
  setup() {
    const search = ref('');
    const filters = reactive({ role: '', specialty: '' });
    const staff = ref([]);
    const roles = ref([]);
    const specialties = ref([]);
    const form = reactive({
      id: '',
      second_name: '',
      first_name: '',
      surname: '',
      email: '',
      role: '',
      specialty: '',
      gender: '',
      phone: '',
      experience: '',
      education: ''
    });

    const emailError = ref('');
    const phoneError = ref('');
    let modal = null;

    async function loadRoles() {
      roles.value = await (await fetch('http://192.168.1.207:8080/api/roles')).json();
    }

    async function loadSpecialties() {
      specialties.value = await (await fetch('http://192.168.1.207:8080/api/admin/specialties')).json();
    }

    async function loadStaff() {
      const params = new URLSearchParams();
      if (search.value) params.append('search', search.value);
      if (filters.role) params.append('role', filters.role);
      if (filters.role === 'doctor' && filters.specialty) {
        params.append('specialty', filters.specialty);
      }

      const res = await fetch(`http://192.168.1.207:8080/api/staff?${params}`);
      staff.value = await res.json();
    }

    function getRoleName(id) {
      return roles.value.find(r => r.id === id)?.name || id;
    }

    function getSpecialtyName(id) {
      return specialties.value.find(s => s.id === id)?.name || '-';
    }

    function onRoleChange() {
      if (filters.role !== 'doctor') {
        filters.specialty = '';
      }
      loadStaff();
    }


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

      if (digits.startsWith('7')) {
        digits = '7' + digits.slice(1);
      } else if (digits.length === 10) {
        digits = '7' + digits;
      }

      // Создаем маску
      const mask = IMask(phoneInput, {
        mask: '+7 (000) 000-00-00',
        lazy: false,
        overwrite: true
      });

      // Привязываем маску к элементу
      phoneInput.maskRef = mask;

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
        role: form.role,
        specialty: form.role === 'doctor' ? form.specialty : null,
        experience: form.role === 'doctor' ? form.experience : null,
        education: form.role === 'doctor' ? form.education : null
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

    watch(() => form.phone, (val) => {
        const digits = val.replace(/\D/g, '');
        const valid = digits.length === 11 && digits.startsWith('7');
        phoneError.value = digits && !valid ? 'Неверный формат телефона' : '';
    });

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
      roles,
      specialties,
      form,
      emailError,
      phoneError,
      loadStaff,
      getRoleName,
      getSpecialtyName,
      openEdit,
      saveStaff,
      onRoleChange
    };
  }
}).mount('#app');
