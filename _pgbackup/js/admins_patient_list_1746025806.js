 const { createApp, ref, reactive, onMounted } = Vue;

  createApp({
    setup() {
      const patients = ref([]);
      const search = ref('');
      const form = reactive({ id: null, second_name: '', first_name: '', birthDate: '', gender: '', surname: '', phone: '', email: '' });
      let modal;

      async function loadPatients() {
        const res = await fetch(`http://192.168.1.207:8080/api/patients?search=${encodeURIComponent(search.value)}`);
        patients.value = await res.json();
      }

      function openEdit(p) {
        Object.assign(form, p);
        modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
      }

      async function savePatient() {
        await fetch(`http://192.168.1.207:8080/api/patients/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        modal.hide();
        await loadPatients();
      }

      onMounted(loadPatients);

      return { patients, search, form, loadPatients, openEdit, savePatient };
    }
  }).mount('#app');