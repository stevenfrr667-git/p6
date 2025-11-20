// ──────────────────────────────────────────────────────────────
// [1] SÉLECTION DU FORMULAIRE
// ──────────────────────────────────────────────────────────────
const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const urlLogin = "http://localhost:5678/api/users/login";

    try {
      const response = await fetch(urlLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Connexion réussie :", data);

        // Stocke le token dans localStorage
        localStorage.setItem("token", data.token);

        // Redirige vers la page d’accueil
        window.location.href = "../index.html";
      } else {
        displayError("E-mail ou mot de passe incorrect.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      displayError("Impossible de se connecter au serveur.");
    }
  });
}

// ──────────────────────────────────────────────────────────────
// [2] MESSAGE D’ERREUR VISUEL
// ──────────────────────────────────────────────────────────────
function displayError(message) {
  let existing = document.querySelector(".login-error");
  if (existing) existing.remove();

  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  errorMsg.className = "login-error";
  errorMsg.style.color = "red";
  errorMsg.style.textAlign = "center";
  errorMsg.style.marginTop = "10px";

  loginForm.appendChild(errorMsg);
}
