// Función para calcular las donaciones totales por organización
function calculateDonationsByOrganization(donors, organizations) {
    const donationData = {};

    donors.forEach(donor => {
        const organization = organizations.find(org => org.id == donor.organization)?.name || donor.organization;
        if (donationData[organization]) {
            donationData[organization] += parseFloat(donor.amount);
        } else {
            donationData[organization] = parseFloat(donor.amount);
        }
    });

    return donationData;
}

// Función para generar la gráfica de pastel
function generatePieChart(donationData) {
    const ctx = document.getElementById('donationsChart').getContext('2d');
    const labels = Object.keys(donationData);
    const data = Object.values(donationData);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
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

// Función para cargar la lista de donantes y organizaciones desde Local Storage
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Inicializar gráfica al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const donorsList = loadFromLocalStorage("donorsList");
    const organizations = loadFromLocalStorage("organizations");

    const donationData = calculateDonationsByOrganization(donorsList, organizations);
    generatePieChart(donationData);
});