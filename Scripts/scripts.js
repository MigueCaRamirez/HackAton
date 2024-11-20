// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const donationForm = document.getElementById('donationForm');
    const donorName = document.getElementById('donorName');
    const email = document.getElementById('email');
    const donationAmount = document.getElementById('donationAmount');
    const donationType = document.getElementById('donationType');
    const organizationSelect = document.getElementById('organization');
    const donorMessage = document.getElementById('message');
    const donorsListContainer = document.getElementById('donorsList');
    const toggleDonorsListButton = document.getElementById('toggleDonorsList');

    // Cargar los donantes desde Local Storage
    let donorsList = loadDonorsList();

    // Configuración de cantidades sugeridas por tipo de donación
    const suggestedAmounts = {
        monthly: [10, 25, 50, 100],
        oneTime: [50, 100, 250, 500]
    };

    // Función para validar el correo electrónico
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Función para formatear números como moneda
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Función para mostrar los donantes en la lista
    function displayDonors() {
        donorsListContainer.innerHTML = ''; // Limpiar la lista antes de agregar los elementos
        donorsList.forEach((donor) => {
            const donorItem = document.createElement('li');
            donorItem.classList.add('list-group-item');
            donorItem.innerHTML = `
                <strong>${donor.name}</strong> donó ${donor.amount} USD a ${donor.organization}.
                <br> Tipo de donación: ${donor.type}. 
                <br> Descripción del mensaje: ${donor.message}.
            `;
            donorsListContainer.appendChild(donorItem);
        });
    }

    // Función para guardar la lista de donantes en Local Storage
    function saveDonorsList() {
        localStorage.setItem('donorsList', JSON.stringify(donorsList));
    }

    // Función para cargar la lista de donantes desde Local Storage
    function loadDonorsList() {
        const storedDonors = localStorage.getItem('donorsList');
        if (storedDonors) {
            return JSON.parse(storedDonors);
        }
        return []; // Si no hay datos, devuelve un arreglo vacío
    }

    // Función para mostrar u ocultar la lista de donantes
    toggleDonorsListButton.addEventListener('click', function() {
        if (donorsListContainer.style.display === 'none') {
            donorsListContainer.style.display = 'block';
            displayDonors(); // Mostrar los donantes cuando se haga clic
        } else {
            donorsListContainer.style.display = 'none'; // Ocultar la lista
        }
    });

    // Función para mostrar alertas
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        donationForm.insertAdjacentElement('beforebegin', alertDiv);

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Función para procesar la donación
    function processDonation(data) {
        showAlert('¡Gracias por tu donación!', 'success');
        donationForm.reset();

        // Agregar donante a la lista
        donorsList.push(data);

        // Guardar la lista de donantes en Local Storage
        saveDonorsList();

        // Mostrar la lista de donantes
        displayDonors();
    }

    // Función para actualizar estadísticas (dummy function for demo)
    function updateStatistics(amount) {
        const stats = document.querySelectorAll('.stat-box h3');
        stats.forEach(stat => {
            const currentValue = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
            animateNumber(stat, currentValue, currentValue + 1);
        });
    }

    // Función para animar números
    function animateNumber(element, start, end) {
        let current = start;
        const increment = (end - start) / 30;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current).toLocaleString();
            if (current >= end) {
                clearInterval(timer);
                element.textContent = end.toLocaleString();
            }
        }, 50);
    }

    // Función para actualizar sugerencias de monto según el tipo de donación
    donationType.addEventListener('change', function() {
        const amounts = suggestedAmounts[this.value];
        if (amounts) {
            const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
            donationAmount.placeholder = `Sugerencia: ${formatCurrency(randomAmount)}`;
        }
    });

    // Manejador de eventos para el formulario de donación
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Recopilar datos del formulario
        const formData = {
            name: donorName.value,
            email: email.value,
            amount: donationAmount.value,
            organization: organizationSelect.value,
            type: donationType.value,
            message: donorMessage.value
        };

        // Validar correo electrónico
        if (!isValidEmail(formData.email)) {
            showAlert('Por favor, introduce un correo electrónico válido', 'error');
            return;
        }

        // Validar monto
        if (formData.amount <= 0) {
            showAlert('Por favor, introduce un monto válido', 'error');
            return;
        }

        // Procesar la donación
        processDonation(formData);

        // Actualizar estadísticas (dummy update)
        updateStatistics(formData.amount);
    });

    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
})