document.addEventListener('DOMContentLoaded', function () {
    // Inicializar DataTable
    const table = $('#donorsTable').DataTable();

    // Lista de donantes (inicializa desde LocalStorage o vacío)
    let donorsList = JSON.parse(localStorage.getItem('donorsList')) || [];

    // Función para guardar en LocalStorage
    function saveDonorsList() {
        localStorage.setItem('donorsList', JSON.stringify(donorsList));
    }

    // Función para cargar datos existentes en la tabla al inicio
    function loadTableData() {
        table.clear(); // Limpiar tabla antes de agregar datos
        donorsList.forEach((donor, index) => {
            addRowToTable(donor, index);
        });
    };

    const organizationsMap = {
        org1: "Fundación Esperanza",
        org2: "Alianza por la Vida",
        org3: "Ayuda Global",
    };

    // Función para agregar una fila a la tabla
    function addRowToTable(donor, index) {
        table.row.add([
            index + 1,
            donor.name,
            donor.email,
            `$${donor.amount}`,
            donor.organization,
            donor.message || "Sin mensaje",
            `
            <button class="btn btn-warning btn-sm" onclick="updateDonor(${index})">Actualizar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteDonor(${index})">Eliminar</button>
            `,
        ]).draw(false);
    }

    // Cargar datos iniciales al cargar la página
    loadTableData();

    // Variables de referencia a los elementos del DOM
    const donationSection = document.getElementById("donationSection");
    const adminLoginSection = document.getElementById("adminLoginSection");
    const adminPanelSection = document.getElementById("adminPanelSection");
    const adminUsername = document.getElementById("adminUsername");
    const adminPassword = document.getElementById("adminPassword");
    const logoutAdminButton = document.getElementById("logoutAdmin");
    const toggleAdminLogin = document.getElementById("toggleAdminLogin");
    const toggleDonorsList = document.getElementById("toggleDonorsList");
    const adminDonorsList = document.getElementById("adminDonorsList");
    const donorsListContainer = document.getElementById("donorsList");
    const donationForm = document.getElementById("donationForm");
    const cancelLoginButton = document.getElementById("cancelLoginButton"); // Nuevo botón de cancelación

    // Alternar lista de donantes en público
    toggleDonorsList.addEventListener("click", () => {
        if (donorsListContainer.style.display === "none") {
            donorsListContainer.style.display = "block";
            displayDonors();
        } else {
            donorsListContainer.style.display = "none";
        }
    });

    // Mostrar donantes en modo público
    function displayDonors() {
        donorsListContainer.innerHTML = ""; // Limpiar la lista antes de agregar los elementos
        donorsList.forEach((donor) => {
            const donorItem = document.createElement("li");
            donorItem.classList.add("list-group-item");

            // Reemplazar el valor de organización por su nombre legible
            const organizationName = donor.organization;

            donorItem.innerHTML = `
                <strong>${donor.name}</strong> donó ${donor.amount} USD a ${organizationName}.
                <br> Mensaje: ${donor.message}.
            `;
            donorsListContainer.appendChild(donorItem);
        });
    }

    // Manejar el formulario de donación
    donationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const newDonor = {
            name: document.getElementById("donorName").value,
            email: document.getElementById("email").value,
            amount: parseFloat(document.getElementById("donationAmount").value),
            organization: document.getElementById("organization").value,
            message: document.getElementById("message").value,
        };

        if (newDonor.amount <= 0) {
            alert("Por favor, ingresa una cantidad válida.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDonor),
            });

            const result = await response.json();
            if (!response.ok) {
                alert('Error al enviar el correo: ' + result.error);
                return;
            }

            donorsList.push(newDonor);
            saveDonorsList();

            // Agregar el nuevo donante a la tabla
            addRowToTable(newDonor, donorsList.length - 1);
            donationForm.reset();
            alert("¡Donación registrada con éxito! Revisa tu correo.");
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al enviar tu donación.');
        }
    });

    // Actualizar un donante
    updateDonor = function (index) {
        const donor = donorsList[index];
        const newAmount = prompt("Actualizar cantidad:", donor.amount);
        if (newAmount !== null && newAmount > 0) {
            donor.amount = parseFloat(newAmount);
            saveDonorsList();
            loadTableData();
        } else {
            alert("Cantidad inválida");
        }
    };

    function displayAdminDonors() {
        adminDonorsList.innerHTML = ""; // Limpiar la lista antes de agregar los elementos
        donorsList.forEach((donor, index) => {
            const donorItem = document.createElement("li");
            donorItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

            // Reemplazar el valor de organización por su nombre legible
            const organizationName = organizationsMap[donor.organization] || donor.organization;

            donorItem.innerHTML = `
                <span><strong>${donor.name}</strong> donó ${donor.amount} USD a ${organizationName}</span>
                <div>
                    <button class="btn btn-warning btn-sm me-2" onclick="updateDonor(${index})">Actualizar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDonor(${index})">Eliminar</button>
                </div>
            `;
            adminDonorsList.appendChild(donorItem);
        });
    }

    // Eliminar un donante
    deleteDonor = function (index) {
        if (confirm("¿Estás seguro de eliminar este donante?")) {
            donorsList.splice(index, 1);
            saveDonorsList();
            loadTableData();
        }
    };

    // Mostrar formulario de inicio de sesión
    toggleAdminLogin.addEventListener("click", () => {
        donationSection.style.display = "none";
        adminLoginSection.style.display = "block";
    });

    // Manejar inicio de sesión de administrador
    const ADMIN_CREDENTIALS = { username: "admin", password: "1234" };
    adminLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = adminUsername.value;
        const password = adminPassword.value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            adminLoginSection.style.display = "none";
            adminPanelSection.style.display = "block";
            loadTableData();
            displayAdminDonors();
            // Limpiar campos de usuario y contraseña
            adminUsername.value = "";
            adminPassword.value = "";
        } else {
            alert("Credenciales incorrectas");
        }
    });

    // Botón para cerrar sesión de administrador
    logoutAdminButton.addEventListener("click", () => {
        adminPanelSection.style.display = "none";
        donationSection.style.display = "block";
    });

    // Botón para cancelar inicio de sesión
    cancelLoginButton.addEventListener("click", () => {
        donationSection.style.display = "block";
        adminLoginSection.style.display = "none";

        adminUsername.value = "";
        adminPassword.value = "";
    });

    // Actualizar barras de progreso
    function updateProgressBars() {
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.innerHTML = ''; // Limpiar contenido previo

        // Calcular las donaciones por organización
        const donationData = donorsList.reduce((acc, donor) => {
            acc[donor.organization] = (acc[donor.organization] || 0) + parseFloat(donor.amount);
            return acc;
        }, {});

        // Metas por organización con un valor predeterminado de 100,000
        const organizationGoals = {
            "Fundación Esperanza": 10000,
            "Alianza por la Vida": 5000,
            "Ayuda Global": 7500
        };

        let defaultGoal = 100000; // Meta predeterminada para organizaciones no definidas

        for (const organization in donationData) {
            const totalDonated = donationData[organization];
            const goal = organizationGoals[organization] || defaultGoal; // Usar meta predeterminada si no está definida
            const progress = Math.min((totalDonated / goal) * 100, 100);

            // Crear un contenedor para la barra
            const progressWrapper = document.createElement('div');
            progressWrapper.classList.add('progress-wrapper');
            progressWrapper.style.marginBottom = '20px';

            // Título de la organización y progreso
            const title = document.createElement('p');
            title.innerHTML = `<strong>${organization}</strong>: $${totalDonated.toLocaleString()} / $${goal.toLocaleString()}`;
            progressWrapper.appendChild(title);

            // Barra de progreso
            const progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar-container');
            progressBar.style.backgroundColor = '#f0f0f0';
            progressBar.style.borderRadius = '8px';
            progressBar.style.position = 'relative';
            progressBar.style.height = '24px';

            const progressFill = document.createElement('div');
            progressFill.classList.add('progress-fill');
            progressFill.style.width = `${progress}%`;
            progressFill.style.backgroundColor = '#28a745';
            progressFill.style.height = '100%';
            progressFill.style.borderRadius = '8px';

            progressBar.appendChild(progressFill);
            progressWrapper.appendChild(progressBar);
            progressContainer.appendChild(progressWrapper);
        }
    }

    // Actualizar las barras de progreso al inicio
    updateProgressBars();
});
