const { createApp, ref, reactive, onMounted, watch } = Vue;

createApp({
  setup() {
    const patients = ref([]);
    const search = ref('');
    const form = reactive({
      id: null,
      second_name: '',
      first_name: '',
      birthDate: '',
      gender: '',
      surname: '',
      phone: '',
      email: ''
    });

    let modalEdit = null;
    let modalLogin = null;
    let modalChoice = null;
    const selectedPatient = ref(null);


    const emailError = ref('');
    const phoneError = ref('');
    const selectedPatientId = ref(null);
    const isSwitchingModals = ref(false);

    const phoneVerified = ref(false);
    const verifiedPhoneNumber = ref('');
    const smsCode = ref('');
    const codeMessage = ref('');
    const codeSectionVisible = ref(false);
    const resendTimer = ref(null);
    const resendButtonDisabled = ref(true);
    const resendButtonText = ref('Отправить код повторно');

    const requestButtonDisabled = ref(false);
    const phoneSectionDisabled = ref(false);
    const codeSended = ref(false);

    async function loadPatients() {
      const res = await fetch(`http://192.168.1.207:8080/api/patients?search=${encodeURIComponent(search.value)}`);
      patients.value = await res.json();
    }

    function onRowClick(p) {
        selectedPatient.value = p;
        selectedPatientId.value = p.id;

        const modalElement = document.getElementById('actionsModal');
        if (modalElement) {
            modalChoice = new bootstrap.Modal(modalElement);
            modalChoice.show();
        }
    }

    function updateRequestButtonState() {
        const digits = form.phone.replace(/\D/g, '');
  const isValid = digits.length === 11 && digits.startsWith('7');
  requestButtonDisabled.value = !isValid;
  console.log('Обновление кнопки: номер =', digits, 'валидный =', isValid, 'кнопка заблокирована =', requestButtonDisabled.value);
        }


    function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
}

    async function requestCode() {
    const phone = form.phone.trim();
    console.log('phone dlya confirm:' + phone)

    phoneError.value = ''; // сбрасываем ошибку, если всё ок

    // Блокируем поле и кнопку
    resendButtonDisabled.value = true;
    requestButtonDisabled.value = true;
    phoneSectionDisabled.value = true;
    codeSended.value = true;

    const res = await fetch('http://192.168.1.207:8080/api/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
    });

    if (res.ok) {
        codeSectionVisible.value = true;
        verifiedPhoneNumber.value = phone;
        phoneVerified.value = false;
        codeMessage.value = 'Код отправлен на номер.';
        startResendTimer();
    } else {
        codeMessage.value = 'Ошибка при отправке кода.';
        // Разблокируем поле в случае ошибки
        if (phoneInput) phoneInput.disabled = false;
    }
}


    async function verifyCode() {
    if (!smsCode.value || !verifiedPhoneNumber.value) {
        codeMessage.value = 'Введите код';
        return;
    }

    const res = await fetch('http://192.168.1.207:8080/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: verifiedPhoneNumber.value, code: smsCode.value })
    });

    if (res.ok) {
        phoneVerified.value = true;
        codeSectionVisible.value = false;
        codeMessage.value = 'Телефон подтвержден!';
    } else {
        codeMessage.value = 'Неверный код.';
    }
    }

    function startResendTimer() {
    let seconds = 60;
    resendButtonDisabled.value = true;
    resendButtonText.value = `Отправить код повторно (${seconds})`;

    resendTimer.value = setInterval(() => {
        seconds--;
        resendButtonText.value = `Отправить код повторно (${seconds})`;

        if (seconds <= 0) {
        clearInterval(resendTimer.value);
        resendButtonDisabled.value = false;
        resendButtonText.value = 'Отправить код повторно';
        }
    }, 1000);
    }

    function resetPhoneConfirmation() {
        phoneVerified.value = false;
        verifiedPhoneNumber.value = '';
        smsCode.value = '';
        codeMessage.value = '';
        codeSectionVisible.value = false;
        resendButtonDisabled.value = true;
        resendButtonText.value = 'Отправить код повторно';

         requestButtonDisabled.value = false;
        phoneSectionDisabled.value = false;
        codeSended.value = false;
}



    function openEdit() {
        isSwitchingModals.value = true;
        modalChoice?.hide();

        Object.assign(form, selectedPatient.value); // копируем данные пациента

        if (!modalEdit) {
            modalEdit = new bootstrap.Modal(document.getElementById('editModal'));
        }
        modalEdit.show();

      
      setTimeout(() => {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
          if (phoneInput.maskRef?.destroy) {
            phoneInput.maskRef.destroy();
          }

          let digits = (form.phone || '').replace(/\D/g, '');
          digits = digits.slice(1); 

          const mask = IMask(phoneInput, {
            mask: '+7 (000) 000-00-00',
            lazy: false,
            overwrite: true
          });

          phoneInput.maskRef = mask;

          mask.on('accept', () => {
            const digits = mask.value.replace(/\D/g, '');
            const valid = digits.length === 11 && digits.startsWith('7');
            phoneError.value = digits && !valid ? 'Неверный формат телефона' : '';
            form.phone = mask.value;
        
          });

          mask.unmaskedValue = digits;
          form.phone = mask.value;
          
        }
      }, 300);
    }

    function isSelected(p) {
        return selectedPatientId.value === p.id;
    }



    function openLoginChange() {
        isSwitchingModals.value = true;
      modalChoice.hide();

      if (!modalLogin) {
        modalLogin = new bootstrap.Modal(document.getElementById('changeLoginModal'));
      }
      modalLogin.show();

      // Маска логина
      setTimeout(() => {
        const phoneInput = document.getElementById('phoneLogin');
        if (phoneInput) {
          if (phoneInput.maskRef?.destroy) {
            phoneInput.maskRef.destroy();
          }

          let digits = (form.phone || '').replace(/\D/g, '');
          digits = digits.slice(1);

          const mask = IMask(phoneInput, {
            mask: '+7 (000) 000-00-00',
            lazy: false,
            overwrite: true
          });

          phoneInput.maskRef = mask;

          mask.on('accept', () => {
            const digits = mask.value.replace(/\D/g, '');
            const valid = digits.length === 11 && digits.startsWith('7');
            phoneError.value = digits && !valid ? 'Неверный формат телефона' : '';
            form.phone = mask.value;
            updateRequestButtonState();
          });

          mask.unmaskedValue = digits;
          form.phone = mask.value;
          updateRequestButtonState();
        }
      }, 300);
    }

    function onModalHidden() {
        if (isSwitchingModals.value) {
            isSwitchingModals.value = false;
            return;
        }
        selectedPatientId.value = null;
        selectedPatient.value = null;
    }


    async function savePatient() {
      const emailValid = !emailError.value;

      if (!emailValid) {
        return;
      }

      await fetch(`http://192.168.1.207:8080/api/patients/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      modalEdit.hide();
      selectedPatientId.value = null;
        selectedPatient.value = null;
      await loadPatients();
    }

    async function saveLogin() {
        const phoneValid = !phoneError.value && form.phone && phoneVerified.value;

        if (!phoneValid) {
            codeMessage.value = 'Номер не подтвержден.';
            return;
        }

        await fetch(`http://192.168.1.207:8080/api/patients/${form.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: form.phone })
        });

      modalLogin.hide();
      selectedPatientId.value = null;
        selectedPatient.value = null;
      await loadPatients();
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

  loadPatients();
});
    onMounted(loadPatients);

    return {
      patients,
      search,
      form,
      phoneError,
      emailError,
      loadPatients,
      onRowClick,
      openEdit,
      openLoginChange,
      savePatient,
      saveLogin,
      selectedPatient,
      selectedPatientId,
      isSelected,
      onModalHidden,
       phoneVerified,
        verifiedPhoneNumber,
        smsCode,
        codeMessage,
        codeSectionVisible,
        resendButtonDisabled,
        resendButtonText,
        requestCode,
        verifyCode,
        resetPhoneConfirmation,
        requestButtonDisabled,
        phoneSectionDisabled,
        codeSended
    };
  }
}).mount('#app');
