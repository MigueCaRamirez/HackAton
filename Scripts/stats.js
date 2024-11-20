// Función para calcular las donaciones totales por organización
function calculateDonationsByOrganization(donors) {
    const donationData = {};

    donors.forEach(donor => {
        // Si la organización ya está en el objeto, acumula el monto
        if (donationData[donor.organization]) {
            donationData[donor.organization] += parseFloat(donor.amount);
        } else {
            // Si no está, inicializa con el monto del donante
            donationData[donor.organization] = parseFloat(donor.amount);
        }
    });

    return donationData;
}

// Función para generar la gráfica de pastel
function generatePieChart(donationData) {
    const ctx = document.getElementById('donationsChart').getContext('2d');

    const labels = Object.keys(donationData); // Organizaciones
    const data = Object.values(donationData); // Totales por organización

    new Chart(ctx, {
        type: 'pie', // Tipo de gráfica
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'], // Colores
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom' // Ubicación de la leyenda
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(2);
                            return `${context.label}: $${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Función para cargar la lista de donantes desde Local Storage
function loadDonorsList() {
    const storedDonors = localStorage.getItem('donorsList');
    if (storedDonors) {
        return JSON.parse(storedDonors);
    }
    return []; // Si no hay datos, devuelve un arreglo vacío
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar la lista de donantes desde Local Storage
    const donorsList = loadDonorsList();

    // Calcular las donaciones por organización
    const donationData = calculateDonationsByOrganization(donorsList);

    // Generar la gráfica de pastel
    generatePieChart(donationData);
});


