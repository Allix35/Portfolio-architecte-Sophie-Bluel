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
            window.location.replace("index.html");
        });
    }
    if (adminBar) adminBar.style.display = isConnected ? "flex" : "none";
    if (editButton) {
        editButton.style.display = isConnected ? "inline-flex" : "none";
        editButton.addEventListener("click", openModal);
    }
}

// ==================================
// Étape 3 : Gestion de la modale
// ==================================

function openModal() {
    const modal = document.getElementById("project-modal");
    const modalMainView = document.querySelector("#modal-view-main");
    const modalAddView = document.querySelector("#modal-view-add");

    if (modal && modalMainView && modalAddView) {
        modal.style.display = "flex";
        modalMainView.style.display = "block";
        modalAddView.style.display = "none";
    } else {
        console.error("La modale n'a pas pu être ouverte !");
    }
}

function closeModal() {
    const modal = document.getElementById("project-modal");
    if (modal) {
        modal.style.display = "none";
    }
}

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
// Étape 4 : Gestion de l'ajout de photo
// ==================================

function setupAddPhotoModal() {
    const addPhotoButton = document.querySelector(".add-photo-btn");
    const backButton = document.querySelector("#back-to-main");
    const modalMainView = document.querySelector("#modal-view-main");
    const modalAddView = document.querySelector("#modal-view-add");

    if (addPhotoButton) {
        addPhotoButton.addEventListener("click", () => {
            modalMainView.style.display = "none";
            modalAddView.style.display = "block";
            populateCategorySelect();
        });
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            modalMainView.style.display = "block";
            modalAddView.style.display = "none";
        });
    }
}

function populateCategorySelect() {
    const categorySelect = document.getElementById("category-select");
    if (!categorySelect) {
        console.error("Le sélecteur de catégories est introuvable !");
        return;
    }

    fetchCategories().then((categories) => {
        categorySelect.innerHTML = `<option value="" disabled selected>Choisissez une catégorie</option>`;
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });
}

function setupValidateButton() {
    const validateButton = document.querySelector(".validate-btn");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg";

    const imagePreview = document.querySelector(".upload-preview");
    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("category-select");

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file && imagePreview) {
            imagePreview.innerHTML = "";
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = "100%";
            imagePreview.appendChild(img);
        }
    });

    imagePreview.addEventListener("click", () => {
        fileInput.click();
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
            const response = await fetch("http://localhost:5678/api/works", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("Token")}`,
                },
                body: formData,
            });

            if (response.ok) {
                const gallery = await fetchGallery();
                displayGallery(gallery);
                displayModalGallery(gallery);
                closeModal();
            } else {
                console.error("Erreur lors de l'ajout de la photo :", response.status);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout :", error.message);
        }
    });
}

// ==================================
// Initialisation
// ==================================

async function work() {
    try {
        const gallery = await fetchGallery();
        const categories = await fetchCategories();

        displayGallery(gallery);
        displayFilters(categories, gallery);
        displayModalGallery(gallery);
        manageAdminElements();
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error.message);
    }
}

function init() {
    work();
    setupAddPhotoModal();
    setupValidateButton();
}

init();













































