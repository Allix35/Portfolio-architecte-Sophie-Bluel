// Étape 1.1 : Récupération des travaux depuis le back-end
async function fetchGallery() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        console.log("Travaux récupérés :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération des travaux :", error.message);
        return [];
    }
}

// Affichage des travaux dans la galerie
function displayGallery(gallery) {
    const galleryContainer = document.querySelector(".gallery");
    galleryContainer.innerHTML = ""; // Vide le contenu existant
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

// Étape 1.2 : Récupération des catégories depuis le back-end
async function fetchCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);
        const data = await response.json();
        console.log("Catégories récupérées :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error.message);
        return [];
    }
}

// Affichage des boutons de filtre
function displayFilters(categories, gallery) {
    const filtersContainer = document.querySelector("#filters");
    filtersContainer.innerHTML = ""; // Vide le contenu existant

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

// Activation du bouton de filtre actif
function toggleActiveFilter(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) =>
        btn.classList.remove("active-filter")
    );
    activeButton.classList.add("active-filter");
}

// Gestion des erreurs dans le formulaire de connexion
function showErrorMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = "block";
    }
}

// Fonction pour gérer la requête POST de connexion
async function loginUser(email, password) {
    console.log("Tentative de connexion avec :", email);
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.status === 200) {
            const data = await response.json();
            console.log("Connexion réussie :", data);

            sessionStorage.setItem("Token", data.token);
            sessionStorage.setItem("isConnected", "true");
            window.location.replace("index.html");
        } else if (response.status === 401) {
            throw new Error("Identifiants incorrects.");
        } else if (response.status === 404) {
            throw new Error("Utilisateur non trouvé.");
        } else {
            throw new Error("Erreur inattendue. Veuillez réessayer.");
        }
    } catch (error) {
        console.error("Erreur lors de la tentative de connexion :", error.message);
        showErrorMessage(document.querySelector(".error-message"), error.message);
    }
}

// Gestion du formulaire de connexion
function setupLoginForm() {
    console.log("setupLoginForm est exécutée"); // Vérifie si la fonction est appelée

    const loginForm = document.querySelector("#loginForm");
    console.log("Formulaire trouvé :", loginForm); // Vérifie si le formulaire est trouvé

    if (!loginForm) {
        console.error("Formulaire de connexion introuvable !");
        return;
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Formulaire soumis"); // Vérifie si l'événement de soumission est déclenché

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();
        console.log("Email :", email, "Password :", password); // Vérifie les valeurs saisies

        if (!email || !password) {
            showErrorMessage(document.querySelector(".error-message"), "Veuillez remplir tous les champs.");
            return;
        }

        loginUser(email, password);
    });
}


// Gestion des éléments administratifs
function manageAdminElements() {
    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const adminBar = document.getElementById("admin-logged");

    const isConnected = sessionStorage.getItem("isConnected") === "true";

    if (loginButton) loginButton.style.display = isConnected ? "none" : "block";
    if (logoutButton) logoutButton.style.display = isConnected ? "block" : "none";
    if (adminBar) adminBar.style.display = isConnected ? "flex" : "none";

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            sessionStorage.clear();
            console.log("Déconnexion réussie.");
            window.location.replace("index.html");
        });
    }
}

function work() {
    console.log("Token actuel :", sessionStorage.getItem("Token") || "Aucun token disponible.");

    try {
        // Récupération des travaux et des catégories
        const gallery = document.querySelector(".gallery");
        if (gallery) {
            fetchGallery().then(displayGallery);
            fetchCategories().then(categories => displayFilters(categories, gallery));
        }

        // Gestion des éléments administratifs
        manageAdminElements();

        // Appel du formulaire uniquement sur la page de connexion
        if (document.body.id === "login-page") {
            setupLoginForm();
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error.message);
    }
}

// Lancer l'application
work();











  
  
  
  
  
  
  
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


























