document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/doctors")
    .then(res => res.json())
    .then(doctors => {
      const container = document.getElementById("doctorsContainer");
      const template = document.getElementById("doctorTemplate");

      container.innerHTML = "";

      doctors.forEach(doctor => {
        const clone = template.cloneNode(true);
        clone.style.display = "block";
        clone.id = ""; // убираем id, чтобы не было дубликатов

        // Найдём элементы внутри карточки
        const title = clone.querySelector(".card-title");
        const text = clone.querySelector(".card-text");

        if (title) title.textContent = doctor.name;
        if (text) text.textContent = "Специализация: " + doctor.specialty;

        container.appendChild(clone);
      });
    })
    .catch(err => {
      console.error("Ошибка:", err);
    });
});
