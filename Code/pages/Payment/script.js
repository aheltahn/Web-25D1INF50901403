// Lấy token từ localStorage hoặc sessionStorage
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


// Lấy UserID từ localStorage/sessionStorage
function getUserId() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
        const userObj = JSON.parse(userStr);
        return userObj.UserID || null;
    } catch {
        return null;
    }
}


// Giải mã JWT để lấy thông tin phân quyền
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Không thể giải mã token:", e);
        return null;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    const userId = getUserId();


    if (!token || !userId) {
        alert('Vui lòng đăng nhập để tiếp tục thanh toán.');
        window.location.href = '../login/index.html';
        return;
    }


    const decoded = parseJwt(token);
    const role = decoded?.role || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const path = window.location.pathname.toLowerCase();


    if (role === "Admin" && path.includes("/home/")) {
        alert("Admin không được phép truy cập trang người dùng.");
        window.location.href = "../OrderManagement/index.html";
        return;
    }


    if (role === "User" && path.includes("/ordermanagement/")) {
        alert("Bạn không có quyền truy cập trang quản trị.");
        window.location.href = "../home/index.html";
        return;
    }


    // === Giao diện + API ===
    const API_BASE_URL = 'https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api';


    const transmissionElement = document.querySelector('.car-info .d-flex:nth-child(1) span:last-child');
    const engineCapacityElement = document.querySelector('.car-info .d-flex:nth-child(2) span:last-child');
    const colorElement = document.querySelector('.car-info .d-flex:nth-child(3) span:last-child');
    const categoryElement = document.querySelector('.car-info .d-flex:nth-child(4) span:last-child');
    const carTitleElement = document.querySelector('.header-line .text');
    const placeOrderButton = document.querySelector('#order-button');


    // Bỏ userInfoTable vì không hiển thị nữa
    // const userInfoTable = document.querySelector('#userInfoTable tbody');


    if (!transmissionElement || !engineCapacityElement || !colorElement || !categoryElement || !carTitleElement || !placeOrderButton) {
        alert('Lỗi giao diện: Một số phần tử không được tìm thấy.');
        return;
    }


    function formatCurrency(amount, unitCode = 'USD') {
        return new Intl.NumberFormat(unitCode === 'USD' ? 'en-US' : 'vi-VN', {
            style: 'currency',
            currency: unitCode
        }).format(amount);
    }


    async function checkApiConnection() {
        try {
            const res = await fetch(`${API_BASE_URL}/health`);
            return res.ok;
        } catch {
            return false;
        }
    }


    // Bỏ fetchUserInfo và updateUserInfoTable vì không dùng user info hiển thị


    async function fetchOrderDetails(orderId) {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
            alert("Phiên đăng nhập hết hạn.");
            window.location.href = '../login/index.html';
            return null;
        }
        return await res.json();
    }


    function updateOrderDetailsUI(orderDetails) {
        carTitleElement.textContent = orderDetails.carDetails.carName || 'N/A';
        transmissionElement.textContent = orderDetails.carDetails.transmission || 'N/A';
        engineCapacityElement.textContent = `${orderDetails.carDetails.engineCapacity || 'N/A'} L`;
        colorElement.textContent = orderDetails.carDetails.color || 'N/A';
        categoryElement.textContent = orderDetails.carDetails.categoryName || 'N/A';


        // Update payment options labels
        const depositLabel = document.querySelector('label[for="deposit"]');
        const unitLabel = document.querySelector('label[for="Unit"]');


        if (depositLabel) {
            depositLabel.textContent = `Deposit required (20%) - ${formatCurrency(orderDetails.deposit, orderDetails.unitCode)}`;
        }
        if (unitLabel) {
            unitLabel.textContent = `Unit price - ${formatCurrency(orderDetails.totalPrice, orderDetails.unitCode)}`;
        }
    }


    async function processPayment(orderId, method) {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/AddPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                OrderID: orderId,
                PaymentMethod: method,
                TransactionCode: `TX${Math.floor(10000 + Math.random() * 90000)}`
            })
        });
        if (res.status === 401) {
            alert("Phiên đăng nhập hết hạn.");
            window.location.href = '../login/index.html';
            return;
        }
        if (!res.ok) {
            alert(`Lỗi khi chọn phương thức thanh toán: ${res.status}`);
            return;
        }


        alert('Chọn Phương Thức Thanh Toán Thành Công!');
        localStorage.removeItem('currentOrder');
        window.location.href = '../home/index.html';
    }


    async function initializePage() {
        const orderDetails = JSON.parse(localStorage.getItem('currentOrder'));
        if (!orderDetails || !orderDetails.orderId) {
            alert("Không tìm thấy đơn hàng.");
            window.location.href = '../Car Details Page/index.html';
            return;
        }


        const apiOrderDetails = await fetchOrderDetails(orderDetails.orderId);
        if (!apiOrderDetails) return;


        // Không fetch user info, bỏ updateUserInfoTable


        updateOrderDetailsUI(orderDetails);


        placeOrderButton.addEventListener('click', () => {
            const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
            if (!method) {
                alert("Vui lòng chọn phương thức thanh toán.");
                return;
            }
            processPayment(orderDetails.orderId, method);
        });
    }


    initializePage().catch(err => {
        console.error("Lỗi khởi tạo:", err);
        alert("Không thể tải trang.");
    });
});



