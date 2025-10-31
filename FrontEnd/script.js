const gallery = document.querySelector(".gallery");
const filterSection = document.querySelector(".filter-section");

let ALL_WORKS = [];   // mémoire des projets
let CATEGORIES = [];  // mémoire des catégories

// Affiche une liste de projets
function renderGallery(list) {
  gallery.innerHTML = "";
  list.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    img.src = work.imageUrl;
    img.alt = work.title || "Projet";
    figcaption.textContent = work.title || "";
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

// Charge les works une fois
async function createWorksElement() {
  const urlWorks = "http://localhost:5678/api/works";
  try {
    const response = await fetch(urlWorks);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    ALL_WORKS = await response.json();
    renderGallery(ALL_WORKS); // affichage initial: tout
  } catch (error) {
    console.error(error.message);
  }
}
createWorksElement();

// Gère le clic sur un bouton de filtre
function handleFilterClick(btn) {
  // état visuel
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("is-active"));
  btn.classList.add("is-active");

  const filter = btn.dataset.filter; // "all" ou un id (string)
  if (filter === "all") {
    renderGallery(ALL_WORKS);
    return;
  }
  const id = Number(filter);
  const filtered = ALL_WORKS.filter(w => w.categoryId === id);
  renderGallery(filtered);
}

// Crée les boutons de catégories + branche les clics
async function createCategoriesElement() {
  const urlCategorie = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(urlCategorie);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    CATEGORIES = await response.json();

    // Nettoie la section et ajoute "Tous"
    filterSection.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tous";
    allBtn.dataset.filter = "all";
    allBtn.className = "filter-btn is-active";
    filterSection.appendChild(allBtn);

    // Ajoute un bouton par catégorie, avec data-filter = id
    CATEGORIES.forEach((categorie) => {
      const filterbtn = document.createElement("button");
      filterbtn.textContent = categorie.name;
      filterbtn.dataset.filter = String(categorie.id); // clé du filtre
      filterbtn.className = "filter-btn";
      filterSection.appendChild(filterbtn);
    });

    // Event delegation: un seul écouteur pour toute la section
    filterSection.addEventListener("click", (e) => {
      const btn = e.target.closest("button.filter-btn");
      if (!btn) return;
      handleFilterClick(btn);
    });
  } catch (error) {
    console.error(error.message);
  }
}
createCategoriesElement();


document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Empêche le rechargement de la page

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const urlLogin = "http://localhost:5678/api/users/login";

  // Envoie la requête POST
  const response = await fetch(urlLogin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  // Traite la réponse
  if (response.ok) {
    const data = await response.json();
    console.log("Connexion réussie :", data);
  } else {
    console.error("Erreur lors de la connexion");
  }
});

