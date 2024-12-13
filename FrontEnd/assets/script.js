// Functions to charge categories and pojects

async function work() {
    try {
        console.log("Début de la récupération des données");
        const gallery = await fetchGallery();
        const categories = await fetchCategories();

        console.log("Galerie après récupération :", gallery);
        console.log("Catégories après récupération :", categories);

        displayFilters(categories, gallery); // Génération des filtres
        displayGallery(gallery); // Affichage initial de la galerie
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}

// Get gallery from API

async function fetchGallery() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        console.log("Réponse API galerie :", response);
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        const data = await response.json();
        console.log("Données de la galerie récupérées :", data);
        return data;
    } catch (error) {
        console.error("Erreur de récupération de la galerie :", error);
        return [];
    }
}

// Get categories from API

async function fetchCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        console.log("Réponse API catégories :", response);
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        const data = await response.json();
        console.log("Données des catégories récupérées :", data);
        return data;
    } catch (error) {
        console.error("Erreur de récupération des catégories :", error);
        return [];
    }
}

// Display project into gallery

function displayGallery(gallery) {
    console.log("Affichage de la galerie :", gallery);
    const galleryContainer = document.querySelector(".gallery");
    galleryContainer.innerHTML = ""; 
    gallery.forEach((item) => {
        const figure = createFigure(item);
        galleryContainer.appendChild(figure);
    });
}

// Create element for each project 

function createFigure(item) {
    const figure = document.createElement("figure");
    figure.dataset.category = item.categoryId;

    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = item.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);

    return figure;
}

// Function to generate filters

function displayFilters(categories, gallery) {
    console.log("Affichage des filtres :", categories);
    const filtersContainer = document.querySelector("#filters");
    filtersContainer.innerHTML = ""; 

    // Use Set for unique categories

    const uniqueCategories = Array.from(new Set(categories.map(category => category.name)))
        .map(name => categories.find(category => category.name === name));

    // Button "Tous" creation

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-btn", "active-filter");
    allButton.addEventListener("click", () => {
        displayGallery(gallery); 
        toggleActiveFilter(allButton);
    });
    filtersContainer.appendChild(allButton);

    // Button for each categories

    uniqueCategories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.addEventListener("click", () => {
            const filteredGallery = gallery.filter((item) => item.categoryId === category.id);
            displayGallery(filteredGallery);
            toggleActiveFilter(button);
        });
        filtersContainer.appendChild(button);
    });
}

// Get the active class on button

function toggleActiveFilter(activeButton) {
    console.log("Activation du filtre :", activeButton.textContent);
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active-filter"));
    activeButton.classList.add("active-filter");
}

// Function initialized

work();




  
  
  
  
  
  
  
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


























