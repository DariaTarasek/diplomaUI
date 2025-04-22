document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (!form) return;

  const emailInput = form.querySelector("input[type='email']");
  const emailError = document.querySelector("[data-email-error]"); 

  if (emailInput && emailError) {
    form.addEventListener("submit", function (e) {
       emailValue = emailInput.value.trim();
      if (emailValue.length > 0) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      
      if (!emailPattern.test(emailValue)) {
        e.preventDefault();
        emailError.style.display = "inline";
      } else {
        emailError.style.display = "none";
      }
      }
    });
  }

});
