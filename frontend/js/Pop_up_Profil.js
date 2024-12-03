const profileButton = document.querySelector('.btn-success');

profileButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert('Utilisateur non connecté.');
        return;
    }

    // Fetch user data from the backend
    try {
        const response = await fetch(`http://localhost:5001/utilisateurs/${userId}`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const userData = await response.json();
        console.log('Données utilisateur récupérées :', userData);

        // Create a modal dynamically
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'profileModalLabel');
        modal.setAttribute('aria-hidden', 'true');

        // Inject user data into the modal content
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="profileModalLabel">Profil Utilisateur</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>ID :</strong> ${userData.id}</p>
                        <p><strong>Nom :</strong> ${userData.nom}</p>
                        <p><strong>Prénom :</strong> ${userData.prenom}</p>
                        <p><strong>Email :</strong> ${userData.email}</p>
                        <p><strong>Poste :</strong> ${userData.poste_nom}</p>
                    </div>
                </div>
            </div>
        `;

        // Add the modal to the body
        document.body.appendChild(modal);

        // Display the modal using Bootstrap
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Remove the modal when it is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur :', error);
        alert('Erreur lors du chargement du profil.');
    }
});