// Constantes de credenciales de administrador
const ADMIN_CREDENTIALS = { username: "admin", password: "1234" };

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
const cancelLoginButton = document.getElementById("cancelLoginButton");
const addOrganizationForm = document.getElementById("addOrganizationForm");
const adminOrganizationsList = document.getElementById("adminOrganizationsList");

// Donantes (cargar desde Local Storage o inicializar vacío)
let donorsList = JSON.parse(localStorage.getItem("donorsList")) || [];

// Organizaciones (cargar desde Local Storage o inicializar por defecto)
let organizations = JSON.parse(localStorage.getItem("organizations")) || [
    { id: 1, name: "Fundación Esperanza", description: "Apoyo a comunidades vulnerables.", image: "Images/esperanza.jpg" },
    { id: 2, name: "Ayuda Global", description: "Asistencia humanitaria en todo el mundo.", image: "Images/humani.jpg" },
    { id: 3, name: "Red de Solidaridad", description: "Conexión de voluntarios con causas sociales.", image: "Images/red.jpg" },
];

// Función para guardar datos en Local Storage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
// Mostrar formulario de inicio de sesión
toggleAdminLogin.addEventListener("click", () => {
    donationSection.style.display = "none";
    adminLoginSection.style.display = "block";
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
// Guardar donantes y organizaciones
function saveDonorsList() {
    saveToLocalStorage("donorsList", donorsList);
}
function saveOrganizations() {
    saveToLocalStorage("organizations", organizations);
}

// Mostrar donantes en modo público
function displayDonors() {
    donorsListContainer.innerHTML = "";
    donorsList.forEach(donor => {
        const organization = organizations.find(org => org.id == donor.organization)?.name || donor.organization;
        const donorItem = document.createElement("li");
        donorItem.classList.add("list-group-item");
        donorItem.innerHTML = `
            <strong>${donor.name}</strong> donó ${donor.amount} USD a ${organization}.
            <br> Mensaje: ${donor.message}.
        `;
        donorsListContainer.appendChild(donorItem);
    });
}

// Mostrar donantes en el panel de administración
function displayAdminDonors() {
    adminDonorsList.innerHTML = "";
    donorsList.forEach((donor, index) => {
        const organization = organizations.find(org => org.id == donor.organization)?.name || donor.organization;
        const donorItem = document.createElement("li");
        donorItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        donorItem.innerHTML = `
            <span><strong>${donor.name}</strong> donó ${donor.amount} USD a ${organization}</span>
            <div>
                <button class="btn btn-warning btn-sm me-2" onclick="updateDonor(${index})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDonor(${index})">Eliminar</button>
            </div>
        `;
        adminDonorsList.appendChild(donorItem);
    });
}

// Mostrar organizaciones en el panel de administración
function displayAdminOrganizations() {
    adminOrganizationsList.innerHTML = "";
    organizations.forEach((org, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        listItem.innerHTML = `
            <span><strong>${org.name}</strong></span>
            <div>
                <button class="btn btn-warning btn-sm me-2" onclick="editOrganization(${index})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrganization(${index})">Eliminar</button>
            </div>
        `;
        adminOrganizationsList.appendChild(listItem);
    });
}

// Mostrar lista de organizaciones en el formulario de donación
function updateOrganizationOptions() {
    const organizationSelect = document.getElementById("organization");
    organizationSelect.innerHTML = "";
    organizations.forEach(org => {
        const option = document.createElement("option");
        option.value = org.id;
        option.textContent = org.name;
        organizationSelect.appendChild(option);
    });
}

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

// Agregar una nueva organización
addOrganizationForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("orgName").value;
    const description = document.getElementById("orgDescription").value;
    const image = document.getElementById("orgImage").value;

    const newOrganization = {
        id: Date.now(),
        name,
        description,
        image
    };

    organizations.push(newOrganization);
    saveOrganizations();
    updateOrganizationOptions();
    displayAdminOrganizations();
    addOrganizationForm.reset();
    alert("Organización agregada con éxito.");
});

// Editar una organización
function editOrganization(index) {
    const org = organizations[index];
    const newName = prompt("Editar nombre:", org.name);
    const newDescription = prompt("Editar descripción:", org.description);
    const newImage = prompt("Editar URL de imagen:", org.image);

    if (newName && newDescription && newImage) {
        organizations[index] = { ...org, name: newName, description: newDescription, image: newImage };
        saveOrganizations();
        updateOrganizationOptions();
        displayAdminOrganizations();
        alert("Organización actualizada con éxito.");
    }
}

// Eliminar una organización
function deleteOrganization(index) {
    if (confirm("¿Estás seguro de eliminar esta organización?")) {
        organizations.splice(index, 1);
        saveOrganizations();
        updateOrganizationOptions();
        displayAdminOrganizations();
        alert("Organización eliminada con éxito.");
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    updateOrganizationOptions();
    displayDonors();

    toggleDonorsList.addEventListener("click", () => {
        if (donorsListContainer.style.display === "none") {
            donorsListContainer.style.display = "block";
            displayDonors();
        } else {
            donorsListContainer.style.display = "none";
        }
    });

    // Inicio de sesión de administrador
    adminLoginForm.addEventListener("submit", e => {
        e.preventDefault();
        const username = adminUsername.value;
        const password = adminPassword.value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            adminLoginSection.style.display = "none";
            adminPanelSection.style.display = "block";
            displayAdminDonors();
            displayAdminOrganizations();
            adminUsername.value = "";
            adminPassword.value = "";
        } else {
            alert("Credenciales incorrectas");
        }
    });

    cancelLoginButton.addEventListener("click", () => {
        donationSection.style.display = "block";
        adminLoginSection.style.display = "none";
    });

    logoutAdminButton.addEventListener("click", () => {
        adminPanelSection.style.display = "none";
        donationSection.style.display = "block";
    });
});
