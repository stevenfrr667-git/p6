// ──────────────────────────────────────────────────────────────
// [0] VÉRIFICATION DU MODE CONNECTÉ
// ──────────────────────────────────────────────────────────────
const token = localStorage.getItem("token");

if (token) {
  console.log("Mode connecté ✅");

  // Affiche le bandeau "Mode édition"
  const editBanner = document.querySelector(".edit-banner");
  if (editBanner) editBanner.style.display = "flex";

  // Cache la section des filtres
  const filterSection = document.querySelector(".filter-section");
  if (filterSection) filterSection.style.display = "none";

  // Remplace "login" par "logout"
  const loginLink = document.querySelector("nav a[href*='login']");
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload(); // recharge la page en mode déconnecté
    });
  }
} else {
  console.log("Mode visiteur ");
  const filterSection = document.querySelector(".filter-section");
  if (filterSection) filterSection.style.display = "flex";
}

// ──────────────────────────────────────────────────────────────
// [1] SÉLECTEURS DOM & MÉMOIRE LOCALE
// ──────────────────────────────────────────────────────────────

// Sélecteurs principaux
const gallery = document.querySelector(".gallery");
const filterSection = document.querySelector(".filter-section");
const editButton = document.querySelector(".edit-button"); // Bouton modifier principal

// Mémoires locales
let ALL_WORKS = [];
let CATEGORIES = [];

// ──────────────────────────────────────────────────────────────
// [1.1] AFFICHAGE / MASQUAGE DU BOUTON "MODIFIER"
// ──────────────────────────────────────────────────────────────
if (editButton) {
  if (token) {
    editButton.style.display = "flex";
  } else {
    editButton.style.display = "none";
  }
}

// ──────────────────────────────────────────────────────────────
// [2] AFFICHAGE DES PROJETS DANS LA GALERIE PRINCIPALE
// ──────────────────────────────────────────────────────────────
function renderGallery(list) {
  if (!gallery) return;
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

// ──────────────────────────────────────────────────────────────
// [3] CHARGEMENT INITIAL DES WORKS
// ──────────────────────────────────────────────────────────────
async function createWorksElement() {
  const urlWorks = "http://localhost:5678/api/works";
  try {
    const response = await fetch(urlWorks);
    if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
    ALL_WORKS = await response.json();
    renderGallery(ALL_WORKS);
  } catch (error) {
    console.error("Erreur chargement travaux :", error.message);
  }
}

// ──────────────────────────────────────────────────────────────
// [4] GESTION DES FILTRES
// ──────────────────────────────────────────────────────────────
function handleFilterClick(btn) {
  document.querySelectorAll(".filter-btn").forEach((b) =>
    b.classList.remove("is-active")
  );
  btn.classList.add("is-active");
  const filter = btn.dataset.filter;
  if (filter === "all") {
    renderGallery(ALL_WORKS);
    return;
  }
  const id = Number(filter);
  const filtered = ALL_WORKS.filter((w) => w.categoryId === id);
  renderGallery(filtered);
}

// ──────────────────────────────────────────────────────────────
// [5] CRÉATION DES BOUTONS DE CATÉGORIES
// ──────────────────────────────────────────────────────────────
async function createCategoriesElement() {
  const urlCategorie = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(urlCategorie);
    if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
    CATEGORIES = await response.json();

    if (!filterSection) return;
    filterSection.innerHTML = "";

    // Bouton "Tous"
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tous";
    allBtn.dataset.filter = "all";
    allBtn.className = "filter-btn is-active";
    filterSection.appendChild(allBtn);

    // Boutons par catégorie
    CATEGORIES.forEach((categorie) => {
      const btn = document.createElement("button");
      btn.textContent = categorie.name;
      btn.dataset.filter = String(categorie.id);
      btn.className = "filter-btn";
      filterSection.appendChild(btn);
    });

    filterSection.addEventListener("click", (e) => {
      const btn = e.target.closest("button.filter-btn");
      if (!btn) return;
      handleFilterClick(btn);
    });
  } catch (error) {
    console.error("Erreur chargement catégories :", error.message);
  }
}

// ──────────────────────────────────────────────────────────────
// [6] & [8] MODALE : SÉLECTEURS ET NAVIGATION
// ──────────────────────────────────────────────────────────────
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalBack = document.getElementById("modal-back");

// Vues de la modale
const modalGalleryView = document.getElementById("modal-gallery-view");
const modalFormView = document.getElementById("modal-form-view");
const modalGalleryList = document.getElementById("modal-gallery-list");
const modalAddPhotoBtn = document.getElementById("modal-add-photo-btn");

// Formulaire
const addWorkForm = document.getElementById("add-work-form");
const categorySelect = document.getElementById("category");

// --- Navigation entre les vues ---
function showGalleryView() {
  modalGalleryView.classList.add("active");
  modalFormView.classList.remove("active");
  if (modalBack) modalBack.style.display = "none"; // cache la flèche retour
  resetForm(); // On nettoie le formulaire quand on revient
}

function showFormView() {
  modalGalleryView.classList.remove("active");
  modalFormView.classList.add("active");
  if (modalBack) modalBack.style.display = "block"; // affiche la flèche retour
}

// --- Ouverture / Fermeture Modale ---
function openModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add("active");
  showGalleryView(); // vue par défaut
  renderModalGallery(ALL_WORKS);
  fillCategorySelect(CATEGORIES);
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove("active");
  resetForm(); // IMPORTANT : On nettoie tout en fermant
}

// ──────────────────────────────────────────────────────────────
// [9] RENDU GALERIE MODALE (Suppression)
// ──────────────────────────────────────────────────────────────
function renderModalGallery(list) {
  if (!modalGalleryList) return;
  modalGalleryList.innerHTML = "";
  list.forEach((work) => {
    const item = document.createElement("div");
    item.className = "modal-gallery-item";
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title || "Projet";

    const delBtn = document.createElement("button");
    delBtn.className = "modal-delete-btn";
    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    
    // Suppression
    delBtn.addEventListener("click", async (e) => {
      e.preventDefault(); // évite rechargement
      await deleteWork(work.id);
    });

    item.appendChild(img);
    item.appendChild(delBtn);
    modalGalleryList.appendChild(item);
  });
}

// ──────────────────────────────────────────────────────────────
// [10] REMPLIR LE SELECT CATÉGORIE
// ──────────────────────────────────────────────────────────────
function fillCategorySelect(categories) {
  if (!categorySelect) return;
  categorySelect.innerHTML = "";
  // Option vide par défaut (optionnel mais propre)
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "";
  categorySelect.appendChild(defaultOpt);

  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}

// ──────────────────────────────────────────────────────────────
// [11] SUPPRESSION D’UN TRAVAIL
// ──────────────────────────────────────────────────────────────
async function deleteWork(id) {
  if (!token) {
    alert("Non autorisé");
    return;
  }
  // Confirmation simple (optionnel)
  const confirmDelete = confirm("Voulez-vous vraiment supprimer ce projet ?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      // Mise à jour locale
      ALL_WORKS = ALL_WORKS.filter((w) => w.id !== id);
      renderGallery(ALL_WORKS);
      renderModalGallery(ALL_WORKS);
    } else {
      console.error("Suppression impossible", res.status);
    }
  } catch (err) {
    console.error("Erreur suppression :", err);
  }
}

// ──────────────────────────────────────────────────────────────
// [12] AJOUT D’UN TRAVAIL (FORMULAIRE)
// ──────────────────────────────────────────────────────────────
if (addWorkForm) {
  addWorkForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Vous devez être connecté");
      return;
    }

    const formData = new FormData(addWorkForm);
    
    // Vérification simple si le fichier est bien là
    if (!formData.get("image") || formData.get("image").size === 0) {
        alert("Veuillez sélectionner une image");
        return;
    }

    try {
      const res = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const newWork = await res.json();
        ALL_WORKS.push(newWork);
        
        // Mise à jour affichage
        renderGallery(ALL_WORKS);
        renderModalGallery(ALL_WORKS);
        
        // Retour vue galerie + Reset
        showGalleryView();
        resetForm(); 
      } else {
        console.error("Erreur ajout :", res.status);
      }
    } catch (err) {
      console.error("Erreur réseau ajout :", err);
    }
  });
}

// ──────────────────────────────────────────────────────────────
// [13] GESTION DE LA PRÉVISUALISATION DE L'IMAGE (NOUVEAU ICI)
// ──────────────────────────────────────────────────────────────
const fakeUploadBtn = document.getElementById("fake-upload-btn");
const realFileInput = document.getElementById("image");
const uploadBox = document.querySelector(".modal-upload-box");

// 1. Clic sur le faux bouton déclenche le vrai input
if (fakeUploadBtn && realFileInput) {
  fakeUploadBtn.addEventListener("click", () => {
    realFileInput.click();
  });
}

// 2. Écoute du changement de fichier pour la prévisualisation
if (realFileInput) {
  realFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    
    // Si un fichier est sélectionné
    if (file) {
      // Vérification taille (4Mo max = 4 * 1024 * 1024 octets)
      const maxBytes = 4 * 1024 * 1024;
      if (file.size > maxBytes) {
        alert("L'image est trop volumineuse (max 4Mo)");
        realFileInput.value = ""; // Reset
        return;
      }

      // Création du lecteur de fichier
      const reader = new FileReader();
      
      reader.onload = (event) => {
        // On récupère l'URL de l'image chargée
        const imgUrl = event.target.result;

        // On masque les éléments par défaut de la boite (icône, bouton, texte)
        // Note : on ne supprime pas le input, il est déjà hidden via CSS
        const elementsToHide = uploadBox.querySelectorAll(".fa-image, #fake-upload-btn, small");
        elementsToHide.forEach(el => el.style.display = "none");

        // On vérifie si une prévisualisation existe déjà, sinon on la crée
        let previewImg = uploadBox.querySelector(".preview-img");
        if (!previewImg) {
            previewImg = document.createElement("img");
            previewImg.className = "preview-img";
            // Style pour que l'image prenne toute la boite
            previewImg.style.height = "100%"; 
            previewImg.style.width = "auto";
            previewImg.style.objectFit = "contain"; // Garde les proportions
            uploadBox.appendChild(previewImg);
        }
        previewImg.src = imgUrl;
        previewImg.style.display = "block";
      };

      // Lecture du fichier
      reader.readAsDataURL(file);
    }
  });
}

// 3. Fonction pour remettre le formulaire à zéro (Nettoyage)
function resetForm() {
    if (addWorkForm) addWorkForm.reset();
    
    // On supprime l'image de préview
    const previewImg = document.querySelector(".preview-img");
    if (previewImg) {
        previewImg.remove();
    }

    // On réaffiche les éléments de la boite d'upload
    if (uploadBox) {
        const elementsToShow = uploadBox.querySelectorAll(".fa-image, #fake-upload-btn, small");
        elementsToShow.forEach(el => el.style.display = ""); // "" enlève le display:none inline
    }
}

// ──────────────────────────────────────────────────────────────
// [14] ÉCOUTEURS GLOBAUX (OUVERTURE/FERMETURE)
// ──────────────────────────────────────────────────────────────

// Ouvrir
if (editButton) {
  editButton.addEventListener("click", () => {
    if (token) openModal();
  });
}

// Fermer (croix)
if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

// Fermer (overlay)
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// Touche Échap
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Boutons navigation interne modale
if (modalAddPhotoBtn) {
  modalAddPhotoBtn.addEventListener("click", showFormView);
}
if (modalBack) {
  modalBack.addEventListener("click", showGalleryView);
}

// ──────────────────────────────────────────────────────────────
// [15] LANCEMENT INITIAL
// ──────────────────────────────────────────────────────────────
createWorksElement();
createCategoriesElement();
// ──────────────────────────────────────────────────────────────
// [16] VÉRIFICATION FORMULAIRE (BOUTON VERT)
// ──────────────────────────────────────────────────────────────
function checkFormValidity() {
  const titleInput = document.getElementById("title");
  const categoryInput = document.getElementById("category");
  const fileInput = document.getElementById("image");
  const submitBtn = document.querySelector("#add-work-form .modal-primary-btn");

  // On vérifie si les 3 champs sont remplis
  const isTitleFilled = titleInput.value.trim() !== "";
  const isCategoryFilled = categoryInput.value !== "";
  const isFileSelected = fileInput.files && fileInput.files.length > 0;

  if (isTitleFilled && isCategoryFilled && isFileSelected) {
    submitBtn.style.backgroundColor = "#1D6154"; // Vert validé
  } else {
    submitBtn.style.backgroundColor = ""; // Revient à la couleur par défaut (gris)
  }
}

// On ajoute les écouteurs d'événements sur les 3 champs
document.getElementById("title").addEventListener("input", checkFormValidity);
document.getElementById("category").addEventListener("change", checkFormValidity);
document.getElementById("image").addEventListener("change", () => {
    // On rappelle la vérification ici (en plus de la prévisualisation)
    checkFormValidity(); 
});