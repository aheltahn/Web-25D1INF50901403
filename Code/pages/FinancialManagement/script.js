document.addEventListener('DOMContentLoaded', function () {
    const logOutBtn = document.getElementsByName('logOutBtn')[0];
    window.addEventListener('storage', function (e) {
        if (e.key === 'logout-event') {
            localStorage.removeItem('user');
            window.location.href = '../login/index.html';
        }
    });
    if (logOutBtn) {
        logOutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.setItem('logout-event', Date.now());
            window.location.href = '../login/index.html';
        });
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('customSearch');
    const lengthSelect = document.getElementById('customLength');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const paginationContainer = document.getElementById('customPagination');
    const totalRevenueDiv = document.getElementById('totalRevenue');


    let payments = [];
    let currentPage = 1;
    let table;


    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        alert('Vui lòng đăng nhập lại!');
        window.location.href = '../path/to/login.html';
        return;
    }


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


                // Hiển thị thông tin
                totalRevenueDiv.textContent = `Total Revenue: $${report.totalRevenue.toLocaleString()}`;
                document.getElementById('totalOrders').textContent = report.totalOrders;
                document.getElementById('completedOrders').textContent = report.completedOrders;
                document.getElementById('canceledOrders').textContent = report.canceledOrders;
                document.getElementById('completionRate').textContent = report.completionRate.toFixed(2);
                document.getElementById('cancellationRate').textContent = report.cancellationRate.toFixed(2);
                document.getElementById('topCar').textContent = `${report.topSellingCar.carName} (${report.topSellingCar.quantitySold})`;


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
                renderDataTable();
            } else {
                const errorText = await response.text();
                alert(`Lỗi khi lấy dữ liệu thanh toán: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API thanh toán:', error);
            alert('Không thể kết nối đến máy chủ!');
        }
    }


    function renderDataTable() {
        if ($.fn.DataTable.isDataTable('#paymentTable')) {
            table.clear().rows.add(payments.map(payment => ([
                payment.paymentID,
                payment.orderID,
                new Date(payment.paymentDate).toLocaleString(),
                payment.unit_Code,
                payment.paymentMethod,
                payment.paymentStatus,
                payment.transactionCode,
                payment.userID,
                payment.amount || 'N/A'
            ]))).draw();
        } else {
            table = $('#paymentTable').DataTable({
                data: payments.map(payment => ([
                    payment.paymentID,
                    payment.orderID,
                    new Date(payment.paymentDate).toLocaleString(),
                    payment.unit_Code,
                    payment.paymentMethod,
                    payment.paymentStatus,
                    payment.transactionCode,
                    payment.userID,
                    payment.amount || 'N/A'
                ])),
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                lengthChange: false,
                pageLength: parseInt(lengthSelect?.value) || 5,
                language: {
                    emptyTable: "No data available"
                }
            });
        }
        updateCustomPagination();
    }


    function updateCustomPagination() {
        const info = table.page.info();
        currentPage = info.page + 1;
        const totalPages = info.pages;


        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `btn btn-custom-gray ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                table.page(i - 1).draw(false);
                updateCustomPagination();
            });
            paginationContainer.appendChild(btn);
        }


        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }


    searchInput?.addEventListener('input', function () {
        table.search(this.value).draw();
        updateCustomPagination();
    });


    lengthSelect?.addEventListener('change', function () {
        table.page.len(parseInt(this.value)).draw();
        updateCustomPagination();
    });


    prevPageBtn?.addEventListener('click', function () {
        table.page('previous').draw(false);
        updateCustomPagination();
    });


    nextPageBtn?.addEventListener('click', function () {
        table.page('next').draw(false);
        updateCustomPagination();
    });


    fetchSalesReport();
});



