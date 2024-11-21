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

    document.addEventListener("DOMContentLoaded", function () {
        const organizationWrapper = document.getElementById("organizationWrapper");
    
        // Función para cargar las organizaciones desde el archivo JSON
        async function loadOrganizations() {
            try {
                const response = await fetch("organizations.json");
                if (!response.ok) {
                    throw new Error("Error al cargar las organizaciones");
                }
                const organizations = await response.json();
    
                // Renderizar las organizaciones en el HTML
                renderOrganizations(organizations);
            } catch (error) {
                console.error("Error al cargar las organizaciones:", error);
            }
        }
    
        // Función para renderizar las organizaciones en el HTML
        function renderOrganizations(organizations) {
            organizationWrapper.innerHTML = ""; // Limpiar contenido previo
    
            organizations.forEach((org) => {
                const col = document.createElement("div");
                col.classList.add("col-md-4", "mb-4");
    
                col.innerHTML = `
                    <div class="card shadow">
                        <img src="${org.image}" class="card-img-top" alt="${org.name}">
                        <div class="card-body">
                            <h5 class="card-title">${org.name}</h5>
                            <p class="card-text">${org.description}</p>
                            <p><strong>Ubicación:</strong> (${org.lat}, ${org.lng})</p>
                        </div>
                    </div>
                `;
    
                organizationWrapper.appendChild(col);
            });
        }
    
        // Llamar a la función para cargar las organizaciones
        loadOrganizations();
    });
    
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

// Actualizar las opciones del formulario de donación
function updateOrganizationOptions(organizations) {
    const organizationSelect = document.getElementById("organization");
    organizationSelect.innerHTML = "";
    organizations.forEach(org => {
        const option = document.createElement("option");
        option.value = org.id;
        option.textContent = org.name;
        organizationSelect.appendChild(option);
    });
}

// Actualizar organizaciones desde el backend y reflejarlas en el mapa y en las opciones
async function loadOrganizations() {
    try {
        const response = await fetch('/organizations');
        const organizations = await response.json();

        const organizationSelect = document.getElementById("organization");
        organizationSelect.innerHTML = '<option value="">Selecciona una organización</option>';

        const adminOrganizationsList = document.getElementById("adminOrganizationsList");
        adminOrganizationsList.innerHTML = '';

        organizations.forEach(org => {
            // Agregar al formulario de donación
            const option = document.createElement("option");
            option.value = org.id;
            option.textContent = org.name;
            organizationSelect.appendChild(option);

            // Agregar al panel de administración
            const orgItem = document.createElement("li");
            orgItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            orgItem.innerHTML = `
                <span><strong>${org.name}</strong></span>
                <div>
                    <button class="btn btn-warning btn-sm me-2" onclick="editOrganization('${org.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrganization('${org.id}')">Eliminar</button>
                </div>
            `;
            adminOrganizationsList.appendChild(orgItem);
        });
    } catch (error) {
        console.error("Error al cargar las organizaciones:", error);
    }
}


// Actualizar la lista de organizaciones en Estaticadeorganizaciones.html
function updateOrganizationsPage(organizations) {
    if (window.location.pathname.includes("Estaticadeorganizaciones.html")) {
        const container = document.getElementById("organizationContainer");
        container.innerHTML = ""; // Limpiar contenido anterior
        organizations.forEach(org => {
            const fieldset = document.createElement("fieldset");
            fieldset.classList.add("organization-fieldset");
            fieldset.innerHTML = `
                <legend>${org.name}</legend>
                <img src="${org.image}" alt="${org.name}" class="organization-image">
                <p>${org.description}</p>
                <p><strong>Ubicación:</strong> ${org.location.lat}, ${org.location.lng}</p>
            `;
            container.appendChild(fieldset);
        });
    }
}

// Actualizar marcadores en el mapa de Leaflet
function updateMapMarkers(organizations) {
    const map = L.map('map').setView([4.570868, -74.297333], 6); // Coordenadas iniciales

    // Capa del mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    organizations.forEach(org => {
        L.marker([org.location.lat, org.location.lng]).addTo(map)
            .bindPopup(`<strong>${org.name}</strong>`)
            .openPopup();
    });
}

// Agregar nueva organización con ubicación
document.getElementById("addOrganizationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("orgName").value;
    const description = document.getElementById("orgDescription").value;
    const lat = parseFloat(document.getElementById("orgLat").value);
    const lng = parseFloat(document.getElementById("orgLng").value);
    const fileInput = document.getElementById("orgImageUpload").files[0];

    const formData = new FormData();
    formData.append("file", fileInput);

    try {
        // Subir imagen
        const uploadResponse = await fetch("/upload_image", { method: "POST", body: formData });
        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok) {
            const newOrg = { 
                name, 
                description, 
                image: uploadResult.image_url, 
                location: { lat, lng } 
            };

            // Enviar la nueva organización al backend
            const response = await fetch('/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrg)
            });

            const result = await response.json();
            alert(result.message);
            loadOrganizations(); // Recargar organizaciones
        } else {
            alert(uploadResult.error || "Error al subir la imagen.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor.");
    }
});
async function editOrganization(orgId) {
    const name = prompt("Nuevo nombre:");
    const description = prompt("Nueva descripción:");
    const lat = parseFloat(prompt("Nueva latitud:"));
    const lng = parseFloat(prompt("Nueva longitud:"));

    if (!name || !description || isNaN(lat) || isNaN(lng)) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    try {
        const response = await fetch(`/organizations/${orgId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, location: { lat, lng } })
        });

        const result = await response.json();
        alert(result.message);
        loadOrganizations();
    } catch (error) {
        console.error("Error al editar la organización:", error);
    }
}

async function deleteOrganization(orgId) {
    if (!confirm("¿Estás seguro de eliminar esta organización?")) return;

    try {
        const response = await fetch(`/organizations/${orgId}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message);
        loadOrganizations();
    } catch (error) {
        console.error("Error al eliminar la organización:", error);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar el mapa centrado en una ubicación por defecto
    const map = L.map("map").setView([4.570868, -74.297333], 6); // Coordenadas iniciales (Colombia)

    // Cargar capa del mapa
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Agregar un marcador arrastrable al mapa
    let marker = L.marker([4.570868, -74.297333], { draggable: true }).addTo(map);

    // Actualizar los campos de latitud y longitud cuando el marcador se mueva
    marker.on("dragend", function (event) {
        const position = marker.getLatLng();
        document.getElementById("orgLat").value = position.lat.toFixed(6);
        document.getElementById("orgLng").value = position.lng.toFixed(6);
    });

    // Permitir al usuario hacer clic en el mapa para mover el marcador
    map.on("click", function (event) {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        document.getElementById("orgLat").value = lat.toFixed(6);
        document.getElementById("orgLng").value = lng.toFixed(6);
    });
});




