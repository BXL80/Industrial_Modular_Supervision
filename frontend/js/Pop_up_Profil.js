const profileButton = document.querySelector('.btn-success');

profileButton.addEventListener('click', async (event) => {
  event.preventDefault();

  const profileUrl = '/Page_profil.html'; // Assurez-vous que le chemin est correct

  // Créer une fenêtre modale
  const modal = document.createElement('div');
  modal.classList.add('modal', 'fade');
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'profileModalLabel');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="profileModalLabel">Profil</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Contenu sera injecté ici -->
        </div>
      </div>
    </div>
  `;

  try {
    const response = await fetch(profileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile content: ${response.status}`);
    }

    const html = await response.text();
    modal.querySelector('.modal-body').innerHTML = html;

    // Ajouter la modal au body
    document.body.appendChild(modal);

    // Afficher la modal avec Bootstrap
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
    alert('Erreur lors du chargement du profil.');
  }
});
