 const { createApp, ref, reactive, onMounted } = Vue;

  createApp({
    setup() {
      const patients = ref([]);
      const search = ref('');
      const form = reactive({ id: null, fullName: '', phone: '', email: '' });
      let modal;

      async function loadPatients() {
        const res = await fetch(`/api/patients?search=${encodeURIComponent(search.value)}`);
        patients.value = await res.json();
      }

      function openEdit(p) {
        Object.assign(form, p);
        modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
      }

      async function savePatient() {
        await fetch(`/api/patients/${form.id}`, {
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