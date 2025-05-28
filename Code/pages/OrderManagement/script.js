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

// Gọi API và hiển thị danh sách đơn hàng
document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.querySelector('tbody');
    if (!tbody) {
        console.error("Không tìm thấy phần tử <tbody>");
        return;
    }

    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Đang tải dữ liệu...</td></tr>`;

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
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">Không có đơn hàng nào.</td></tr>`;
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

            const row = `
                <tr>
                    <td>${orderId}</td>
                    <td>${orderDate ? formatDate(orderDate) : 'N/A'}</td>
                    <td>${totalPrice !== undefined && totalPrice !== null && !isNaN(totalPrice) ? formatCurrency(totalPrice, unitCode) : 'N/A'}</td>
                    <td>${unitCode !== undefined && unitCode !== null ? (unitCode || 'N/A') : 'N/A'}</td>
                    <td>${userId}</td>
                    <td>${carModelId}</td>
                    <td>${trackingId}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    })
    .catch(error => {
        console.error('Lỗi khi gọi API:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Không thể tải dữ liệu đơn hàng: ${error.message}</td>
            </tr>
        `;
    });
});