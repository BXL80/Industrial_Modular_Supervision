document.getElementById('addAutomate').addEventListener('click', function() {
    const automateTable = document.getElementById('automateTable');
    const rowCount = automateTable.rows.length;
    const newRow = automateTable.insertRow(rowCount);
  
    const automateCell = newRow.insertCell(0);
    automateCell.textContent = 'Automate ' + (rowCount + 1);
  
    const ipCell = newRow.insertCell(1);
    const ipInput = document.createElement('input');
    ipInput.type = 'text';
    ipInput.className = 'form-control';
    ipInput.name = 'ip' + (rowCount + 1);
    ipInput.id = 'ip' + (rowCount + 1);
    ipCell.appendChild(ipInput);
  });