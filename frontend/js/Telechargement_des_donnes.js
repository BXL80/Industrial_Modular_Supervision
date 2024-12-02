function exporterDonnees() {
    // Get the table element
    const table = document.querySelector('table');
  
    // Create a string to hold the CSV data
    let csvContent = '';
  
    // Get the table header row
    const headerRow = table.rows[0];
  
    // Extract header cell values
    for (let i = 0; i < headerRow.cells.length; i++) {
      const cell = headerRow.cells[i];
      csvContent += cell.textContent + ',';
    }
  
    // Add a new line after the header
    csvContent += '\n';
  
    // Loop through each data row in the table body
    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i];
  
      // Extract data cell values
      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        csvContent += cell.textContent + ',';
      }
  
      // Add a new line after each data row
      csvContent += '\n';
    }
  
    // Create a Blob object with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  
    // Create a downloadable link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
  
    // Simulate a click on the link to trigger download
    link.click();
  }