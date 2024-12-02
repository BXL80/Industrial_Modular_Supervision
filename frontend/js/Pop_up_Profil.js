const profileButton = document.querySelector('.btn-success');

profileButton.addEventListener('click', async (event) => {
  event.preventDefault();

  // **Verify file path:**
  const profileUrl = './frontend/Page_Profil.html'; // Adjust if needed

  // Créer une fenêtre modale
  const modal = document.createElement('div');
  modal.classList.add('modal', 'fade');
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'profileModalLabel');
  modal.setAttribute('aria-hidden', 'true');

  try {
    // **Check for errors during fetch:**
    const response = await fetch(profileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile content: ${response.status}`);
    }

    const html = await response.text();
    modal.innerHTML = html;

    // Ajouter la modal au body
    document.body.appendChild(modal);

    // Afficher la modal avec Bootstrap et gérer la fermeture
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Fermer la modal si l'utilisateur clique en dehors ou sur le bouton de fermeture
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modalInstance.hide();
      }
    });
  } catch (error) {
    console.error('Error loading profile content:', error);
    // Handle the error gracefully (e.g., display an error message to the user)
  }
});