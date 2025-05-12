const { createApp } = Vue;

createApp({
  data() {
    return {
      tabs: [
        { id: 'patient', label: 'Пациент' },
        { id: 'history', label: 'Анамнез' },
        { id: 'current', label: 'Прием' },
        { id: 'materials', label: 'Материалы' }
      ],
      activeTab: 'patient',
      patient: {
        id: null,
        first_name: '',
        second_name: '',
        surname: '',
        birthDate: '',
        gender: '',
        allergies: []
      },
      doctor: {
        first_name: '',
        second_name: ''
      },
      newAllergy: '',
      newAllergies: [],
      history: [],
      currentVisit: {
        complaints: '',
        diagnosis: '',
        treatment: '',
        selectedServices: []
      },

      services: [],
      materials: [],
      serviceSearch: '',
      materialSearch: '',
      materialQuantities: {},
      isPopoverVisible: false
    };
  },

  computed: {
    fullName() {
      return [this.patient.second_name, this.patient.first_name, this.patient.surname].filter(Boolean).join(' ');
    },
    patientAge() {
      const birth = new Date(this.patient.birthDate);
      const now = new Date();
      return now.getFullYear() - birth.getFullYear() - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    },
    totalPrice() {
      const serviceTotal = this.services
        .filter(s => this.currentVisit.selectedServices.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0);

      const materialTotal = Object.entries(this.materialQuantities).reduce((sum, [id, qty]) => {
        const mat = this.materials.find(m => m.id == id);
        return mat ? sum + mat.price * qty : sum;
      }, 0);

      return serviceTotal + materialTotal;
    },
      accountName() {
        return [
            this.doctor.first_name,
            this.doctor.second_name
        ]
        .filter(Boolean)
        .join(' ');
    },
    filteredServices() {
        const term = this.serviceSearch.toLowerCase();
        return this.services.filter(service =>
            service.name.toLowerCase().includes(term)
        );
    },
    filteredMaterials() {
        const term = this.materialSearch.toLowerCase();
        return this.materials.filter(material =>
            material.name.toLowerCase().includes(term)
        );
    },

  },

  methods: {
    async loadData() {
        const urlParams = new URLSearchParams(window.location.search);
        const appointmentId = urlParams.get('appointment_id') || 1;

        try {
            const res = await fetch(`http://192.168.1.207:8080/api/appointments/${appointmentId}`);
            const data = await res.json();
            this.patient = data.patient;
            this.history = data.history || [];
        } catch (err) {
            console.error('Ошибка загрузки пациента:', err);
        }

        try {
            const [servicesRes, materialsRes] = await Promise.all([
            fetch('http://192.168.1.207:8080/api/services'),
            fetch('http://192.168.1.207:8080/api/materials')
            ]);

            const rawServices = await servicesRes.json();
            const rawMaterials = await materialsRes.json();

            this.services = Array.isArray(rawServices.services) ? rawServices.services : [];
            this.materials = Array.isArray(rawMaterials.materials) ? rawMaterials.materials : [];

            if (!Array.isArray(this.services)) {
            console.error('services не массив:', this.services);
            }

            if (!Array.isArray(this.materials)) {
            console.error('materials не массив:', this.materials);
            }

            this.materials.forEach(mat => {
            this.materialQuantities[mat.id] = 0;
            });

        } catch (err) {
            console.error('Ошибка загрузки услуг или материалов:', err);
        }
        },

     fetchDoctorData() {
      fetch('http://192.168.1.207:8080/api/doctor-data')
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки');
          return res.json();
        })
        .then(json => {
          this.doctor.first_name = json.first_name;
          this.doctor.second_name = json.second_name;
        })
        .catch(err => {
          console.error('Ошибка при получении данных:', err);
        });
    },


    addNewAllergy() {
        const trimmed = this.newAllergy.trim();
        if (trimmed && !this.patient.allergies.includes(trimmed) && !this.newAllergies.includes(trimmed)) {
            this.newAllergies.push(trimmed);
            this.newAllergy = '';
        }
    },

    removeNewAllergy(index) {
        this.newAllergies.splice(index, 1);
    },

     togglePopover() {
            this.isPopoverVisible = !this.isPopoverVisible;
        },

    handleClickOutside(event) {
            const popover = document.getElementById('doctor-profile');
            if (popover && !popover.contains(event.target)) {
                this.isPopoverVisible = false;
            }
        },

    async submitVisit() {
        try {
            const selectedMaterials = Object.entries(this.materialQuantities)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({
                id: Number(id),
                quantity: qty
            }));

            const payload = {
            patient_id: this.patient.id,
            complaints: this.currentVisit.complaints,
            diagnosis: this.currentVisit.diagnosis,
            treatment: this.currentVisit.treatment,
            manipulations: this.currentVisit.selectedServices,
            materials: selectedMaterials
            };

            const res = await fetch(`http://192.168.1.207:8080/api/visits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Ошибка при сохранении приема');

            if (this.newAllergies.length > 0) {
            await fetch(`http://192.168.1.207:8080/api/patients/${this.patient.id}/allergies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allergies: this.newAllergies })
            });
        }

            alert('Прием сохранен');
            window.location.href = '/doctor/schedule';
        } catch (err) {
            console.error(err);
            alert('Ошибка при сохранении.');
        }
    }

},


  mounted() {
    this.loadData();
    document.addEventListener('click', this.handleClickOutside);
  }
}).mount('#app');
