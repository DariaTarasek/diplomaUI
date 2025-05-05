const { createApp, ref, reactive, watch, onMounted } = Vue;


createApp({
  setup() {
    const search = ref('');
    const filters = reactive({ role: '' });
    const staff = ref([]);
    const roles = ref([]);
    const form = reactive({
      id: '',
      second_name: '',
      first_name: '',
      surname: '',
      email: '',
      role: '',
      gender: '',
      phone: ''
    });

    const emailError = ref('');
    const phoneError = ref('');

    const userRole = ref(null);
    const selectedAdmin = ref(null);
    const selectedAdminId = ref(null);

    const isSwitchingModals = ref(false);

    let modal = null;

    async function fetchUserRole() {
        try {
            const res = await fetch('http://192.168.1.207:8080/api/user-role'); 
            if (res.ok) {
            const data = await res.json();
            userRole.value = data.role;
            } else {
            console.error('Ошибка получения роли пользователя');
            userRole.value = 'admin';
            }
        } catch (err) {
            console.error('Ошибка запроса роли:', err);
            userRole.value = 'admin'; 
        }
        }

    async function loadRoles() {
      roles.value = await (await fetch('http://192.168.1.207:8080/api/roles')).json();
    }


    async function loadStaff() {
      const params = new URLSearchParams();
      if (search.value) params.append('search', search.value);
      if (filters.role) params.append('role', filters.role);
    

      const res = await fetch(`http://192.168.1.207:8080/api/staff?${params}`);
      staff.value = await res.json();
    }

    function getRoleName(id) {
      return roles.value.find(r => r.id === id)?.name || id;
    }

    function onRowClick(s) {
        selectedAdmin.value = s;
        selectedAdminId.value = s.id;

        const modalElement = document.getElementById('actionsModal');
        if (modalElement) {
            modalChoice = new bootstrap.Modal(modalElement);
            modalChoice.show();
        }
    }

    function onRoleChange() {
      loadStaff();
    }


  function openEdit(s) {
    isSwitchingModals.value = true;
    modalChoice?.hide();
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

      if (!phoneValid) {
        return;
      }

      const payload = {
        id: form.id,
        first_name: form.first_name,
        second_name: form.second_name,
        surname: form.surname,
        phone: form.phone,
        email: form.email,
        role: form.role
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

     function isSelected(s) {
        return selectedAdminId.value === s.id;
    }

     function openLoginChange() {
        isSwitchingModals.value = true;
      modalChoice.hide();

      if (!modalLogin) {
        modalLogin = new bootstrap.Modal(document.getElementById('changeLoginModal'));
      }
        resetPhoneConfirmation();

      modalLogin.show();
    }

     function onModalHidden() {
        if (isSwitchingModals.value) {
            isSwitchingModals.value = false;
            return;
        }
        selectedAdminId.value = null;
        selectedAdmin.value = null;
    }

     async function saveLogin() {
        const emailValid = !emailError.value && form.email;

        if (!emailValid) {
            codeMessage.value = 'Некорректный email';
            return;
        }

        await fetch(`http://192.168.1.207:8080/api/admins/${form.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: form.phone })
        });

      modalLogin.hide();
      await loadStaff();
    }

      async function deleteAdmin() {
            if (!selectedAdmin.value) return;

            const confirmed = confirm(`Вы уверены, что хотите удалить пользователя: ${selectedAdmin.value.first_name} ${selectedAdmin.value.second_name}?`);
            if (!confirmed) return;

            try {
                const res = await fetch(`http://192.168.1.207:8080/api/admins/${selectedAdmin.value.id}`, {
                method: 'DELETE'
                });

                if (res.ok) {
                modalChoice?.hide();
                await loadStaff();
                alert('Пользователь удалён.');
                } else {
                alert('Ошибка при удалении пользователя.');
                }
            } catch (e) {
                console.error(e);
                alert('Произошла ошибка.');
            }
            }


    watch(() => form.email, (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      emailError.value = val && !emailRegex.test(val) ? 'Неверный формат email' : '';
    });

    onMounted(() => {
        const editEl = document.getElementById('editModal');
        const loginEl = document.getElementById('changeLoginModal');
        const actionsEl = document.getElementById('actionsModal');

        if (editEl) {
            editEl.addEventListener('hidden.bs.modal', onModalHidden);
        }
        if (loginEl) {
            loginEl.addEventListener('hidden.bs.modal', onModalHidden);
        }
        if (actionsEl) {
            actionsEl.addEventListener('hidden.bs.modal', onModalHidden);
        }
            loadRoles();
            loadStaff();
    });

    onMounted(async () => {
        await fetchUserRole();
});


    return {
      search,
      filters,
      staff,
      roles,
      form,
      emailError,
      phoneError,
      loadStaff,
      getRoleName,
      openEdit,
      saveStaff,
      onRoleChange,
      userRole,
      fetchUserRole,
      onRowClick,
      openLoginChange,
      saveLogin,
      selectedAdmin,
      selectedAdminId,
      isSelected,
      onModalHidden,
      deleteAdmin
    };
  }
}).mount('#app');
