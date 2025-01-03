// Step 1 : Fetching WORK from backend

// 1. Get WORK from API

async function fetchGallery() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url); 
        if (!response.ok) throw new Error(`Erreur : ${response.status}`); 
        const data = await response.json(); 
        console.log("Données des travaux récupérées depuis l'API :", data); 
        return Array.isArray(data) ? data : []; 
    } catch (error) {
        console.error("Erreur lors de la récupération des travaux :", error.message); 
        return []; 
    }
}

// 2. Display gallery into DOM

function displayGallery(gallery) {
    console.log("Galerie à afficher :", gallery); 
    const galleryContainer = document.querySelector(".gallery"); 
    if (!galleryContainer) {
        console.error("Le conteneur .gallery est introuvable !"); 
        return;
    }

    galleryContainer.innerHTML = ""; 
    gallery.forEach((work) => {
        const figure = document.createElement("figure"); 

        const img = document.createElement("img");
        img.src = work.imageUrl; 
        img.alt = work.title; 

        const caption = document.createElement("figcaption"); 
        caption.textContent = work.title; 

        figure.appendChild(img); 
        figure.appendChild(caption); 
        galleryContainer.appendChild(figure); 
    });
}

// 3. Get categories from API

async function fetchCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url); // Requête API pour les catégories
        if (!response.ok) throw new Error(`Erreur : ${response.status}`); // Vérifie la réponse
        const data = await response.json(); // Convertit la réponse en JSON
        console.log("Données des catégories récupérées depuis l'API :", data); // Debug des données récupérées
        return Array.isArray(data) ? data : []; // Retourne un tableau ou un tableau vide
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error.message); // Gestion des erreurs
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

// 4. Selecte active filter

function toggleActiveFilter(activeButton) {
    console.log("Mise à jour du filtre actif :", activeButton.textContent); 
    document.querySelectorAll(".filter-btn").forEach((btn) =>
        btn.classList.remove("active-filter") 
    );
    activeButton.classList.add("active-filter"); 
}

// 5. Display filters with categories & gallery

function displayFilters(categories, gallery) {
    console.log("Filtres à afficher :", categories); 
    const filtersContainer = document.querySelector("#filters"); 
    if (!filtersContainer) return; 

    filtersContainer.innerHTML = ""; 

    // Add "Tous" button

    const allButton = document.createElement("button");
    allButton.textContent = "Tous"; 
    allButton.classList.add("filter-btn", "active-filter"); 
    allButton.addEventListener("click", () => {
        console.log("Filtre 'Tous' sélectionné"); 
        displayGallery(gallery); 
        toggleActiveFilter(allButton); 
    });
    filtersContainer.appendChild(allButton); 

    // Add button for each categories

    categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name; 
        button.classList.add("filter-btn"); 
        button.addEventListener("click", () => {
            console.log(`Filtre sélectionné : ${category.name}`); 
            const filteredGallery = gallery.filter(
                (work) => work.categoryId === category.id 
            );
            console.log(`Galerie filtrée pour la catégorie ${category.name} :`, filteredGallery); 
            displayGallery(filteredGallery);
            toggleActiveFilter(button); 
        });
        filtersContainer.appendChild(button); 
    });
}

// Step 2 : Connexion form

// 1. Admin element : User connected by sessionstorage & edit element displayed

function manageAdminElements() {
    const isConnected = sessionStorage.getItem("isConnected") === "true"; 

    const loginButton = document.getElementById("login"); 
    const logoutButton = document.getElementById("logout"); 
    const adminBar = document.querySelector(".edit-bar"); 
    const editButton = document.getElementById("edit-button"); 

    // Login button 
    if (loginButton) loginButton.style.display = isConnected ? "none" : "block";

    // Logout button
    if (logoutButton) {
        logoutButton.style.display = isConnected ? "block" : "none"; 

        logoutButton.addEventListener("click", () => {
            sessionStorage.clear(); 
            window.location.reload(); 
        });
    }

    if (adminBar) adminBar.style.display = isConnected ? "flex" : "none";

    if (editButton) {
        editButton.style.display = isConnected ? "inline-flex" : "none"; 
        
        editButton.addEventListener("click", (event) => {
            event.preventDefault(); 
            openModal(); 
        });
    }
}

// 2. Configure connexion form

function setupLoginForm() {
    const loginForm = document.querySelector("#loginForm"); 

    if (!loginForm) {
        console.error("Le formulaire de connexion n'existe pas !"); 
        return; 
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const email = document.querySelector("#email").value.trim(); 
        const password = document.querySelector("#password").value.trim(); 
        const errorMessage = document.querySelector(".error-message"); 

        if (!email || !password) {
            errorMessage.textContent = "Veuillez remplir tous les champs."; 
            errorMessage.style.display = "block"; 
            return; 
        }

        try {
            const success = await loginUser(email, password); 

            if (success) {
                sessionStorage.setItem("isConnected", "true"); 
                window.location.href = "index.html"; 
            } else {
                errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe."; 
                errorMessage.style.display = "block";
            }
        } catch (error) {
            errorMessage.textContent = "Erreur de connexion au serveur."; 
            errorMessage.style.display = "block";
        }
    });
}

// 3. Send element to the server

async function loginUser(email, password) {
    const url = "http://localhost:5678/api/users/login"; 

    try {
       
        const response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ email, password }), 
        });

        if (response.ok) {
            const data = await response.json(); 
            sessionStorage.setItem("Token", data.token); 
            sessionStorage.setItem("isConnected", "true"); 
            return true; 
        } else {
            return false; 
        }
    } catch (error) {
        console.error("Erreur lors de la tentative de connexion :", error.message); 
        throw error; 
    }
}

// Step 3 : Add Modal

// 1. Open Modal

function openModal() {
    const modal = document.getElementById("project-modal");
    const modalMainView = document.querySelector("#modal-view-main");
    const modalAddView = document.querySelector("#modal-view-add");

    if (modal && modalMainView && modalAddView) {
        modal.style.display = "flex";
        modalMainView.style.display = "block";
        modalAddView.style.display = "none";
    }
}

// 2. Close Modal

function closeModal() {
    const modal = document.getElementById("project-modal");
    if (modal) modal.style.display = "none";
}

// 3. Function to navigate between the 2 views of the Modal

function setupAddPhotoModal() {
    const addPhotoButton = document.querySelector(".add-photo-btn");
    const backButton = document.querySelector("#back-to-main");

    addPhotoButton.addEventListener("click", () => {
        document.querySelector("#modal-view-main").style.display = "none";
        document.querySelector("#modal-view-add").style.display = "block";
        populateCategorySelect();
    });

    backButton.addEventListener("click", () => {
        document.querySelector("#modal-view-main").style.display = "block";
        document.querySelector("#modal-view-add").style.display = "none";
    });
}

// 4. Populate category select dropdown

async function populateCategorySelect() {
    const categorySelect = document.getElementById("category-select");
    categorySelect.innerHTML = ''; 

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    const categories = await fetchCategories();
    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// 5. Display gallery inside the modal

function displayModalGallery(gallery) {
    const modalGalleryContainer = document.querySelector(".gallery-grid");
    if (!modalGalleryContainer) {
        console.error("Le conteneur .gallery-grid est introuvable !");
        return;
    }

    modalGalleryContainer.innerHTML = "";
    gallery.forEach((work) => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener("click", () => deletePhoto(work.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGalleryContainer.appendChild(figure);
    });
}

//6. Delete a photo from the gallery and update the DOM

async function deletePhoto(workId) {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?");
    if (!confirmation) return;

    try {
        const token = sessionStorage.getItem("Token");
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const gallery = await fetchGallery();
            displayGallery(gallery);
            displayModalGallery(gallery);
            showMessage("Photo supprimée avec succès !", "success");
        } else {
            showMessage(`Erreur lors de la suppression : ${response.statusText}`, "error");
        }
    } catch (error) {
        showMessage(`Erreur lors de la tentative de suppression : ${error.message}`, "error");
    }
}

// 7. Display feedback messages to the user

function showMessage(message, type = "success") {
    const messageContainer = document.querySelector(".message-container");
    if (!messageContainer) return;

    messageContainer.textContent = message;
    messageContainer.className = `message-container ${type}`; 
    messageContainer.style.display = "block";

    setTimeout(() => {
        messageContainer.style.display = "none";
    }, 3000);
}

// 8. Setup validation and submission for adding a new project

function setupValidateButton() {
    const validateButton = document.querySelector(".validate-btn");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg";

    const imagePreview = document.querySelector(".upload-preview");
    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("category-select");

    imagePreview.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            imagePreview.innerHTML = "";
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = "100%";
            imagePreview.appendChild(img);
        }
    });

    validateButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;

        if (!file || !title || !category) {
            showMessage("Veuillez remplir tous les champs.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", category);

        try {
            const token = sessionStorage.getItem("Token");
            const response = await fetch("http://localhost:5678/api/works", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const newWork = await response.json();
                addProjectToGallery(newWork);
                addProjectToModalGallery(newWork);

                titleInput.value = "";
                categorySelect.selectedIndex = 0;
                imagePreview.innerHTML = "";

                closeModal();
            } else {
                showMessage("Erreur lors de l'ajout du projet.");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la photo :", error.message);
        }
    });
}

// 9. Add a project to the main gallery

function addProjectToGallery(work) {
    const galleryContainer = document.querySelector(".gallery");
    if (!galleryContainer) return;

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    galleryContainer.appendChild(figure);
}

// 10. Add a project to Modal gallery

function addProjectToModalGallery(work) {
    const modalGalleryContainer = document.querySelector(".gallery-grid");
    if (!modalGalleryContainer) return;

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.addEventListener("click", () => deletePhoto(work.id));

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGalleryContainer.appendChild(figure);
}

// Initialisation

document.addEventListener("DOMContentLoaded", () => {
    const pageType = document.body.dataset.page; 

    if (pageType === "login") {
        setupLoginForm();
    } else if (pageType === "main") {
        work();
        manageAdminElements();
        setupAddPhotoModal();
        setupValidateButton();

        const closeButton = document.querySelector(".modal-close");
        if (closeButton) {
            closeButton.addEventListener("click", closeModal);
        }

        window.addEventListener("click", (e) => {
            if (e.target.id === "project-modal") closeModal();
        });
    }
});

async function work() {
    try {
        const gallery = await fetchGallery();
        console.log("Travaux après récupération :", gallery); 
        const categories = await fetchCategories();
        console.log("Catégories après récupération :", categories); 
        const isConnected = sessionStorage.getItem("isConnected") === "true";

        if (gallery.length) displayGallery(gallery);

        if (!isConnected && categories.length) {
            displayFilters(categories, gallery);
        }

        if (gallery.length) displayModalGallery(gallery);
    } catch (error) {
        console.error("Erreur lors du chargement principal :", error.message);
    }
}























































