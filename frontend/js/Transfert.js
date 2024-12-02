const transferButton = document.querySelector('.btn-success'); // Select the "Transférer" button

transferButton.addEventListener('click', async () => {
  // Get data from input fields and dropdown
  const consigneMin1 = document.getElementById('consigneMin1').value;
  const consigneMax1 = document.getElementById('consigneMax1').value;
  const selectedAutomate = document.getElementById('automate1').value;

  // Prepare data for sending
  const data = {
    consigneMin1,
    consigneMax1,
    automate: selectedAutomate,
  };

  // Send data to the automate (replace with your actual API endpoint)
  const response = await fetch('http://your-automate-api.com/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Handle response
  if (response.ok) {
    console.log('Data transferred successfully!');
    // Optionally, display a success message to the user
  } else {
    console.error('Error transferring data:', response.statusText);
    // Optionally, display an error message to the user
  }
});