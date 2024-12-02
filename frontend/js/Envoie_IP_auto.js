document.getElementById('automateForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
  
    // Get the form data
    const formData = new FormData(event.target);
  
    // Send the data to your backend (replace with your backend logic)
    fetch('/your-backend-endpoint', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      // Handle the response from the server
      console.log(response);
    })
    .catch(error => {
      // Handle errors
      console.error(error);
    });
  });