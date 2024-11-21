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
    }
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
            `<button class="btn btn-warning btn-sm" onclick="updateDonor(${index})">Actualizar</button>
             <button class="btn btn-danger btn-sm" onclick="deleteDonor(${index})">Eliminar</button>`
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

        // Recopilar datos del formulario
        const newDonor = {
            name: document.getElementById("donorName").value,
            email: document.getElementById("email").value,
            amount: parseFloat(document.getElementById("donationAmount").value),
            organization: document.getElementById("organization").value,
            message: document.getElementById("message").value,
        };

        // Validar el monto de donación
        if (newDonor.amount <= 0) {
            alert("Por favor, ingresa una cantidad válida.");
            return;
        }

        try {
            // Enviar correo al backend (si es necesario)
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDonor),
            });

            const result = await response.json();
            if (!response.ok) {
                alert('Error al enviar el correo: ' + result.error);
                return;
            }

            // Agregar el nuevo donante a la lista
            donorsList.push(newDonor);
            saveDonorsList();

            // Agregar el nuevo donante a la tabla
            addRowToTable(newDonor, donorsList.length - 1);

            // Limpiar el formulario y mostrar mensaje de éxito
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
});
