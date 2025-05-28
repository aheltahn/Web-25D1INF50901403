document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: email,
          Password: password
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        alert(data.message);

        // Lưu thông tin user (tùy vào logic app của bạn)
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('role', data.role);

        if (data.role === 'Admin') {
          window.location.href = '/pages/CarManagement/index.html';
        } else {
          window.location.href = '/pages/Home/index.html';
        }
      } else if (response.status === 401) {
        alert('Sai email hoặc mật khẩu!');
      } else {
        alert('Đã có lỗi xảy ra, vui lòng thử lại!');
      }

    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      alert('Không thể kết nối đến máy chủ!');
    }
  });
});
