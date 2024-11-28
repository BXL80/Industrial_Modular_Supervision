document.getElementById('test-plc').addEventListener('click', async () => {
    const response = await fetch('/api/test-plc');
    const result = await response.json();
    alert(result.message);
  });
  
  document.getElementById('export-csv').addEventListener('click', () => {
    window.location.href = '/api/export-data';
  });
  
  // Affichage du graphique
  const ctx = document.getElementById('chart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // Les étiquettes seront mises à jour dynamiquement
      datasets: [{
        label: 'Valeurs PLC',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }]
    }
  });
  