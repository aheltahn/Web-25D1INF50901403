document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');


  form.addEventListener('submit', async function (e) {
    e.preventDefault();


    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;


    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }


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
        console.log("API trả về data:", data); // Debug data trả về


        alert(data.message || 'Đăng nhập thành công!');


       const userData = {
        UserID: data.userId,
        role: data.role,
        email: email,
        token: data.token  // Lưu token JWT
 };


localStorage.setItem('user', JSON.stringify(userData));
sessionStorage.setItem('user', JSON.stringify(userData));


        console.log("User trong localStorage:", localStorage.getItem('user')); // Debug kiểm tra lưu


        // Nếu trang login mở từ trang chính thì gọi hàm cập nhật UI nút login/logout
        if (window.opener && typeof window.opener.onLoginSuccess === 'function') {
          window.opener.onLoginSuccess(userData);
          window.close(); // Đóng popup nếu dùng popup
          return;
        }


        // Nếu không phải popup, chuyển hướng bình thường theo role
        if (data.role === 'Admin') {
          window.location.href = '../OrderManagement/index.html';
        } else {
          window.location.href = '../home/index.html';
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





