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
    if (utilisateurSelect) {
        fetch('/utilisateurs/liste')
            .then((response) => response.json())
            .then((utilisateurs) => {
                utilisateurs.forEach((utilisateur) => {
                    const option = document.createElement("option");
                    option.value = utilisateur.id;
                    option.textContent = `${utilisateur.prenom.toUpperCase()} ${utilisateur.nom.toUpperCase()}`;
                    utilisateurSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Erreur lors de la récupération des utilisateurs:', error));
    }

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
            let nom = document.getElementById('nom').value.trim().toUpperCase();
            let prenom = document.getElementById('prenom').value.trim().toUpperCase();

            if (!nom || !prenom) {
                alert("Veuillez renseigner à la fois le nom et le prénom.");
                return;
            }

            fetch('http://localhost:5001/utilisateurs')
                .then(response => response.json())
                .then(utilisateurs => {
                    const utilisateurExiste = utilisateurs.some(u =>
                        u.nom.toUpperCase() === nom && u.prenom.toUpperCase() === prenom
                    );

                    if (utilisateurExiste) {
                        alert(`L'opérateur ${prenom} ${nom} existe déjà.`);
                    } else {
                        fetch('http://localhost:5001/utilisateurs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ nom, prenom })
                        })
                            .then(response => response.json())
                            .then(data => {
                                alert(`Opérateur ajouté : ${data.prenom} ${data.nom}`);
                                const option = document.createElement('option');
                                option.value = data.id;
                                option.textContent = `${data.prenom} ${data.nom}`;
                                utilisateurSelect.appendChild(option);
                            })
                            .catch(error => console.error('Erreur lors de l\'ajout de l\'opérateur:', error));
                    }
                })
                .catch(error => console.error('Erreur lors de la récupération des opérateurs:', error));
        });
    }
});
