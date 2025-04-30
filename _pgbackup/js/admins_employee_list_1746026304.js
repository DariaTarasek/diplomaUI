const { createApp, ref, reactive, onMounted } = Vue;

  createApp({
    setup() {
      const search = ref('');
      const filters = reactive({ role: '', specialty: '' });
      const staff = ref([]);
      const roles = ref([]);
      const specialties = ref([]);
      const form = reactive({ id: '', second_name: '', first_name: '', surname: '', email: '', role: '', specialty: '', gender: ''});
      let modal;

      async function loadRoles() {
        roles.value = await (await fetch('http://192.168.1.207:8080/api/roles')).json();
      }

      async function loadSpecialties() {
        specialties.value = await (await fetch('http://192.168.1.207:8080/api/specialties')).json();
      }

      function getRoleName(id) {
        return roles.value.find(r => r.id === id)?.name || id;
      }

      function getSpecialtyName(id) {
        return specialties.value.find(s => s.id === id)?.name || '-';
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

      function onRoleChange() {
        if (filters.role !== 'doctor') filters.specialty = '';
        loadStaff();
      }

      function openEdit(s) {
        Object.assign(form, s);
        modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
      }

      async function saveStaff() {
        await fetch(`http://192.168.1.207:8080/api/staff/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        modal.hide();
        loadStaff();
      }

      onMounted(async () => {
        await loadRoles();
        await loadSpecialties();
        await loadStaff();
      });

      return {
        search, filters, staff, roles, specialties, form,
        loadStaff, getRoleName, getSpecialtyName,
        openEdit, saveStaff, onRoleChange
      };
    }
  }).mount('#app');