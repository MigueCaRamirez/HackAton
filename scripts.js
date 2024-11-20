// Archivo: script.js
document.getElementById("donationForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const donorName = document.getElementById("donorName").value;
    const amount = document.getElementById("donationAmount").value;
    const organization = document.getElementById("organization").value;
  
    if (donorName && amount && organization) {
      alert(`Gracias, ${donorName}, por donar $${amount} a ${organization}.`);
      this.reset(); // Limpia el formulario después de enviar
    } else {
      alert("Por favor, completa todos los campos.");
    }
  });
  