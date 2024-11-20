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
        table.clear();
        donorsList.forEach((donor, index) => {
            addRowToTable(donor, index);
        });
    }

    // Función para agregar una fila a la tabla
    function addRowToTable(donor, index) {
        table.row.add([
            index + 1,
            donor.name,
            donor.email,
            `$${donor.amount}`,
            donor.organization,
            donor.message || "Sin mensaje"
        ]).draw(false);
    }

    // Cargar datos iniciales al cargar la página
    loadTableData();

    // Manejar el formulario de donación
    const donationForm = document.getElementById("donationForm");
    donationForm.addEventListener('submit', function (e) {
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

        // Agregar el nuevo donante a la lista
        donorsList.push(newDonor);
        saveDonorsList();

        // Agregar el nuevo donante a la tabla
        addRowToTable(newDonor, donorsList.length - 1);

        // Limpiar el formulario y mostrar mensaje de éxito
        donationForm.reset();
        alert("¡Donación registrada con éxito!");
    });

    // Mostrar formulario de inicio de sesión (si aplica en tu proyecto)
    const toggleAdminLogin = document.getElementById("toggleAdminLogin");
    const donationSection = document.getElementById("donationSection");
    const adminLoginSection = document.getElementById("adminLoginSection");

    toggleAdminLogin.addEventListener("click", () => {
        donationSection.style.display = "none";
        adminLoginSection.style.display = "block";
    });

    // Manejar inicio de sesión de administrador
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminPanelSection = document.getElementById("adminPanelSection");
    const adminUsername = document.getElementById("adminUsername");
    const adminPassword = document.getElementById("adminPassword");
    const logoutAdminButton = document.getElementById("logoutAdmin");

    adminLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const ADMIN_CREDENTIALS = { username: "admin", password: "1234" };
        const username = adminUsername.value;
        const password = adminPassword.value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            adminLoginSection.style.display = "none";
            adminPanelSection.style.display = "block";

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
});
