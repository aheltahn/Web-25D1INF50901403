document.getElementById('notificationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
  
    const data = {
      UserID: parseInt(document.getElementById('userId').value, 10),
      Title: document.getElementById('title').value.trim(),
      Content: document.getElementById('content').value.trim()
    };
  
  
    try {
      const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Notification/Send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
  
      const text = await response.text();
  
  
      try {
        const json = JSON.parse(text);
        if (!response.ok) {
          alert('Error: ' + (json.message || response.statusText));
        } else {
          alert('Success: ' + JSON.stringify(json, null, 2));
          this.reset();
        }
      } catch (err) {
        alert('Response is not valid JSON:\n' + text);
      }
    } catch (error) {
      alert('Request failed: ' + error.message);
    }
  });
  
  
  
  