document.addEventListener('DOMContentLoaded', () => {
    // Hàm định dạng ngày thành DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return 'N/A';
        }
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} ${date.toLocaleTimeString()}`;
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


    // Hàm hiển thị thông báo
    function showMessage(message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'} mt-3`;
        messageDiv.textContent = message;
        document.querySelector('.container.py-5').prepend(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }


    // Lấy token từ localStorage/sessionStorage
    function getToken() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) return null;
        try {
            const userObj = JSON.parse(userStr);
            return userObj.token || null;
        } catch {
            return null;
        }
    }


    // Hàm lấy lịch sử mua hàng
    function loadOrderHistory() {
        const token = getToken();


        fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/ViewOrderHistory', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Lịch sử đơn hàng:', data);
            filterOrders('order-history', data);
        })
        .catch(error => {
            console.error('Lỗi khi gọi API ViewOrderHistory:', error);
            showMessage(`Không thể tải lịch sử đơn hàng: ${error.message}`, true);
            document.getElementById('order-history-table').getElementsByTagName('tbody')[0].innerHTML =
                `<tr><td colspan="6" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`;
        });
    }


    // Hàm hiển thị section
    function showSection(event, sectionId) {
        event.preventDefault();
        const sections = document.querySelectorAll('.section-content');
        const links = document.querySelectorAll('.nav-links a');
        const pageTitle = document.getElementById('page-title');
        const headerText = document.getElementById('header-text');


        sections.forEach(section => section.classList.remove('active'));
        links.forEach(link => link.classList.remove('active'));


        if (sectionId === 'order-history') {
            document.getElementById('order-history').classList.add('active');
            document.querySelector(`a[href="#order-history"]`)?.classList.add('active');
            pageTitle.innerHTML = `
                <a href="../home/index.html" class="title-link" onclick="navigateTo(event, 'homepage')">Homepage</a> -
                <a href="../Profile/index.html" class="title-link" onclick="navigateTo(event, 'personal')">Profile</a> -
                <a href="../ViewMyOrder/index.html" class="title-link" onclick="showSection(event, 'order-history')">Order History</a>
            `;
            headerText.textContent = 'Order History';
            filterOrders('order-history');
        } else {
            // Nếu có thêm các section khác thì xử lý tương tự, hiện tại chỉ dùng order-history
        }
    }


    // Hàm hiển thị đơn hàng, không lọc dữ liệu
    function filterOrders(sectionId, data = []) {
        if (sectionId !== 'order-history') return;


        const tbody = document.getElementById(`${sectionId}-table`).getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';


        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không có đơn hàng nào.</td></tr>`;
            return;
        }


        data.forEach(order => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = order.orderID ?? order.OrderID ?? 'N/A';
            row.insertCell(1).textContent = formatDate(order.orderDate ?? order.OrderDate);
            row.insertCell(2).textContent = formatCurrency(order.totalPrice ?? order.TotalPrice, order.unit_Code ?? order.Unit_Code);
            row.insertCell(3).textContent = order.unit_Code ?? order.Unit_Code ?? 'N/A';
            row.insertCell(4).innerHTML = `<span class="badge bg-dark-green">${order.orderStatus ?? order.OrderStatus ?? 'N/A'}</span>`;
            row.insertCell(5).textContent = order.carName ?? order.CarName ?? 'N/A';
        });
    }


    // Hàm xử lý navigation
    function navigateTo(event, page) {
        event.preventDefault();
        if (page === 'homepage') {
            window.location.href = '../home/index.html';
        } else if (page === 'personal') {
            window.location.href = '../Profile/index.html';
        }
    }


    // Khởi tạo
    loadOrderHistory();
    showSection({ preventDefault: () => {} }, 'order-history');
});



