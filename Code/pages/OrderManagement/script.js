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

// Gọi API và hiển thị danh sách đơn hàng
document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.querySelector('tbody');
    if (!tbody) {
        console.error("Không tìm thấy phần tử <tbody>");
        return;
    }

    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Đang tải dữ liệu...</td></tr>`;

    fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Order/GetOrders', {
        headers: {
            'Role': 'Admin'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
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

                if (!orderId || !newStatus) {
                    alert('Không thể cập nhật trạng thái: Thiếu OrderID hoặc trạng thái mới.');
                    return;
                }

                try {
                    const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Order/UpdateStatus', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer <your-token-here>', // Thay bằng token thực tế
                            'Role': 'Admin'
                        },
                        body: JSON.stringify({
                            OrderID: parseInt(orderId),
                            OrderStatus: newStatus
                        })
                    });

                    if (response.ok) {
                        const message = await response.text();
                        alert(message || 'Cập nhật trạng thái đơn hàng thành công.');
                    } else {
                        const errorText = await response.text();
                        throw new Error(`Lỗi khi cập nhật trạng thái: ${response.status} - ${response.statusText}. Chi tiết: ${errorText}`);
                    }
                } catch (error) {
                    console.error('Lỗi khi cập nhật trạng thái:', error);
                    alert(error.message);
                    // Hoàn tác lựa chọn nếu cập nhật thất bại
                    this.value = orderStatus;
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