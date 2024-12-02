// Array to store defects (replace with actual data fetching logic)
const defects = [
    { date: "2023-12-02", description: "Défaut de capteur de température", action: "En cours d'analyse" },
    { date: "2023-12-01", description: "Arrêt machine inopiné", action: "Résolu" },
  ];
  
  // Function to populate the table with defects
  function populateTable() {
    const tableBody = document.getElementById('defautsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ""; // Clear existing content
  
    for (const defect of defects) {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
        <td><span class="math-inline">\{defect\.date\}</td\>
  <td\></span>{defect.description}</td>
        <td>${defect.action}</td>
      `;
      tableBody.appendChild(tableRow);
    }
  }
  
  // Function to display a toast notification
  function showToast(message) {
    const toastDiv = document.createElement('div');
    toastDiv.classList.add('toast');
    toastDiv.innerText = message;
  
    document.body.appendChild(toastDiv);
  
    // Set a timeout to automatically remove the toast
    setTimeout(() => {
      toastDiv.remove();
    }, 3000); // Adjust timeout duration in milliseconds