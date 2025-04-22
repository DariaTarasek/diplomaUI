document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/doctors")
    .then(res => res.json())
    .then(doctors => {
      const container = document.getElementById("doctorsContainer");
      const template = document.getElementById("doctorTemplate");

      container.innerHTML = ""; // очищаем контейнер перед добавлением

      doctors.forEach(doctor => {
        const clone = template.cloneNode(true);
        clone.style.display = "block";
        clone.id = ""; // убираем id, чтобы не было дубликатов

        // Настроим имя и специализацию
        const title = clone.querySelector(".card-title");
        const text = clone.querySelector(".card-text");
        const img = clone.querySelector(".card-img-top");

        if (title) title.textContent = doctor.name;
        if (text) text.textContent = "Специализация: " + doctor.specialty;
        if (img) img.setAttribute("src", doctor.photo_url); // устанавливаем картинку

        container.appendChild(clone);
      });
    })
    .catch(err => {
      console.error("Ошибка:", err);
    });
});
