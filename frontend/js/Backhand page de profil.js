// Supposons que vous avez soumis le formulaire et récupéré les valeurs dans des variables
const nom = "John";
const prenom = "Doe";
const email = "johndoe@example.com";
const poste = "Ingénieur";

// Sélectionnez les éléments span
const nomElement = document.getElementById("nom");
const prenomElement = document.getElementById("prenom");
const emailElement = document.getElementById("email");
const posteElement = document.getElementById("poste");

// Afficher les valeurs dans les éléments span
nomElement.textContent = nom;
prenomElement.textContent = prenom;
emailElement.textContent = email;
posteElement.textContent = poste;

//Pour faire une pop-up
// Sélectionner le bouton et le modal
const btnProfil = document.getElementById('btn-profil');
const modalProfil = new bootstrap.Modal(document.getElementById('modalProfil'));

// Écouter l'événement de clic sur le bouton
btnProfil.addEventListener('click', () => {
  // Afficher le modal
  modalProfil.show();

  // Récupérer les données du profil (si nécessaire) et les afficher dans le modal
  // ... votre code ici pour récupérer les données et mettre à jour les éléments span
});


//page de données
function exporterDonnees() {
  // Créer un objet pour stocker les données
  const data = [];
  // Récupérer les données du tableau et les ajouter à l'objet data
  // ...

  // Créer un fichier CSV
  const csvContent = "data:text/csv;charset=utf-8," +
    data.map(row => row.join(",")).join("\n");

  // Créer un élément de lien pour télécharger le fichier
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "mes_donnees.csv");
  document.body.appendChild(link);
  link.click();
}