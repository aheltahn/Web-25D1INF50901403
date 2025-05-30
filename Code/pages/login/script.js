document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');


  form.addEventListener('submit', async function (e) {
    e.preventDefault();


    // Trước khi login, kiểm tra nếu đã có user đăng nhập trong localStorage thì không cho đăng nhập mới
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.token) {
      alert('Bạn đã đăng nhập rồi, vui lòng đăng xuất trước khi đăng nhập tài khoản khác.');
      return;
    }


    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;


    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }


    try {
      const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Auth/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password })
      });


      if (response.status === 200) {
        const data = await response.json();
        alert(data.message || 'Đăng nhập thành công!');


        const userData = {
          UserID: data.userId,
          role: data.role,
          email: email,
          token: data.token
        };


        // Lưu vào localStorage để đồng bộ đăng nhập các tab
        localStorage.setItem('user', JSON.stringify(userData));


        // Chuyển hướng theo role
        if (data.role === 'Admin') {
          window.location.href = '../OrderManagement/index.html';
        } else if (data.role === 'User') {
          window.location.href = '../home/index.html';
        } else {
          alert('Tài khoản không có vai trò hợp lệ!');
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





