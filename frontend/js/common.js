// Fonction pour récupérer le nom de la page actuelle
function getCurrentPage() {
    const path = window.location.pathname;
    console.log(path);
    return path.substring(path.lastIndexOf('/') + 1); // Retourne le nom du fichier HTML
}

// Vérifier si on n'est pas sur la page de connexion
const currentPage = getCurrentPage();

if (currentPage !== 'Page_de_connexion.html') {
    console.log("On est pas dans la page de connexion");
    const userId = sessionStorage.getItem('userId');

    if (userId) {
        console.log(`Utilisateur connecté avec l'ID : ${userId}`);
    } else {
        console.warn("Aucun utilisateur connecté.");
        //alert("Veuillez vous connecter pour accéder à cette page.");
        window.location.href = '/Page_de_connexion.html'; // Redirige vers la page de connexion
    }
}
