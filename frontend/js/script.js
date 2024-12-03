document.addEventListener('DOMContentLoaded', function () {
    // Gestion toast
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    const toastElement = document.getElementById('actionToast');
    const toastBody = toastElement.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastElement);

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.value || this.innerText || "Bouton sans nom";
            toastBody.textContent = `Vous avez cliqué sur: ${buttonText}`;
            toast.show();
        });
    });

    // Charger la liste des utilisateurs
    const utilisateurSelect = document.getElementById("utilisateurSelect");

    // Vérifiez que l'élément utilisateurSelect existe
    if (!utilisateurSelect) {
        console.error("Élément utilisateurSelect introuvable !");
        return;
    }

    // Charger les utilisateurs depuis le backend
    fetch('http://localhost:5001/utilisateurs/liste')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            return response.json();
        })
        .then(utilisateurs => {
            // Parcourir les utilisateurs et les insérer dans le menu déroulant
            utilisateurs.forEach(utilisateur => {
                const option = document.createElement("option");
                option.value = utilisateur.id; // Utilisé pour identifier l'utilisateur dans le formulaire
                option.textContent = utilisateur.nomComplet; // Texte visible dans le menu déroulant
                utilisateurSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des utilisateurs :', error));

        const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const utilisateurId = document.getElementById("utilisateurSelect").value;

    if (!utilisateurId) {
        alert("Veuillez sélectionner un utilisateur.");
        return;
    }

    // Envoyer l'ID sélectionné au backend
    fetch('http://localhost:5001/connexion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ utilisateurId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur lors de la connexion : ${response.status}`);
        }
        return response.json(); // Convertir la réponse en JSON
    })
    .then(data => {
        console.log('Données reçues après connexion :', data);

        // Stocker l'ID utilisateur
        sessionStorage.setItem('userId', utilisateurId);
        console.log(`Utilisateur connecté avec l'ID : ${utilisateurId}`);

        // Rediriger vers la page de données
        window.location.href = "http://localhost:8080/Page_de_donnees.html";
    })
    .catch(error => console.error('Erreur lors de la connexion :', error));
});

        

    // Recup Postes
    const posteSelect = document.getElementById("posteSelect");
    if (posteSelect) {
        fetch('http://localhost:5001/postes')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                return response.json();
            })
            .then((postes) => {
                postes.forEach((poste) => {
                    const option = document.createElement("option");
                    option.value = poste.id;
                    option.textContent = poste.poste;
                    posteSelect.appendChild(option);
                });
            })
            .catch((error) => console.error('Erreur lors du chargement des postes:', error));
    }

    // Ajout de nouveaux opérateurs
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Récupération des champs
    let nom = document.getElementById('nom').value.trim();
    let prenom = document.getElementById('prenom').value.trim();
    let email = document.getElementById('email').value.trim();
    let posteSelect = document.getElementById('posteSelect').value;

    // Validation des champs
    if (!nom || !prenom || !email || !posteSelect) {
        alert("Veuillez remplir tous les champs requis.");
        return;
    }

    // Envoi des données au backend
    fetch('http://localhost:5001/utilisateurs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nom, prenom, email, posteSelect })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout de l\'utilisateur');
            }
            return response.json();
        })
        .then(data => {
            alert(`Utilisateur ajouté : ${data.prenom} ${data.nom}`);
            const utilisateurSelect = document.getElementById('utilisateurSelect');
            const option = document.createElement('option');
            option.value = data.id;
            option.textContent = `${data.prenom} ${data.nom}`;
            utilisateurSelect.appendChild(option);
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
        });
    })
}});