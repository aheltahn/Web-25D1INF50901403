const tempToken = localStorage.getItem('user');
let jsonToken, Token, UserId, userId;
try {
    if (!tempToken) {
        console.error('Không tìm thấy dữ liệu user trong localStorage');
        throw new Error('Không có dữ liệu user');
    }
    jsonToken = JSON.parse(tempToken);
    Token = jsonToken?.token;
    if (!Token) throw new Error('Token không tồn tại trong localStorage');
    
    // Kiểm tra userId từ token (JWT payload)
    const decoded = parseJwt(Token);
    UserId = decoded?.userId || jsonToken?.UserID; // Ưu tiên userId từ token
    if (!UserId) throw new Error('UserID không tồn tại');
    userId = UserId;
    console.log('Dữ liệu từ localStorage:', { userId, tokenExists: !!Token, decodedUserId: decoded?.userId });
    
    // Kiểm tra userId có phải admin không
    if (userId !== 1) {
        console.error('Tài khoản không phải admin:', { userId });
        throw new Error('Chỉ admin (UserID = 1) được phép truy cập');
    }
    
    // Cập nhật localStorage để đồng bộ
    jsonToken.UserID = userId;
    localStorage.setItem('user', JSON.stringify(jsonToken));
} catch (error) {
    console.error('Lỗi khi xử lý dữ liệu từ localStorage:', error);
    Token = null;
    UserId = null;
    userId = null;
    alert(error.message || 'Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại với tài khoản admin.');
    window.location.href = '../login/index.html';
}

function parseJwt(token) {
    if (!token) return null;
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
    console.log('=== DOMContentLoaded event triggered ===');
    console.log('Thời gian hiện tại:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const API_BASE_URL = 'https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api';

    // Function to check token validity
    // async function checkTokenValidity() {
    //     if (!Token) {
    //         console.error('Không tìm thấy token trong localStorage', { Token });
    //         return false;
    //     }
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/ViewAccount/${userId}`, {
    //             headers: { 'Authorization': `Bearer ${Token}` }
    //         });
    //         console.log(`Kiểm tra token - Status: ${response.status}, URL: ${API_BASE_URL}/ViewAccount/${userId}`);
    //         if (response.ok) {
    //             console.log('Token hợp lệ');
    //             return true;
    //         }
    //         const errorText = await response.text();
    //         console.error('Token không hợp lệ', { status: response.status, errorText });
    //         return false;
    //     } catch (error) {
    //         console.error('Lỗi khi kiểm tra token:', error);
    //         return false;
    //     }
    // }

    // Check admin access
    async function checkAdminAccess() {
        console.log('Kiểm tra quyền admin:', { userId });
        if (!userId || userId !== 1) {
            console.error('Truy cập bị từ chối: Không phải admin (userId !== 1)', { userId });
            alert('Bạn không có quyền truy cập trang này. Chỉ admin (UserID = 1) được phép.');
            window.location.href = '../login/index.html';
            return false;
        }

        // if (!(await checkTokenValidity())) {
        //     console.error('Token không hợp lệ hoặc hết hạn');
        //     alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại với tài khoản admin.');
        //     //localStorage.removeItem('user');
        //     //window.location.href = '../login/index.html';
        //     return false;
        // }

        return true;
    }

    // Function to format date
    function formatDate(dateString) {
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return 'N/A';
        }
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} ${date.toLocaleTimeString('vi-VN')}`;
    }

    // Elements
    const paymentTableBody = document.getElementById('paymentTableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const paginationContainer = document.getElementById('pagination');

    // Check DOM elements
    if (!paymentTableBody || !searchInput || !statusFilter || !itemsPerPageSelect || !prevPageButton || !nextPageButton || !paginationContainer) {
        console.error('Thiếu phần tử DOM cần thiết:', {
            paymentTableBody, searchInput, statusFilter, itemsPerPageSelect,
            prevPageButton, nextPageButton, paginationContainer
        });
        alert('Lỗi giao diện: Một số phần tử không được tìm thấy.');
        return;
    }

    // Pagination state
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value);
    let payments = [];

    // Fetch payments
    async function fetchPayments() {
        if (!(await checkAdminAccess())) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/AddPayment/GetPayments`, {
                headers: {
                    'Authorization': `Bearer ${Token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('API GetPayments trả về 401');
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại với tài khoản admin.');
                    //localStorage.removeItem('user');
                    //window.location.href = '../login/index.html';
                    return [];
                }
                const errorText = await response.text();
                throw new Error(`Lỗi API GetPayments: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('Dữ liệu thanh toán:', data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thanh toán:', error);
            alert(`Không thể tải danh sách thanh toán: ${error.message}`);
            return [];
        }
    }

    // Update payment status
    async function updatePaymentStatus(paymentID, newStatus) {
        if (!(await checkAdminAccess())) return false;
        try {
            const response = await fetch(`${API_BASE_URL}/AddPayment/Update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Token}`
                },
                body: JSON.stringify({
                    paymentID: parseInt(paymentID),
                    paymentStatus: newStatus
                })
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('API Update trả về 401');
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại với tài khoản admin.');
                    //localStorage.removeItem('user');
                    //window.location.href = '../login/index.html';
                    return false;
                }
                const errorText = await response.text();
                throw new Error(`Lỗi API Update: ${response.status} - ${errorText}`);
            }
            const message = await response.text();
            alert(message || 'Cập nhật trạng thái thành công.');
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            alert(`Không thể cập nhật trạng thái: ${error.message}`);
            return false;
        }
    }

    // Render payments table
    function renderPayments(filteredPayments) {
        paymentTableBody.innerHTML = '';
        if (!filteredPayments.length) {
            paymentTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Không có dữ liệu thanh toán.</td></tr>`;
            return;
        }
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedPayments = filteredPayments.slice(start, end);
        paginatedPayments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.paymentID || 'N/A'}</td>
                <td>${payment.orderID || 'N/A'}</td>
                <td>${payment.userID || 'N/A'}</td>
                <td>${formatDate(payment.paymentDate)}</td>
                <td>${payment.unit_Code || 'N/A'}</td>
                <td>${payment.paymentMethod || 'N/A'}</td>
                <td>
                    <select class="form-select status-select" data-payment-id="${payment.paymentID}">
                        <option value="Pending" ${payment.paymentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Completed" ${payment.paymentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Failed" ${payment.paymentStatus === 'Failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </td>
                <td>${payment.transactionCode || 'N/A'}</td>
            `;
            paymentTableBody.appendChild(row);
        });
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const paymentID = e.target.getAttribute('data-payment-id');
                const newStatus = e.target.value;
                const success = await updatePaymentStatus(paymentID, newStatus);
                if (!success) {
                    e.target.value = payments.find(p => p.paymentID === parseInt(paymentID))?.paymentStatus || 'Pending';
                } else {
                    const payment = payments.find(p => p.paymentID === parseInt(paymentID));
                    if (payment) payment.paymentStatus = newStatus;
                    renderPayments(filterPayments());
                }
            });
        });
        updatePagination(filteredPayments.length);
    }

    function filterPayments() {
        let filteredPayments = payments;
        const searchTerm = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;
        if (searchTerm) {
            filteredPayments = filteredPayments.filter(payment =>
                payment.transactionCode?.toLowerCase().includes(searchTerm)
            );
        }
        if (status !== 'all') {
            filteredPayments = filteredPayments.filter(payment =>
                payment.paymentStatus === status
            );
        }
        return filteredPayments;
    }

    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = `btn btn-custom-gray${i === currentPage ? ' active' : '-outline'}`;
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                renderPayments(filterPayments());
            });
            paginationContainer.appendChild(button);
        }
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    async function initializePage() {
        if (!(await checkAdminAccess())) return;
        payments = await fetchPayments();
        renderPayments(payments);
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderPayments(filterPayments());
        });
        statusFilter.addEventListener('change', () => {
            currentPage = 1;
            renderPayments(filterPayments());
        });
        itemsPerPageSelect.addEventListener('change', () => {
            itemsPerPage = parseInt(itemsPerPageSelect.value);
            currentPage = 1;
            renderPayments(filterPayments());
        });
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPayments(filterPayments());
            }
        });
        nextPageButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filterPayments().length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderPayments(filterPayments());
            }
        });
    }

    initializePage().catch(error => {
        console.error('Lỗi khi khởi tạo trang:', error);
        alert(`Có lỗi xảy ra khi tải trang: ${error.message}.`);
    });
});