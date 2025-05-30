document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    if (!form) {
        console.error('Không tìm thấy form đăng nhập với id "login-form"');
        return;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Tự động xóa localStorage nếu đã có user
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.token) {
            console.log('Đã có user đăng nhập, xóa localStorage và tiếp tục đăng nhập mới:', currentUser);
            localStorage.removeItem('user');
            alert('Phiên đăng nhập trước đã được xóa. Vui lòng tiếp tục đăng nhập.');
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
                body: JSON.stringify({ email: email, password: password })
            });

            if (response.status === 200) {
                const data = await response.json();
                console.log('Phản hồi từ API đăng nhập:', data);

                // Lấy userId từ API
                const userId = data.userId;
                if (!userId) {
                    console.error('Không tìm thấy userId trong phản hồi API');
                    alert('Không thể xác định userId. Vui lòng liên hệ quản trị viên.');
                    return;
                }

                // Kiểm tra role từ API
                if (data.role !== 'Admin') {
                    console.error('Tài khoản không phải admin:', { role: data.role });
                    alert('Chỉ tài khoản admin được phép đăng nhập.');
                    return;
                }

                // Kiểm tra token hợp lệ ngay sau đăng nhập
                const tokenValid = await checkTokenValidity(data.token, userId);
                if (!tokenValid) {
                    console.error('Token không hợp lệ ngay sau đăng nhập');
                    alert('Token không hợp lệ. Vui lòng thử lại hoặc liên hệ quản trị viên.');
                    return;
                }

                const userData = {
                    UserID: userId,
                    role: data.role,
                    email: email,
                    token: data.token
                };

                // Lưu vào localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('Đã lưu userData vào localStorage:', userData);

                // Chuyển hướng theo role
                if (data.role === 'Admin') {
                    alert(data.message || 'Đăng nhập thành công!');
                    window.location.href = './OrderManagement/index.html';
                } else {
                    alert('Vai trò không hợp lệ. Chỉ tài khoản Admin được phép truy cập.');
                    localStorage.removeItem('user');
                }
            } else if (response.status === 401) {
                alert('Sai email hoặc mật khẩu!');
            } else {
                const errorText = await response.text();
                alert(`Đã có lỗi xảy ra: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            alert(`Không thể kết nối đến máy chủ: ${error.message}`);
        }
    });

    // Hàm kiểm tra token hợp lệ
    async function checkTokenValidity(token, userId) {
        try {
            const response = await fetch(`https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/ViewAccount/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`Kiểm tra token - Status: ${response.status}, URL: https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/ViewAccount/${userId}`);
            if (response.ok) {
                console.log('Token hợp lệ sau đăng nhập');
                return true;
            }
            const errorText = await response.text();
            console.error('Token không hợp lệ sau đăng nhập', { status: response.status, errorText });
            return false;
        } catch (error) {
            console.error('Lỗi khi kiểm tra token sau đăng nhập:', error);
            return false;
        }
    }
});