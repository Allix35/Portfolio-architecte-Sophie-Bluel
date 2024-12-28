// ==================================
// Étape 1 : Récupération des travaux et affichage
// ==================================

async function fetchGallery() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur lors de la récupération des travaux :", error.message);
        return [];
    }
}

async function fetchCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error.message);
        return [];
    }
}

function displayGallery(gallery) {
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

function displayFilters(categories, gallery) {
    const filtersContainer = document.querySelector("#filters");
    if (!filtersContainer) return;

    filtersContainer.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-btn", "active-filter");
    allButton.addEventListener("click", () => {
        displayGallery(gallery);
        toggleActiveFilter(allButton);
    });
    filtersContainer.appendChild(allButton);

    categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.addEventListener("click", () => {
            const filteredGallery = gallery.filter(
                (work) => work.categoryId === category.id
            );
            displayGallery(filteredGallery);
            toggleActiveFilter(button);
        });
        filtersContainer.appendChild(button);
    });
}

function toggleActiveFilter(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) =>
        btn.classList.remove("active-filter")
    );
    activeButton.classList.add("active-filter");
}

// ==================================
// Étape 2 : Gestion de la connexion
// ==================================

function manageAdminElements() {
    const isConnected = sessionStorage.getItem("isConnected") === "true";

    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const adminBar = document.querySelector(".edit-bar");
    const editButton = document.getElementById("edit-button");

    if (loginButton) loginButton.style.display = isConnected ? "none" : "block";
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
                window.location.reload();
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

// ==================================
// Étape 3 : Gestion de la modale et suppression
// ==================================

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
        deleteBtn.addEventListener("click", () => handleDeletePhoto(work.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGalleryContainer.appendChild(figure);
    });
}

async function handleDeletePhoto(workId) {
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette photo ?");
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
        } else {
            console.error("Erreur lors de la suppression :", response.status);
        }
    } catch (error) {
        console.error("Erreur lors de la tentative de suppression :", error.message);
    }
}

// ==================================
// Étape 4 : Gestion des vues modales
// ==================================

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

function closeModal() {
    const modal = document.getElementById("project-modal");
    if (modal) modal.style.display = "none";
}

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

async function populateCategorySelect() {
    const categorySelect = document.getElementById("category-select");
    categorySelect.innerHTML = ''; // Vider les options existantes

    // Ajouter une option par défaut vide
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    // Charger les catégories depuis l'API
    const categories = await fetchCategories();
    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}




// ==================================
// Étape 5 : Ajout de photos
// ==================================

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
            alert("Veuillez remplir tous les champs.");
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
                const gallery = await fetchGallery();
                displayGallery(gallery);
                displayModalGallery(gallery);

                // Réinitialise uniquement le nécessaire
                titleInput.value = "";
                categorySelect.selectedIndex = 0;
                imagePreview.innerHTML = "";

                closeModal();
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la photo :", error.message);
        }
    });
}

// ==================================
// Étape 1 : Récupération des travaux et affichage
// ==================================

async function fetchGallery() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur lors de la récupération des travaux :", error.message);
        return [];
    }
}

async function fetchCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error.message);
        return [];
    }
}

function displayGallery(gallery) {
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

function displayFilters(categories, gallery) {
    const filtersContainer = document.querySelector("#filters");
    if (!filtersContainer) return;

    filtersContainer.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-btn", "active-filter");
    allButton.addEventListener("click", () => {
        displayGallery(gallery);
        toggleActiveFilter(allButton);
    });
    filtersContainer.appendChild(allButton);

    categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.addEventListener("click", () => {
            const filteredGallery = gallery.filter(
                (work) => work.categoryId === category.id
            );
            displayGallery(filteredGallery);
            toggleActiveFilter(button);
        });
        filtersContainer.appendChild(button);
    });
}

function toggleActiveFilter(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) =>
        btn.classList.remove("active-filter")
    );
    activeButton.classList.add("active-filter");
}

// ==================================
// Étape 2 : Gestion de la connexion
// ==================================

function manageAdminElements() {
    const isConnected = sessionStorage.getItem("isConnected") === "true";

    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const adminBar = document.querySelector(".edit-bar");
    const editButton = document.getElementById("edit-button");

    if (loginButton) loginButton.style.display = isConnected ? "none" : "block";
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
                window.location.reload();
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

// ==================================
// Étape 3 : Gestion de la modale et suppression
// ==================================

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
        deleteBtn.addEventListener("click", () => handleDeletePhoto(work.id));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGalleryContainer.appendChild(figure);
    });
}

async function handleDeletePhoto(workId) {
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette photo ?");
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
        } else {
            console.error("Erreur lors de la suppression :", response.status);
        }
    } catch (error) {
        console.error("Erreur lors de la tentative de suppression :", error.message);
    }
}

// ==================================
// Étape 4 : Gestion des vues modales
// ==================================

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

function closeModal() {
    const modal = document.getElementById("project-modal");
    if (modal) modal.style.display = "none";
}

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

async function populateCategorySelect() {
    const categorySelect = document.getElementById("category-select");
    categorySelect.innerHTML = ''; // Vider les options existantes

    // Ajouter une option par défaut vide
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);

    // Charger les catégories depuis l'API
    const categories = await fetchCategories();
    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}




// ==================================
// Étape 5 : Ajout de photos
// ==================================

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
            alert("Veuillez remplir tous les champs.");
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
                const gallery = await fetchGallery();
                displayGallery(gallery);
                displayModalGallery(gallery);

                // Réinitialise uniquement le nécessaire
                titleInput.value = "";
                categorySelect.selectedIndex = 0;
                imagePreview.innerHTML = "";

                closeModal();
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la photo :", error.message);
        }
    });
}

// ==================================
// Initialisation
// ==================================

document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    // Charger la gestion du formulaire de connexion
    setupLoginForm();

    // Charger la galerie et les éléments nécessaires
    work();

    // Configurer les interactions modales
    setupAddPhotoModal();
    setupValidateButton();

    // Gérer les éléments administratifs pour le mode connecté
    manageAdminElements();

    // Configurer la fermeture des modales
    const closeButton = document.querySelector(".modal-close");
    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    // Fermer la modale si clic hors de la fenêtre
    window.addEventListener("click", (e) => {
        if (e.target.id === "project-modal") closeModal();
    });
}

async function work() {
    try {
        const gallery = await fetchGallery(); // Récupérer les travaux
        const categories = await fetchCategories(); // Récupérer les catégories
        const isConnected = sessionStorage.getItem("isConnected") === "true"; // Vérifier la connexion

        // Afficher la galerie dans tous les cas
        if (gallery.length) displayGallery(gallery);

        // Si l'utilisateur n'est PAS connecté, afficher les filtres
        if (!isConnected && categories.length) {
            displayFilters(categories, gallery);
        }

        // Gérer l'affichage dans la modale
        if (gallery.length) displayModalGallery(gallery);

        // Gérer les éléments administratifs en mode connecté
        manageAdminElements();
    } catch (error) {
        console.error("Erreur lors du chargement principal :", error.message);
    }
}



















































