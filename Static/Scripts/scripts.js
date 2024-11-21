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
    { id: 1, name: "Fundación Esperanza", description: "Apoyo a comunidades vulnerables.", image: "../static/Images/esperanza.jpg" },
    { id: 2, name: "Ayuda Global", description: "Asistencia humanitaria en todo el mundo.", image: "../tatic/Images/humani.jpg" },
    { id: 3, name: "Red de Solidaridad", description: "Conexión de voluntarios con causas sociales.", image: "../static/Images/red.jpg" },
];

/** 
 * Función para guardar datos en Local Storage
 * @param {string} key - Clave de almacenamiento.
 * @param {any} data - Datos a almacenar.
 */
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Mostrar/ocultar el formulario de inicio de sesión
 */
toggleAdminLogin.addEventListener("click", () => {
    donationSection.style.display = "none";
    adminLoginSection.style.display = "block";
});

cancelLoginButton.addEventListener("click", () => {
    donationSection.style.display = "block";
    adminLoginSection.style.display = "none";
    adminUsername.value = "";
    adminPassword.value = "";
});

/**
 * Manejar inicio de sesión de administrador
 */
adminLoginForm.addEventListener("submit", (e) => {
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

/** 
 * Guardar listas en Local Storage
 */
function saveDonorsList() {
    saveToLocalStorage("donorsList", donorsList);
}
function saveOrganizations() {
    saveToLocalStorage("organizations", organizations);
}

/**
 * Mostrar donantes en modo público
 */
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

/**
 * Mostrar donantes en el panel de administración
 */
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

/**
 * Subir imagen al servidor
 */
document.getElementById("uploadImageForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("orgImageUpload");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    if (!fileInput.files[0] || !fileInput.files[0].type.startsWith("image/")) {
        alert("Por favor, selecciona una imagen válida.");
        return;
    }

    try {
        const response = await fetch("/upload_image", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            document.getElementById("orgImage").value = result.image_url; // Actualizar URL
        } else {
            alert(result.error || "Error al subir la imagen.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor.");
    }
});

// Mostrar organizaciones en el panel de administración
function displayAdminOrganizations() {
    const adminOrganizationsList = document.getElementById("adminOrganizationsList");
    adminOrganizationsList.innerHTML = ""; // Limpia la lista antes de mostrar

    organizations.forEach((org, index) => {
        const orgItem = document.createElement("li");
        orgItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        orgItem.innerHTML = `
            <span><strong>${org.name}</strong></span>
            <div>
                <button class="btn btn-warning btn-sm me-2" onclick="editOrganization(${index})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrganization(${index})">Eliminar</button>
            </div>
        `;
        adminOrganizationsList.appendChild(orgItem);
    });
}

// Agregar nueva organización
document.getElementById("addOrganizationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("orgName").value;
    const description = document.getElementById("orgDescription").value;
    const fileInput = document.getElementById("orgImageUpload").files[0];

    const formData = new FormData();
    formData.append("file", fileInput);

    try {
        const response = await fetch("/upload_image", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            const newOrganization = {
                id: Date.now(),
                name,
                description,
                image: result.image_url,
            };

            organizations.push(newOrganization);
            saveOrganizations();
            displayAdminOrganizations();
            alert("Organización agregada con éxito.");
            e.target.reset();
        } else {
            alert(result.error || "Error al subir la imagen.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor.");
    }
});

// Editar una organización
function editOrganization(index) {
    const org = organizations[index];
    const newName = prompt("Editar nombre:", org.name);
    const newDescription = prompt("Editar descripción:", org.description);

    if (newName && newDescription) {
        organizations[index] = { ...org, name: newName, description: newDescription };
        saveOrganizations();
        displayAdminOrganizations();
        alert("Organización actualizada con éxito.");
    }
}

// Eliminar una organización
function deleteOrganization(index) {
    if (confirm("¿Estás seguro de eliminar esta organización?")) {
        organizations.splice(index, 1);
        saveOrganizations();
        displayAdminOrganizations();
        alert("Organización eliminada con éxito.");
    }
}


/**
 * Agregar nueva organización
 */
addOrganizationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("orgName").value;
    const description = document.getElementById("orgDescription").value;
    const image = document.getElementById("orgImage").value;

    if (!name || !description || !image) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const newOrganization = {
        id: Date.now(),
        name,
        description,
        image,
    };

    organizations.push(newOrganization);
    saveOrganizations();
    updateOrganizationOptions();
    displayAdminOrganizations();
    addOrganizationForm.reset();
    alert("Organización agregada con éxito.");
});

/**
 * Inicialización del sistema
 */
document.addEventListener("DOMContentLoaded", () => {
    updateOrganizationOptions();
    displayDonors();

    toggleDonorsList.addEventListener("click", () => {
        if (donorsListContainer.style.display === "none") {
            donorsListContainer.style.display = "block";
            toggleDonorsList.textContent = "Ocultar Lista de Donantes";
            displayDonors();
        } else {
            donorsListContainer.style.display = "none";
            toggleDonorsList.textContent = "Ver Lista de Donantes";
        }
    });
});

// Manejar el botón de "Cerrar Sesión"
document.getElementById("logoutAdmin").addEventListener("click", () => {
    document.getElementById("adminPanelSection").style.display = "none";
    document.getElementById("donationSection").style.display = "block";


    // Si hay datos en los campos de inicio de sesión, límpialos
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
    alert("Sesión cerrada con éxito");
});
