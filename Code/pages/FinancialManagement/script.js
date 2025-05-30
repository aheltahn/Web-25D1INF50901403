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

document.addEventListener('DOMContentLoaded', function () {
    const tableBody = $('#paymentTable').DataTable();
    const searchInput = document.getElementById('customSearch');
    const lengthSelect = document.getElementById('customLength');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const paginationContainer = document.getElementById('customPagination');
    const totalRevenueDiv = document.getElementById('totalRevenue');

    let payments = [];
    let currentPage = 1;

    // Lấy token từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        alert('Vui lòng đăng nhập lại!');
        window.location.href = '../path/to/login.html';
        return;
    }

    // Lấy dữ liệu báo cáo bán hàng
    async function fetchSalesReport() {
        try {
            const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/SalesReport/GetSalesReport', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const report = await response.json();
                console.log('Báo cáo bán hàng:', report);

                // Hiển thị tổng doanh thu
                totalRevenueDiv.textContent = `Total Revenue: $${report.totalRevenue.toLocaleString()}`;

                // Lấy danh sách chi tiết thanh toán
                await fetchPayments();
            } else {
                const errorText = await response.text();
                alert(`Lỗi khi lấy báo cáo bán hàng: ${response.status} - ${errorText}`);
                totalRevenueDiv.textContent = 'Total Revenue: Error';
            }
        } catch (error) {
            console.error('Lỗi khi gọi API báo cáo:', error);
            alert('Không thể kết nối đến máy chủ!');
            totalRevenueDiv.textContent = 'Total Revenue: Error';
        }
    }

    // Lấy danh sách chi tiết thanh toán
    async function fetchPayments() {
        try {
            const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/AddPayment/GetPayments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                payments = await response.json();
                console.log('Danh sách thanh toán:', payments);
                displayPayments();
            } else {
                const errorText = await response.text();
                alert(`Lỗi khi lấy dữ liệu thanh toán: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API thanh toán:', error);
            alert('Không thể kết nối đến máy chủ!');
        }
    }

    // Hiển thị danh sách thanh toán với DataTables
    function displayPayments() {
        tableBody.clear();

        payments.forEach(payment => {
            tableBody.row.add([
                payment.paymentID,
                payment.orderID,
                new Date(payment.paymentDate).toLocaleString(),
                payment.unit_Code,
                payment.paymentMethod,
                payment.paymentStatus,
                payment.transactionCode,
                payment.userID,
                payment.amount || 'N/A' // Trường amount không có trong API, để N/A
            ]);
        });

        tableBody.draw();
        updateCustomPagination();
    }

    // Cập nhật phân trang tùy chỉnh
    function updateCustomPagination() {
        const info = tableBody.page.info();
        currentPage = info.page + 1;
        const totalPages = info.pages;

        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `btn btn-custom-gray ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                tableBody.page(i - 1).draw(false);
                updateCustomPagination();
            });
            paginationContainer.appendChild(btn);
        }

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // Khởi tạo DataTables
    $('#paymentTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        lengthChange: false,
        pageLength: parseInt(lengthSelect.value),
        language: {
            emptyTable: "No data available"
        }
    });

    // Tích hợp tìm kiếm tùy chỉnh
    searchInput.addEventListener('input', function () {
        tableBody.search(this.value).draw();
        updateCustomPagination();
    });

    // Tích hợp thay đổi số lượng mục trên mỗi trang
    lengthSelect.addEventListener('change', function () {
        tableBody.page.len(parseInt(this.value)).draw();
        updateCustomPagination();
    });

    // Nút Previous
    prevPageBtn.addEventListener('click', function () {
        tableBody.page('previous').draw(false);
        updateCustomPagination();
    });

    // Nút Next
    nextPageBtn.addEventListener('click', function () {
        tableBody.page('next').draw(false);
        updateCustomPagination();
    });

    // Khởi tạo
    fetchSalesReport();
});