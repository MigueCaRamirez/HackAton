// Constantes de credenciales de administrador
const ADMIN_CREDENTIALS = { username: "admin", password: "1234" };

// Diccionario de mapeo para las organizaciones
const organizationsMap = {
    org1: "Fundación Esperanza",
    org2: "Alianza por la Vida",
    org3: "Ayuda Global",
};

// Variables de referencia a los elementos del DOM
const donationSection = document.getElementById("donationSection");
const adminLoginSection = document.getElementById("adminLoginSection");
const adminPanelSection = document.getElementById("adminPanelSection");
const donationForm = document.getElementById("donationForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminUsername = document.getElementById("adminUsername");
const adminPassword = document.getElementById("adminPassword");
const logoutAdminButton = document.getElementById("logoutAdmin");
const adminDonorsList = document.getElementById("adminDonorsList");
const toggleAdminLogin = document.getElementById("toggleAdminLogin");
const toggleDonorsList = document.getElementById("toggleDonorsList");
const donorsListContainer = document.getElementById("donorsList");
const cancelLoginButton = document.getElementById("cancelLoginButton"); // Nuevo botón de cancelación

// Cargar donantes desde LocalStorage
let donorsList = JSON.parse(localStorage.getItem("donorsList")) || [];

// Guardar donantes en LocalStorage
function saveDonorsList() {
    localStorage.setItem("donorsList", JSON.stringify(donorsList));
}

// Mostrar donantes en modo público
function displayDonors() {
    donorsListContainer.innerHTML = ""; // Limpiar la lista antes de agregar los elementos
    donorsList.forEach((donor) => {
        const donorItem = document.createElement("li");
        donorItem.classList.add("list-group-item");

        // Reemplazar el valor de organización por su nombre legible
        const organizationName = organizationsMap[donor.organization] || donor.organization;

        donorItem.innerHTML = `
            <strong>${donor.name}</strong> donó ${donor.amount} USD a ${organizationName}.
            <br> Mensaje: ${donor.message}.
        `;
        donorsListContainer.appendChild(donorItem);
    });
}

// Mostrar la lista de donantes en el panel de administración
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

// Alternar lista de donantes en público
toggleDonorsList.addEventListener("click", () => {
    if (donorsListContainer.style.display === "none") {
        donorsListContainer.style.display = "block";
        displayDonors();
    } else {
        donorsListContainer.style.display = "none";
    }
});

// Manejar el formulario de donación
donationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Recopilar datos del formulario
    const formData = {
        name: document.getElementById("donorName").value,
        email: document.getElementById("email").value,
        donationType: document.getElementById("donationType").value, // Guardamos el tipo, pero no lo mostramos
        amount: document.getElementById("donationAmount").value,
        organization: document.getElementById("organization").value,
        message: document.getElementById("message").value,
    };

    // Validar datos
    if (formData.amount <= 0) {
        alert("Por favor, ingresa una cantidad válida");
        return;
    }

    // Agregar donante a la lista
    donorsList.push(formData);
    saveDonorsList();

    // Limpiar formulario
    donationForm.reset();
    alert("¡Donación registrada con éxito!");
});

// Mostrar formulario de inicio de sesión
toggleAdminLogin.addEventListener("click", () => {
    donationSection.style.display = "none";
    adminLoginSection.style.display = "block";
});

// Manejar inicio de sesión de administrador
adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = adminUsername.value;
    const password = adminPassword.value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        adminLoginSection.style.display = "none";
        adminPanelSection.style.display = "block";
        displayAdminDonors();

        // Limpiar campos de usuario y contraseña
        adminUsername.value = "";
        adminPassword.value = "";
    } else {
        alert("Credenciales incorrectas");
    }
});

// Botón para cancelar inicio de sesión
cancelLoginButton.addEventListener("click", () => {
    // Regresar a la sección de donación
    donationSection.style.display = "block";
    adminLoginSection.style.display = "none";

    // Limpiar campos de usuario y contraseña
    adminUsername.value = "";
    adminPassword.value = "";
});

// Actualizar un donante
function updateDonor(index) {
    const donor = donorsList[index];
    const newAmount = prompt("Actualizar cantidad:", donor.amount);
    if (newAmount !== null && newAmount > 0) {
        donor.amount = newAmount;
        saveDonorsList();
        displayAdminDonors();
    } else {
        alert("Cantidad inválida");
    }
}

// Eliminar un donante
function deleteDonor(index) {
    if (confirm("¿Estás seguro de eliminar este donante?")) {
        donorsList.splice(index, 1);
        saveDonorsList();
        displayAdminDonors();
    }
}

// Cerrar sesión de administrador
logoutAdminButton.addEventListener("click", () => {
    adminPanelSection.style.display = "none";
    donationSection.style.display = "block";

    // Limpiar campos de usuario y contraseña al salir
    adminUsername.value = "";
    adminPassword.value = "";
});


//validaciones del estadisticasorg

document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Formulario enviado exitosamente. La organización se pondrá en contacto contigo.');
    this.reset();
});

