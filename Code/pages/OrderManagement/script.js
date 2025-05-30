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
});
// Hàm định dạng ngày thành DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return 'N/A';
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm định dạng giá tiền
function formatCurrency(amount, unitCode) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return 'N/A';
    }
    const currency = (unitCode === 'USD' || unitCode === 'usd') ? 'USD' : (unitCode === 'VND' || unitCode === 'vnd') ? 'VND' : 'USD';
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'vi-VN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Danh sách trạng thái đơn hàng cho dropdown
const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// Hàm gọi API với token tự động
async function callApiWithToken(url, method, body = null) {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = userData?.token;
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        throw new Error('No token found');
    }

    const options = {
        method: method,
        headers: headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('user');
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại với tài khoản admin.');
        window.location.href = "/login.html";
        return null;
    }

    if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
    }

    return data;
}

// Gọi API và hiển thị danh sách đơn hàng
document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.querySelector('tbody');
    if (!tbody) {
        console.error("Không tìm thấy phần tử <tbody>");
        return;
    }

    // Kiểm tra xem user đã đăng nhập và có role Admin không
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.token || userData.role !== 'Admin') {
        alert('Vui lòng đăng nhập với tài khoản admin.');
        window.location.href = "/login.html";
        return;
    }

    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Đang tải dữ liệu...</td></tr>`;

    callApiWithToken('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Order/GetOrders', 'GET')
        .then(data => {
            console.log('Dữ liệu từ API:', data);
            tbody.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center">Không có đơn hàng nào.</td></tr>`;
                return;
            }

            data.forEach(order => {
                // Gộp các biến có thể khác nhau trong JSON
                const orderId = order.OrderID || order.orderId || order.orderID || 'N/A';
                const orderDate = order.OrderDate || order.orderDate;
                const totalPrice = order.TotalPrice || order.total_price || order.totalPrice;
                const unitCode = order.Unit_Code || order.unitCode || order.unit_code || order.currency || order.unit || 'USD';
                const userId = order.UserID || order.userId || order.userID || 'N/A';
                const carModelId = order.CarModelID || order.carModelId || order.carModelID || 'N/A';
                const trackingId = order.OrderTrackingID || order.orderTrackingId || order.orderTrackingID || 'N/A';
                const orderStatus = order.OrderStatus || order.orderStatus || order.status || 'N/A';

                // Tạo dropdown cho trạng thái
                const statusOptions = orderStatuses.map(status => `
                    <option value="${status}" ${status === orderStatus ? 'selected' : ''}>${status}</option>
                `).join('');

                const row = `
                    <tr data-order-id="${orderId}">
                        <td>${orderId}</td>
                        <td>${orderDate ? formatDate(orderDate) : 'N/A'}</td>
                        <td>${totalPrice !== undefined && totalPrice !== null && !isNaN(totalPrice) ? formatCurrency(totalPrice, unitCode) : 'N/A'}</td>
                        <td>${unitCode !== undefined && unitCode !== null ? (unitCode || 'N/A') : 'N/A'}</td>
                        <td>${userId}</td>
                        <td>${carModelId}</td>
                        <td>${trackingId}</td>
                        <td>
                            <select class="form-select status-dropdown" data-order-id="${orderId}">
                                ${statusOptions}
                            </select>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Thêm sự kiện cho các dropdown
            document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                dropdown.addEventListener('change', async function () {
                    const orderId = this.getAttribute('data-order-id');
                    const newStatus = this.value;
                    const originalStatus = orderStatus; // Lưu trạng thái ban đầu để hoàn tác nếu cần

                    if (!orderId || !newStatus) {
                        alert('Không thể cập nhật trạng thái: Thiếu OrderID hoặc trạng thái mới.');
                        return;
                    }

                    try {
                        const data = await callApiWithToken('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Order/UpdateStatus', 'PUT', {
                            OrderID: parseInt(orderId),
                            OrderStatus: newStatus
                        });

                        if (data) {
                            alert(data.message || 'Cập nhật trạng thái đơn hàng thành công.');
                        }
                    } catch (error) {
                        console.error('Lỗi khi cập nhật trạng thái:', error);
                        alert(error.message);
                        // Hoàn tác lựa chọn nếu cập nhật thất bại
                        this.value = originalStatus;
                    }
                });
            });
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">Không thể tải dữ liệu đơn hàng: ${error.message}</td>
                </tr>
            `;
        });
});

