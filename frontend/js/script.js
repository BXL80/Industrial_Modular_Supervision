document.addEventListener('DOMContentLoaded', function () {
    /*      Gestion toast       */
    // Sélectionne tous les boutons
    const buttons = document.querySelectorAll('button, input[type="submit"]');

    // Sélectionne le toast
    const toastElement = document.getElementById('actionToast');
    const toastBody = toastElement.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastElement);

    // Ajoute un événement 'click' sur chaque bouton
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Met à jour le texte du toast avec le nom du bouton
            const buttonText = this.value || this.innerText || "Bouton sans nom";
            toastBody.textContent = `Vous avez cliqué sur: ${buttonText}`;

            // Affiche le toast
            toast.show();
        });
    });
    /*      Fin gestion toast       */

    //Charger la liste des utilisateurs
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:5001/utilisateurs')
        .then(response => response.json())
        .then(utilisateurs => {
            const utilisateurSelect = document.getElementById('utilisateurSelect');
            if (!utilisateurSelect) {
                //console.log('L\'élément utilisateurSelect est introuvable dans le DOM.');
                return;
            }
            utilisateurs.forEach(utilisateur => {
                const option = document.createElement('option');
                option.value = utilisateur.id;
                option.textContent = `${utilisateur.prenom.toUpperCase()} ${utilisateur.nom.toUpperCase()}`; //Conversion en majuscule
                utilisateurSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des opérateurs:', error);
        });
});

//Ajout de nouveaux opérateurs
document.addEventListener('DOMContentLoaded', function () {
    const addUserForm = document.getElementById('addUserForm');

    if (addUserForm) {
        addUserForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Empêche le rechargement de la page

            let nom = document.getElementById('nom').value.trim();  // Récupérer et enlever les espaces autour
            let prenom = document.getElementById('prenom').value.trim();  // Récupérer et enlever les espaces autour

            // Vérification si les champs sont vides
            if (!nom || !prenom) {
                alert("Veuillez renseigner à la fois le nom et le prénom.");
                return;
            }

            // Convertir nom et prénom en majuscules
            nom = nom.toUpperCase();
            prenom = prenom.toUpperCase();

            // Vérifier si l'opérateur existe déjà dans la base de données
            fetch('http://localhost:5001/utilisateurs')
                .then(response => response.json())
                .then(utilisateurs => {
                    // Rechercher si un opérateur avec le même nom et prénom existe déjà
                    const utilisateurExiste = utilisateurs.some(utilisateur =>
                        utilisateur.nom.toUpperCase() === nom && utilisateur.prenom.toUpperCase() === prenom
                    );

                    if (utilisateurExiste) {
                        // Si l'opérateur existe déjà, alerter l'utilisateur
                        alert(`L'opérateur ${prenom} ${nom} existe déjà.`);
                    } else {
                        // Si l'opérateur n'existe pas, l'ajouter à la base de données
                        fetch('http://localhost:5001/utilisateurs', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ nom, prenom })
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Erreur lors de l\'ajout de l\'opérateur');
                                }
                                return response.json();
                            })
                            .then(data => {
                                alert(`Opérateur ajouté : ${data.prenom} ${data.nom}`);
                                // Mettre à jour la liste des opérateurs après l'ajout
                                const utilisateurSelect = document.getElementById('utilisateurSelect');
                                if (utilisateurSelect) {
                                    const option = document.createElement('option');
                                    option.value = data.id;
                                    option.textContent = `${data.prenom} ${data.nom}`;
                                    utilisateurSelect.appendChild(option);
                                }
                            })
                            .catch(error => {
                                console.error('Erreur lors de l\'ajout de l\'opérateur:', error);
                            });
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des opérateurs:', error);
                });
        });
    }
});

//Connexion d'un opérateur
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêche le formulaire d'être soumis normalement
    var select = document.querySelector('select[name="utilisateur_id"]');
    var selectedOption = select.options[select.selectedIndex];
    var utilisateur_id = selectedOption.value;
    var utilisateur_nom = selectedOption.text;
    var utilisateur_prenom = selectedOption.text;
    localStorage.setItem('utilisateur_id', utilisateur_id);
    localStorage.setItem('utilisateur_nom', utilisateur_nom);
    localStorage.setItem('utilisateur_prenom', utilisateur_prenom);
    window.location.href = 'index.html'; // Redirige vers index.html
})});