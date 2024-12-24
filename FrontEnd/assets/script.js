// ==================================
// Étape 1 : Récupération des travaux et affichage
// ==================================

// Récupérer les travaux depuis le back-end
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

// Afficher les travaux dans la galerie principale
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

// Récupérer les catégories depuis le back-end
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

// Afficher les boutons de filtres
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

// Gérer l'activation du bouton filtre
function toggleActiveFilter(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) =>
        btn.classList.remove("active-filter")
    );
    activeButton.classList.add("active-filter");
}

// ==================================
// Étape 2 : Gestion de la connexion
// ==================================

// Afficher un message d'erreur
function showErrorMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = "block";
    }
}

// Gérer le formulaire de connexion
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
            showErrorMessage(errorMessage, "Veuillez remplir tous les champs.");
            return;
        }

        try {
            const success = await loginUser(email, password);
            if (success) {
                console.log("Connexion réussie. Redirection...");
                window.location.replace("index.html");
            } else {
                showErrorMessage(errorMessage, "Erreur dans l’identifiant ou le mot de passe.");
            }
        } catch (error) {
            showErrorMessage(errorMessage, "Erreur de connexion au serveur.");
        }
    });
}

// Fonction pour se connecter

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

// Gérer les éléments dynamiques en mode édition

function manageAdminElements() {
    const isConnected = sessionStorage.getItem("isConnected") === "true";

    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const adminBar = document.querySelector(".edit-bar");
    const editButton = document.getElementById("edit-button");
    const filtersContainer = document.getElementById("filters");

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

    if (filtersContainer) {
        filtersContainer.style.display = isConnected ? "none" : "flex";
    }
}

// Afficher les travaux dans la modale sans les titres

function displayModalGallery(gallery) {
    const modalGalleryContainer = document.querySelector(".gallery-grid");
    if (!modalGalleryContainer) {
        console.error("Le conteneur .gallery-grid est introuvable !");
        return;
    }

    modalGalleryContainer.innerHTML = ""; 
    gallery.forEach((work) => {
        const figure = document.createElement("figure");
        figure.classList.add("gallery-item");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener("click", () => deleteWork(work.id, figure));

        figure.appendChild(img);
        figure.appendChild(deleteBtn); 
        modalGalleryContainer.appendChild(figure);
    });
}


// Fonction pour supprimer un travail

async function deleteWork(workId, figureElement) {
    const url = `http://localhost:5678/api/works/${workId}`;
    const token = sessionStorage.getItem("Token");

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            console.log(`Travail avec l'ID ${workId} supprimé avec succès`);
            figureElement.remove(); // Supprime le travail de la modale
            const mainGalleryItem = document.querySelector(
                `.gallery img[src="${figureElement.querySelector("img").src}"]`
            );
            if (mainGalleryItem) {
                mainGalleryItem.parentElement.remove();
            }
        } else {
            console.error("Erreur lors de la suppression :", response.status);
        }
    } catch (error) {
        console.error("Erreur lors de la suppression :", error.message);
    }
}

// Gestion de la modale

const modal = document.getElementById("project-modal");
const closeButton = document.querySelector(".modal-close");
const editButton = document.getElementById("edit-button");


function openModal() {
  if (modal) {
    modal.style.display = "flex"; 
    console.log("Modale affichée !");
  } else {
    console.error("Modale introuvable !");
  }
}


function closeModal() {
  if (modal) {
    modal.style.display = "none"; 
    console.log("Modale fermée !");
  } else {
    console.error("Modale introuvable !");
  }
}

if (editButton) {
  editButton.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });
} else {
  console.error("Bouton Modifier introuvable !");
}


if (closeButton) {
  closeButton.addEventListener("click", closeModal);
} else {
  console.error("Bouton de fermeture introuvable !");
}


window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Initialisation

async function work() {
    console.log("Token actuel :", sessionStorage.getItem("Token") || "Aucun token disponible.");
    try {
        const gallery = await fetchGallery();
        const categories = await fetchCategories();

        displayGallery(gallery);

        const isConnected = sessionStorage.getItem("isConnected") === "true";
        if (isConnected) {
            manageAdminElements();
            displayModalGallery(gallery);
        } else {
            displayFilters(categories, gallery);
        }

        if (document.body.id === "login-page") {
            setupLoginForm();
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error.message);
    }
}

work();



















  
  
  
  
  
  
  
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


























