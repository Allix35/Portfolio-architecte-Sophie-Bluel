// ==================================
// Étape 1 : Récupération des travaux et affichage
// ==================================

async function fetchGallery() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        console.log("Travaux récupérés :", data);
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
        console.log("Catégories récupérées :", data);
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
            console.log("Déconnexion réussie.");
            window.location.replace("index.html");
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
                console.log("Connexion réussie. Redirection...");
                window.location.replace("index.html");
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
// Étape 3 : Gestion de la modale et bouton Ajouter photo
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

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGalleryContainer.appendChild(figure);
    });
}

async function populateCategorySelect() {
    const categorySelect = document.getElementById("category-select");
    if (!categorySelect) {
        console.error("Le sélecteur de catégories est introuvable !");
        return;
    }

    try {
        const categories = await fetchCategories();
        if (categories.length === 0) {
            console.warn("Aucune catégorie disponible.");
            return;
        }

        categorySelect.innerHTML = `<option value="" disabled selected>Choisissez une catégorie</option>`;

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        console.log("Catégories chargées dans le formulaire !");
    } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error.message);
    }
}

function openModal() {
    const modal = document.getElementById("project-modal");
    const modalMainView = document.querySelector("#modal-view-main");
    const modalAddView = document.querySelector("#modal-view-add");

    if (modal && modalMainView && modalAddView) {
        modal.style.display = "flex";
        modalMainView.style.display = "block";
        modalAddView.style.display = "none";
        console.log("Modale ouverte !");
    } else {
        console.error("Modale ou ses vues introuvables !");
    }
}

function closeModal() {
    const modal = document.getElementById("project-modal");
    if (modal) {
        modal.style.display = "none";
        console.log("Modale fermée !");
    }
}

function setupAddPhotoModal() {
    const addPhotoButton = document.querySelector(".add-photo-btn");
    const backButton = document.querySelector("#back-to-main");
    const modalMainView = document.querySelector("#modal-view-main");
    const modalAddView = document.querySelector("#modal-view-add");
    const closeButton = document.querySelector(".modal-close");

    if (addPhotoButton) {
        addPhotoButton.addEventListener("click", () => {
            modalMainView.style.display = "none";
            modalAddView.style.display = "block";
            populateCategorySelect(); // Charger les catégories dynamiquement
        });
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            modalMainView.style.display = "block";
            modalAddView.style.display = "none";
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    window.addEventListener("click", (event) => {
        const modal = document.getElementById("project-modal");
        if (event.target === modal) {
            closeModal();
        }
    });
}

function setupImageUpload() {
    const uploadButton = document.querySelector(".upload-button");

    if (uploadButton) {
        uploadButton.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/png, image/jpeg";

            fileInput.addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (file) {
                    console.log("Fichier sélectionné :", file.name);

                    // Exemple d'aperçu
                    const previewContainer = document.querySelector(".upload-preview");
                    if (previewContainer) {
                        previewContainer.innerHTML = "";
                        const img = document.createElement("img");
                        img.src = URL.createObjectURL(file);
                        img.style.maxWidth = "100%";
                        img.style.height = "auto";
                        previewContainer.appendChild(img);
                    }
                } else {
                    console.log("Aucun fichier sélectionné.");
                }
            });

            fileInput.click();
        });
    } else {
        console.error("Bouton Ajouter photo introuvable !");
    }
}

// ==================================
// Initialisation
// ==================================

async function work() {
    try {
        const gallery = await fetchGallery();
        const categories = await fetchCategories();

        displayGallery(gallery); // Afficher la galerie principale
        displayFilters(categories, gallery); // Afficher les filtres
        displayModalGallery(gallery); // Afficher la galerie dans la modale

        manageAdminElements();
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error.message);
    }
}

function init() {
    setupLoginForm();
    setupAddPhotoModal();
    setupImageUpload(); // Bouton bleu pour ajouter une photo
    work();
}

init();

































