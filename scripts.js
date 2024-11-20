// Arreglo para almacenar los donantes
const donorsList = [];

// Referencias a elementos del DOM
const donationForm = document.getElementById('donationForm');
const donorName = document.getElementById('donorName');
const email = document.getElementById('email');
const donationAmount = document.getElementById('donationAmount');
const donationType = document.getElementById('donationType');
const organizationSelect = document.getElementById('organization');
const donorsListContainer = document.getElementById('donorsList');

// Función para mostrar los donantes en la lista
function displayDonors() {
    donorsListContainer.innerHTML = ''; // Limpiar la lista antes de agregar los elementos
    donorsList.forEach((donor, index) => {
        const donorItem = document.createElement('li');
        donorItem.classList.add('list-group-item');
        donorItem.innerHTML = `
            <strong>${donor.name}</strong> donó ${donor.amount} USD a ${donor.organization}.
        `;
        donorsListContainer.appendChild(donorItem);
    });
}

// Manejador de eventos para el formulario de donación
donationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Recopilar datos del formulario
    const formData = {
        name: donorName.value,
        email: email.value,
        amount: donationAmount.value,
        organization: organizationSelect.options[organizationSelect.selectedIndex].text,
    };

    // Validar datos
    if (formData.amount <= 0) {
        alert('Por favor, ingresa una cantidad válida');
        return;
    }

    // Agregar donante a la lista
    donorsList.push(formData);

    // Mostrar la lista de donantes
    displayDonors();

    // Resetear formulario
    donationForm.reset();
});
