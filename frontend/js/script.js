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

    /*      Gestion du toast pour la sélection de l'ordre de tri       */
    const sortOrderSelect = document.getElementById('sortOrder');
    
    // Ajoute un événement 'change' sur le select pour le tri
    sortOrderSelect.addEventListener('change', function() {
        const selectedOption = sortOrderSelect.options[sortOrderSelect.selectedIndex].text;
        
        // Met à jour le texte du toast avec l'option sélectionnée
        toastBody.textContent = `Tri sélectionné : ${selectedOption}`;
        
        // Affiche le toast
        toast.show();
    });
    /*      Fin gestion toast       */

    const operateur_id = localStorage.getItem('operateur_id');
    const operateur_nom = localStorage.getItem('operateur_nom');
    const operateur_prenom = localStorage.getItem('operateur_prenom');

    const piece_id = new URLSearchParams(window.location.search).get('id');

    // Gestion du changement de couleur de fond via un sélecteur de couleur
    document.getElementById('Couleur').addEventListener('input', function (e) {
        document.getElementById('FondSVP').style.backgroundColor = e.target.value;
    });

    // Vérifiez si l'opérateur est connecté
    if (!operateur_id) {
        console.error('Aucun opérateur sélectionné. Veuillez vous connecter.');
        window.location.href = 'login.html'; // Redirige vers login si pas connecté
        return;
    }
    else {
        console.log(`Connecté en tant que: ${operateur_prenom} ${operateur_nom} (ID: ${operateur_id})`);
    }

    // Vérifier sur quelle page on se trouve
    if (window.location.pathname.endsWith('index.html')) {
        // On est sur la page index.html, exécuter updateTable()
        updateTable();
    }
    else if (window.location.pathname.endsWith('test.html')) {
        // On est sur la page test.html, exécuter le code spécifique à cette page
        if (piece_id) {
            // Si un ID de pièce est fourni, charger les résultats de tests pour cette pièce
            fetch(`http://localhost:3000/resultats?piece_id=${piece_id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur lors de la récupération des résultats: ${response.status}`);
                    }
                    return response.json();
                })
                .then(results => {
                    if (results.length === 0 || (results.every(result => result.resultat_boolean === null && result.resultat_numeric === null))) {
                        // Si le tableau de résultats est vide, renvoie true, c'est une nouvelle pièce
                        console.log("Nouvelle pièce, aucun test à préremplir.");
                        // Si nouvelle pièce je vide les champs
                        document.getElementById("select").value = '';
                        document.getElementById("Temperature").value = '';
                        document.getElementById("MAJfirmware").checked = false;
                    }
                    else {
                        // Si des résultats existent, préremplir les champs
                        console.log("Pièce existante, remplissage des résultats des tests.");
                        const date_test = results[0].date_test; // Prendre la date du premier test
                        document.getElementById('date_test').textContent = convertirUTCenLocale(date_test); // Afficher la date
                        results.forEach(result => {
                            if (result.test_id === 1) {
                                document.getElementById("select").value = result.resultat_boolean === 1 ? 'OK' : 'NOK';
                            }
                            else if (result.test_id === 2) {
                                document.getElementById("Temperature").value = result.resultat_numeric || '';
                            }
                            else if (result.test_id === 3) {
                                document.getElementById("MAJfirmware").checked = result.resultat_boolean === 1;
                            }
                        });
                    }
                })
                .catch(error => console.error('Erreur lors de la récupération des résultats:', error));
        }
        else {
            console.log('Aucun ID de pièce fourni dans l\'URL. Affichage normal sans tests.');
        }
    }
});

//Charger la liste de opérateurs
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/operateurs')
        .then(response => response.json())
        .then(operateurs => {
            const operateurSelect = document.getElementById('operateurSelect');
            if (!operateurSelect) {
                //console.log('L\'élément operateurSelect est introuvable dans le DOM.');
                return;
            }
            operateurs.forEach(operateur => {
                const option = document.createElement('option');
                option.value = operateur.id;
                option.textContent = `${operateur.prenom.toUpperCase()} ${operateur.nom.toUpperCase()}`; //Conversion en majuscule
                operateurSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des opérateurs:', error);
        });
});

//Ajout de nouveaux opérateurs
document.addEventListener('DOMContentLoaded', function () {
    const addOperateurForm = document.getElementById('addOperateurForm');

    if (addOperateurForm) {
        addOperateurForm.addEventListener('submit', function (e) {
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
            fetch('http://localhost:3000/operateurs')
                .then(response => response.json())
                .then(operateurs => {
                    // Rechercher si un opérateur avec le même nom et prénom existe déjà
                    const operateurExiste = operateurs.some(operateur =>
                        operateur.nom.toUpperCase() === nom && operateur.prenom.toUpperCase() === prenom
                    );

                    if (operateurExiste) {
                        // Si l'opérateur existe déjà, alerter l'utilisateur
                        alert(`L'opérateur ${prenom} ${nom} existe déjà.`);
                    } else {
                        // Si l'opérateur n'existe pas, l'ajouter à la base de données
                        fetch('http://localhost:3000/operateurs', {
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
                                const operateurSelect = document.getElementById('operateurSelect');
                                if (operateurSelect) {
                                    const option = document.createElement('option');
                                    option.value = data.id;
                                    option.textContent = `${data.prenom} ${data.nom}`;
                                    operateurSelect.appendChild(option);
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
    var select = document.querySelector('select[name="operateur_id"]');
    var selectedOption = select.options[select.selectedIndex];
    var operateur_id = selectedOption.value;
    var operateur_nom = selectedOption.text;
    var operateur_prenom = selectedOption.text;
    localStorage.setItem('operateur_id', operateur_id);
    localStorage.setItem('operateur_nom', operateur_nom);
    localStorage.setItem('operateur_prenom', operateur_prenom);
    window.location.href = 'index.html'; // Redirige vers index.html
});

function formatDate(dateString) {
    const date = new Date(dateString); // dateString est en UTC

    // Le fuseau Europe/Paris (UTC+2) me donne 2 heures de retard donc je vais aller chercher UTC+4 : l'île Maurice
    const formattedDate = date.toLocaleDateString('fr-FR', { timeZone: 'Indian/Mauritius' });
    const formattedTime = date.toLocaleTimeString('fr-FR', { timeZone: 'Indian/Mauritius' });

    return { formattedDate, formattedTime };
}

// Fonction pour convertir les dates UTC en heure locale du navigateur
function convertirUTCenLocale(dateUTC) {
    const date = new Date(dateUTC); // Crée un objet Date à partir de la chaîne UTC
    return date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }); // Convertit en heure locale du navigateur
}

function updateTable() {
    fetch('http://localhost:3000/pieces')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des pièces : ${response.status}`);
            }
            return response.json();
        })
        .then(pieces => {
            const tableBody = document.getElementById("tableBody");

            if (!tableBody) {
                console.error('L\'élément tableBody est introuvable.');
                return;
            }

            tableBody.innerHTML = ''; // Vider le tableau avant de le remplir

            // Récupérer la méthode de tri sélectionnée
            const sortOrder = document.getElementById("sortOrder").value;

            // Trier les pièces en fonction de la méthode choisie
            if (sortOrder === 'recent') {
                pieces.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)); // Du plus récent au moins récent
            } else if (sortOrder === 'ancien') {
                pieces.sort((a, b) => new Date(a.date_creation) - new Date(b.date_creation)); // Du moins récent au plus récent
            }

            // Récupérer les résultats et les opérateurs
            Promise.all([
                fetch('http://localhost:3000/resultats'),
                fetch('http://localhost:3000/operateurs')
            ])
                .then(responses => Promise.all(responses.map(res => res.json())))
                .then(([results, operateurs]) => {

                    // Créer un dictionnaire pour les résultats par piece_id
                    const resultsByPieceId = results.reduce((acc, result) => {
                        if (!acc[result.piece_id]) {
                            acc[result.piece_id] = {};
                        }
                        acc[result.piece_id][result.test_id] = result;
                        return acc;
                    }, {});

                    let prevPiece = {}; // Variable pour stocker les valeurs précédentes

                    pieces.forEach(piece => {
                        // Comparer la nouvelle pièce avec la précédente
                        if (prevPiece.numero_serie === piece.numero_serie && prevPiece.date_creation === piece.date_creation) {
                            return; // Si c'est la même pièce et la même date, passer à la suivante
                        }

                        const newRow = tableBody.insertRow();
                        const operateur = operateurs.find(o => o.id === piece.operateur_id) || {};

                        // Formater la date et l'heure
                        const { formattedDate, formattedTime } = formatDate(piece.date_creation);

                        // Remplir les cellules
                        newRow.insertCell().innerHTML = formattedDate; // Date formatée
                        newRow.insertCell().innerHTML = formattedTime; // Heure formatée
                        newRow.insertCell().innerHTML = piece.numero_serie; // Numéro de série
                        newRow.insertCell().innerHTML = operateur.prenom || 'N/A'; // Nom de l'opérateur
                        newRow.insertCell().innerHTML = operateur.nom || 'N/A'; // Prénom de l'opérateur

                        // Colonne Continuité
                        const continuiteCell = newRow.insertCell();
                        const continuiteValue = resultsByPieceId[piece.id] && resultsByPieceId[piece.id][1]; // test_id 1
                        continuiteCell.innerHTML = continuiteValue && continuiteValue.resultat_boolean !== undefined ?
                            (continuiteValue.resultat_boolean ? 'OK' : 'NOK') : 'N/A';
                        continuiteCell.style.backgroundColor = (continuiteCell.innerHTML === 'OK') ? 'green' :
                            (continuiteCell.innerHTML === 'NOK') ? 'red' : 'white';

                        // Colonne Température
                        const temperatureCell = newRow.insertCell();
                        const temperatureValue = resultsByPieceId[piece.id] && resultsByPieceId[piece.id][2]; // test_id 2
                        temperatureCell.innerHTML = temperatureValue && temperatureValue.resultat_numeric !== undefined ?
                            temperatureValue.resultat_numeric : 'N/A';

                        // Gestion de la couleur de fond en fonction de la valeur de temperatureValue
                        if (temperatureValue?.resultat_numeric === 'N/A') {
                            // Si la valeur est "N/A", on met le fond en blanc
                            temperatureCell.style.backgroundColor = 'white';
                        }
                        else if (typeof temperatureValue?.resultat_numeric === 'number') {
                            // Si la valeur est un nombre, on applique les règles de couleur
                            if (temperatureValue.resultat_numeric < 0) {
                                // Si la température est négative, on met le fond en bleu
                                temperatureCell.style.backgroundColor = 'red';
                            } else if (temperatureValue.resultat_numeric >= 0 && temperatureValue.resultat_numeric <= 100) {
                                // Si la température est entre 0 et 100, on met le fond en vert
                                temperatureCell.style.backgroundColor = 'green';
                            } else if (temperatureValue.resultat_numeric > 100) {
                                // Si la température est supérieure à 100, on met le fond en rouge
                                temperatureCell.style.backgroundColor = 'red';
                            }
                        }
                        else {
                            // Si ce n'est ni un nombre, ni "N/A", on met le fond en blanc car non prévu
                            temperatureCell.style.backgroundColor = 'white';
                        }

                        // Colonne MAJ firmware (test_id 3)
                        const majCell = newRow.insertCell();
                        const majResult = resultsByPieceId[piece.id] && resultsByPieceId[piece.id][3]; // test_id 3
                        const majValue = majResult && majResult.resultat_boolean !== undefined ?
                            (majResult.resultat_boolean ? 'Oui' : 'Non') : 'N/A'; // MAJ firmware
                        majCell.innerHTML = majValue;
                        majCell.style.backgroundColor = majValue === 'Oui' ? 'green' :
                            (majValue === 'Non' ? 'red' : 'white'); // Couleur de fond

                        // Colonne Status
                        const statusCell = newRow.insertCell();
                        const statusValue = piece.status === 1 ? 'Conforme' : 'Non Conforme';
                        statusCell.innerHTML = statusValue;
                        statusCell.style.backgroundColor = statusValue === 'Conforme' ? 'green' : 'red'; // Couleur de fond                                

                        // Ajouter le bouton Modifier de manière dynamique
                        const actionCell = newRow.insertCell();
                        const editButton = document.createElement('button');
                        editButton.innerText = 'Modifier';
                        editButton.className = 'btn btn-warning'; // Classe Bootstrap pour le style
                        editButton.onclick = () => {
                            window.location.href = `test.html?id=${piece.id}&numero_serie=${encodeURIComponent(piece.numero_serie)}&operateur_id=${operateur.id}&date_creation=${encodeURIComponent(piece.date_creation)}&operateur_nom=${encodeURIComponent(operateur.nom)}`;
                            //window.location.href = `test.html?id=${piece.id}&numero_serie=${encodeURIComponent(piece.numero_serie)}&operateur_id=${operateur.id}`;
                        };
                        actionCell.appendChild(editButton); // Ajoute le bouton à la cellule

                        // Mettre à jour la pièce précédente pour la comparaison suivante
                        prevPiece = piece;
                    });
                    prevPiece = 0;
                })
                .catch(error => console.error('Erreur lors de la mise à jour du tableau:', error));
        })
        .catch(error => console.error('Erreur lors de la récupération des pièces:', error));
}

function validerTests() {
    const numero_serie = new URLSearchParams(window.location.search).get('numero_serie');

    if (!numero_serie) {
        console.error('Numéro de série non trouvé dans l\'URL.');
        return;
    }

    // Récupérer les tests associés à la pièce
    fetch(`http://localhost:3000/tests?numero_serie=${encodeURIComponent(numero_serie)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération des tests : ${response.status}`);
            }
            return response.json();
        })
        .then(tests => {
            if (tests.length > 0) {
                const promises = [];

                // Récupérer les valeurs du formulaire
                const continuite = document.getElementById("select").value === 'OK' ? 1 : 0;
                const temperature = parseFloat(document.getElementById("Temperature").value);
                const majFirmware = document.getElementById("MAJfirmware").checked ? 1 : 0;

                if (isNaN(temperature) || majFirmware === undefined) {
                    console.error("Un ou plusieurs éléments du formulaire n'ont pas été trouvés.");
                }

                console.log("Valeurs récupérées du formulaire :");
                console.log("Continuité :", continuite);
                console.log("Temperature :", temperature);
                console.log("MAJ Firmware :", majFirmware);



                const now = new Date();
                const date_test = now.toISOString().slice(0, 19).replace('T', ' ');



                // Parcourir les tests pour envoyer les résultats
                tests.forEach(test => {
                    if (test.nom_test === 'Continuite') {
                        promises.push(enregistrerResultat(test.resultat_id, continuite, null, date_test));
                    }
                    else if (test.nom_test === 'Temperature') {
                        promises.push(enregistrerResultat(test.resultat_id, null, temperature, date_test));
                    }
                    else if (test.nom_test === 'MAJ') {
                        promises.push(enregistrerResultat(test.resultat_id, majFirmware, null, date_test));
                    }
                });

                // Attendre que tous les enregistrements soient complétés
                Promise.all(promises)
                    .then(() => {
                        console.log('Tous les résultats ont été enregistrés avec succès.');
                        return verifierEtMettreAJourStatus(numero_serie, continuite, temperature, majFirmware, tests); // Retourne la promesse ici
                    })
                    .then(() => {
                        // Une fois la mise à jour du statut terminée, rediriger vers index.html
                        console.log('Redirection vers index.html après mise à jour du statut');
                        window.location.href = 'index.html'; // Redirection après la validation
                    })
                    .catch(error => {
                        console.error('Erreur lors de l\'enregistrement des résultats ou de la mise à jour du statut :', error);
                    });
            } else {
                console.error('Aucun test trouvé pour cette pièce.');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des tests :', error);
        });
}

function verifierEtMettreAJourStatus(numero_serie, continuite, temperature, majFirmware, tests) {
    console.log("Début de la vérification du status pour la pièce :", numero_serie);

    if (!tests || tests.length === 0) {
        console.error("Aucun test trouvé pour la pièce :", numero_serie);
        return Promise.reject("Aucun test trouvé");
    }

    const testTemp = tests.find(test => test.nom_test === 'Temperature');

    if (!testTemp) {
        console.error("Test de température introuvable !");
        return Promise.reject("Test de température introuvable");
    }

    console.log("Test de température trouvé :", testTemp);

    // Vérification des seuils de température
    const temperatureValide = temperature >= testTemp.seuil_min && temperature <= testTemp.seuil_max;

    console.log(`Température valide : ${temperatureValide}, Continuité : ${continuite}, MAJ Firmware : ${majFirmware}`);

    // Si Continuité, MAJ Firmware sont à 1 et que Température est dans les seuils, mettre à jour le status à 1
    const status = (continuite === 1 && majFirmware === 1 && temperatureValide) ? 1 : 0;

    console.log(`Nouveau status à appliquer pour la pièce avec numéro de série ${numero_serie} : ${status === 1 ? 'Conforme' : 'Non Conforme'}`);

    // Obtenir l'ID de la pièce à partir du numero_serie
    return fetch(`http://localhost:3000/piece_id?numero_serie=${encodeURIComponent(numero_serie)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération de la pièce avec numéro de série : ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const piece_id = data.id;

            console.log(`ID de la pièce récupéré : ${piece_id}. Mise à jour du status à : ${status}`);

            // Mise à jour du status de la pièce dans la base de données
            return fetch(`http://localhost:3000/pieces/${piece_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur lors de la mise à jour du status de la pièce : ${response.status}`);
            }
            console.log(`Status de la pièce mis à jour avec succès à ${status === 1 ? 'Conforme' : 'Non Conforme'}`);
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du status :', error);
        });
}

function enregistrerResultat(resultat_id, resultat_boolean, resultat_numeric, date_test) {
    console.log(`Enregistrement du résultat ID ${resultat_id} avec les valeurs :`, {
        resultat_boolean,
        resultat_numeric,
        date_test
    });

    return fetch(`http://localhost:3000/resultats/${resultat_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            resultat_boolean: resultat_boolean,
            resultat_numeric: resultat_numeric,
            date_test: date_test
        })
    })
        .then(response => {
            console.log('Réponse du serveur :', response);
            if (!response.ok) {
                throw new Error("Erreur lors de l'enregistrement des résultats : " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Résultat pour le résultat ID ${resultat_id} enregistré avec succès. Réponse :`, data);
        })
        .catch(error => {
            console.error('Erreur lors de l\'enregistrement des résultats:', error);
        });
}

function ajouterPiece() {
    const id_piece = document.getElementById("ID_pièce").value; // Récupérer le numéro de série
    const operateur_id = parseInt(localStorage.getItem("operateur_id"));

    // Vérification si le numéro de série et l'opérateur ID sont bien présents
    if (!id_piece || !operateur_id) {
        alert("Le numéro de série ou l'ID de l'opérateur est manquant !");
        return;
    }

    // Vérifier si le numéro de série existe déjà dans la base de données
    fetch(`http://localhost:3000/pieces?numero_serie=${encodeURIComponent(id_piece)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur lors de la vérification du numéro de série : ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                // Si le numéro de série existe déjà, afficher une alerte
                alert("Ce numéro de série existe déjà !");
            } else {
                // Si le numéro de série n'existe pas, on l'ajoute
                fetch('http://localhost:3000/pieces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        numero_serie: id_piece,
                        operateur_id: operateur_id,
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Erreur HTTP: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Redirection vers test.html avec l'ID de la pièce, le numéro de série et l'ID de l'opérateur
                        window.location.href = `test.html?id=${data.id}&numero_serie=${encodeURIComponent(id_piece)}&operateur_id=${operateur_id}`;
                    })
                    .catch(error => console.error('Erreur lors de l\'enregistrement de la pièce:', error));
            }
        })
        .catch(error => console.error('Erreur lors de la vérification du numéro de série:', error));
}