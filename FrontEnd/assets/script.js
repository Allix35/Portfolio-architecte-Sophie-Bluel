// Fonction principale pour charger les œuvres et les catégories
async function work() {
    try {
        const works = await fetchWorks();
        const categories = await fetchCategories();

        displayFilters(categories, works); // Génération des filtres
        displayWorks(works); // Affichage initial des œuvres
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}

// Récupérer les œuvres depuis l'API
async function fetchWorks() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur de récupération des œuvres :", error);
        return [];
    }
}

// Récupérer les catégories depuis l'API
async function fetchCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur de récupération des catégories :", error);
        return [];
    }
}

// Afficher les œuvres dans la galerie
function displayWorks(works) {
    const galleryContainer = document.querySelector(".gallery");
    galleryContainer.innerHTML = ""; // Réinitialise la galerie
    works.forEach((work) => {
        const figure = createFigure(work);
        galleryContainer.appendChild(figure);
    });
}

// Créer un élément pour chaque œuvre
function createFigure(work) {
    const figure = document.createElement("figure");
    figure.dataset.category = work.categoryId;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);

    return figure;
}

// Générer les filtres dynamiquement avec suppression des doublons
function displayFilters(categories, works) {
    const filtersContainer = document.querySelector("#filters");
    filtersContainer.innerHTML = ""; // Supprime les filtres existants

    // Utilisation de Set pour garantir des catégories uniques
    const uniqueCategories = Array.from(new Set(categories.map(category => category.name)))
        .map(name => categories.find(category => category.name === name));

    // Bouton "Tous"
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-btn", "active-filter");
    allButton.addEventListener("click", () => {
        displayWorks(works); // Affiche toutes les œuvres
        toggleActiveFilter(allButton);
    });
    filtersContainer.appendChild(allButton);

    // Boutons pour chaque catégorie unique
    uniqueCategories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.addEventListener("click", () => {
            const filteredWorks = works.filter((work) => work.categoryId === category.id);
            displayWorks(filteredWorks);
            toggleActiveFilter(button);
        });
        filtersContainer.appendChild(button);
    });
}

// Basculer la classe active sur un bouton
function toggleActiveFilter(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active-filter"));
    activeButton.classList.add("active-filter");
}

// Lancer l'application
work();



  
  
  
  
  
  
  
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


























