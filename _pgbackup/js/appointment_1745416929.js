document.addEventListener("DOMContentLoaded", async () => {
  const specialtySelect = document.getElementById("specialtySelect");
  const doctorSelect = document.getElementById("doctorSelect");
  const scheduleContainer = document.getElementById("scheduleContainer");
  const scheduleHead = document.getElementById("scheduleHead");
  const scheduleBody = document.getElementById("scheduleBody");
  const patientForm = document.getElementById("patientForm");
  const userButton = document.getElementById("userButton");

  let selectedDoctorId = null;
  let selectedSlot = null;
  let selectedSpecialization = null;
  let selectedDoctor = null;


  // Загрузка специализаций
  async function loadSpecialties() {
    const response = await fetch("http://192.168.1.207:8080/api/specialties");
    const specialties = await response.json();

    specialties.forEach(spec => {
      const option = document.createElement("option");
      option.value = spec.id;
      option.textContent = spec.name;
      specialtySelect.appendChild(option);
    });
  }

  // Загрузка врачей
  async function loadDoctors(specialtyId) {
    const response = await fetch(`http://192.168.1.207:8080/api/doctors?specialty=${specialtyId}`);
    const doctors = await response.json();

    doctorSelect.innerHTML = '<option selected disabled>Выберите врача</option>';
    doctorSelect.disabled = false;

    doctors.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = `${doc.last_name} ${doc.first_name}`;
      doctorSelect.appendChild(option);
    });
  }

  // Загрузка расписания
  async function loadSchedule(doctorId) {
    const response = await fetch(`http://192.168.1.207:8080/api/schedule?doctor_id=${doctorId}`);
    const schedule = await response.json(); 

    scheduleHead.innerHTML = "";
    scheduleBody.innerHTML = "";
    const dates = Object.keys(schedule);

    const headRow = document.createElement("tr");
    dates.forEach(date => {
      const th = document.createElement("th");
      const day = new Date(date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
      th.textContent = day;
      headRow.appendChild(th);
    });
    scheduleHead.appendChild(headRow);

    // Макс кол-во слотов (строк) в день
    const maxSlots = Math.max(...dates.map(d => schedule[d].length));
    for (let i = 0; i < maxSlots; i++) {
      const tr = document.createElement("tr");
      dates.forEach(date => {
        const times = schedule[date];
        const td = document.createElement("td");

        if (times[i]) {
          const btn = document.createElement("button");
          btn.className = "btn btn-outline-primary btn-sm";
          btn.textContent = times[i];
          btn.onclick = () => selectSlot(`${date}T${times[i]}`);
          td.appendChild(btn);
        }

        tr.appendChild(td);
      });
      scheduleBody.appendChild(tr);
    }

    scheduleContainer.classList.remove("d-none");
  }

  // Выбор времени
  function selectSlot(slot) {
    selectedSlot = slot;
    showPatientForm();
    // patientForm.classList.remove("d-none");
    loadPatientData(); // попробовать подтянуть личные данные
  }

    function showPatientForm() {
    document.getElementById("step-1").style.display = "none";
    document.getElementById("step-2").style.display = "block";
    document.getElementById("step-2").classList.remove("d-none");

    const [date, time] = selectedSlot.split("T");

    document.getElementById("summary-specialization").textContent = selectedSpecialization?.name || "-";
    document.getElementById("summary-doctor").textContent = selectedDoctor?.name || "-";
    document.getElementById("summary-date").textContent = new Date(date).toLocaleDateString('ru-RU');
    document.getElementById("summary-time").textContent = time;
    }




  // Загрузка данных пациента, если авторизован
  async function loadPatientData() {
    try {
      const response = await fetch("http://192.168.1.207:8080/api/patient/me");
      if (!response.ok) return;
      const patient = await response.json();
      document.getElementById("secondName").value = patient.second_name || "";
      document.getElementById("firstName").value = patient.first_name || "";
      document.getElementById("surname").value = patient.surname || "";
      document.getElementById("birthDate").value = patient.birth_date || "";
      document.getElementById("phone").value = patient.phone || "";
      if (patient.gender === "Мужской") document.getElementById("genderMale").checked = true;
      if (patient.gender === "Женский") document.getElementById("genderFemale").checked = true;
      userButton.textContent = `${patient.first_name} ${patient.second_name}`;
      userButton.removeAttribute("href");
      userButton.style.pointerEvents = "none";
      userButton.style.opacity = "0.7";
    } catch (e) {
      console.warn("Пациент не авторизован");
    }
  }

  // Отправка формы
  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedSlot || !selectedDoctorId) return alert("Выберите врача и время");

    const payload = {
      doctor_id: selectedDoctorId,
      slot: selectedSlot,
      patient: {
        second_name: document.getElementById("secondName").value,
        first_name: document.getElementById("firstName").value,
        surname: document.getElementById("surname").value,
        birth_date: document.getElementById("birthDate").value,
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        phone: document.getElementById("phone").value
      }
    };

    const response = await fetch("http://192.168.1.207:8080/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Запись успешно создана!");
      location.reload();
    } else {
      alert("Ошибка при записи. Попробуйте позже.");
    }
  });

  // Слушатели
  specialtySelect.addEventListener("change", () => {
    const id = specialtySelect.value;
    selectedSpecialization = {
        id,
        name: specialtySelect.options[specialtySelect.selectedIndex].textContent
    };
    doctorSelect.disabled = true;
    scheduleContainer.classList.add("d-none");
    //patientForm.classList.add("d-none");
    selectedDoctorId = null;
    selectedSlot = null;
    loadDoctors(id);
  });

  doctorSelect.addEventListener("change", () => {
    selectedDoctorId = doctorSelect.value;
    selectedDoctor = {
        id: doctorSelect.value,
        name: doctorSelect.options[doctorSelect.selectedIndex].textContent
    };

    scheduleContainer.classList.add("d-none");
    //patientForm.classList.add("d-none");
    selectedSlot = null;
    loadSchedule(selectedDoctorId);
  });

  document.getElementById("backButton").addEventListener("click", () => {
  // Скрыть форму с данными пациента
  document.getElementById("step-2").classList.add("d-none");

  // Снова показать выбор врача и времени
  document.getElementById("step-1").style.display = "block";

  // Сброс выбранного слота (если нужно)
  selectedSlot = null;
});

  // Старт
  loadSpecialties();
});
