document.addEventListener('DOMContentLoaded', function () {
  // Lấy nút logout
  const logOutBtn = document.getElementsByName('logOutBtn')[0];

  // Đồng bộ logout giữa các tab qua sự kiện localStorage
  window.addEventListener('storage', function (e) {
    if (e.key === 'logout-event') {
      localStorage.removeItem('user');
      window.location.href = '../login/index.html';
    }
  });

  // Xử lý sự kiện đăng xuất
  if (logOutBtn) {
    logOutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.setItem('logout-event', Date.now());
      window.location.href = '../login/index.html';
    });
  }

  // Xử lý form gửi thông báo
  const notificationForm = document.getElementById('notificationForm');
  if (notificationForm) {
    notificationForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Lấy dữ liệu từ form
      const data36 = {
        UserID: parseInt(document.getElementById('userId').value, 10),
        Title: document.getElementById('title').value.trim(),
        Content: document.getElementById('content').value.trim()
      };

      // Kiểm tra dữ liệu
      if (isNaN(data36.UserID) || !data36.Title || !data36.Content) {
        alert('Error: Please fill in all fields correctly (UserID must be a number).');
        return;
      }

      // Lấy token từ localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token; // Giả sử token được lưu trong object 'user'

      if (!token) {
        alert('Error: No authentication token found. Please log in again.');
        window.location.href = '../login/index.html';
        return;
      }

      // Log dữ liệu để debug
      console.log('Data sent:', data36);
      console.log('Token:', token);

      try {
        const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Notification/Send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Thêm token vào header
          },
          body: JSON.stringify(data36)
        });

        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', text);

        // Xử lý lỗi 401 riêng
        if (response.status === 401) {
          alert('Error: Session expired or unauthorized. Please log in again.');
          localStorage.removeItem('user');
          window.location.href = '../login/index.html';
          return;
        }

        try {
          const json = JSON.parse(text);
          if (!response.ok) {
            alert('Error: ' + (json.message || response.statusText));
          } else {
            alert('Success: ' + JSON.stringify(json, null, 2));
            this.reset(); // Reset form sau khi gửi thành công
          }
        } catch (err) {
          alert( text);
        }
      } catch (error) {
        console.error('Request failed:', error);
        alert('Request failed: ' + error.message);
      }
    });
  }
});