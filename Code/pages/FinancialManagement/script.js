document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");

    // Dữ liệu thanh toán mẫu
    const paymentData = [
        {
            PaymentID: "PAY001",
            OrderID: "ORD001",
            PaymentDate: "2025-05-01",
            Unit_Code: "CAR001",
            PaymentMethod: "Credit Card",
            PaymentStatus: "Completed",
            TransactionCode: "TXN123456",
            UserID: "USR001",
            Amount: 25000
        },
        {
            PaymentID: "PAY002",
            OrderID: "ORD002",
            PaymentDate: "2025-05-15",
            Unit_Code: "CAR002",
            PaymentMethod: "Bank Transfer",
            PaymentStatus: "Pending",
            TransactionCode: "TXN123457",
            UserID: "USR002",
            Amount: 30500
        },
        {
            PaymentID: "PAY003",
            OrderID: "ORD003",
            PaymentDate: "2025-05-20",
            Unit_Code: "CAR003",
            PaymentMethod: "PayPal",
            PaymentStatus: "Completed",
            TransactionCode: "TXN123458",
            UserID: "USR003",
            Amount: 60000
        },
        {
            PaymentID: "PAY004",
            OrderID: "ORD004",
            PaymentDate: "2025-05-22",
            Unit_Code: "CAR004",
            PaymentMethod: "Credit Card",
            PaymentStatus: "Failed",
            TransactionCode: "TXN123459",
            UserID: "USR001",
            Amount: 45000
        }
    ];

    // Khởi tạo DataTables
    const table = $("#paymentTable").DataTable({
        data: paymentData,
        columns: [
            { data: "PaymentID" },
            { data: "OrderID" },
            { data: "PaymentDate" },
            { data: "Unit_Code" },
            { data: "PaymentMethod" },
            { data: "PaymentStatus" },
            { data: "TransactionCode" },
            { data: "UserID" },
            { data: "Amount" }
        ],
        pageLength: 5,
        lengthMenu: [5, 10, 15],
        searching: true,
        lengthChange: true,
        info: false, // Tắt thông tin "Showing 1 to 4 of 4 entries"
        paging: true,
        order: [[2, "desc"]], // Sắp xếp theo PaymentDate giảm dần
        language: {
            emptyTable: "No payment data available"
        }
    });

    // Custom Search
    $("#customSearch").on("keyup", function () {
        table.search(this.value).draw();
        renderCustomPagination(table);
    });

    // Custom Show Entries
    $("#customLength").on("change", function () {
        table.page.len(this.value).draw();
        renderCustomPagination(table);
    });

    // Custom Pagination Rendering
    function renderCustomPagination(table) {
        const pageInfo = table.page.info();
        let html = '';
        for (let i = 0; i < pageInfo.pages; i++) {
            html += `<button class="btn ${i === pageInfo.page ? 'btn-custom-gray active' : 'btn-custom-gray-outline'}" data-page="${i}">${i + 1}</button>`;
        }
        $("#customPagination").html(html);

        // Cập nhật trạng thái nút Previous/Next
        $("#prevPage").toggleClass("disabled", pageInfo.page === 0);
        $("#nextPage").toggleClass("disabled", pageInfo.page === pageInfo.pages - 1);
    }

    // Initial pagination
    renderCustomPagination(table);

    // Pagination controls
    $("#customPagination").on("click", "button", function () {
        const page = $(this).data("page");
        table.page(page).draw("page");
        renderCustomPagination(table);
    });

    $("#prevPage").on("click", function () {
        if (!$(this).hasClass("disabled")) {
            table.page("previous").draw("page");
            renderCustomPagination(table);
        }
    });

    $("#nextPage").on("click", function () {
        if (!$(this).hasClass("disabled")) {
            table.page("next").draw("page");
            renderCustomPagination(table);
        }
    });

    // Lọc trạng thái
    $("#statusFilter").on("change", function () {
        const status = $(this).val();
        if (status === "all") {
            table.column(5).search("").draw();
        } else {
            table.column(5).search(status).draw();
        }
        renderCustomPagination(table);
    });

    // Tính tổng thu
    const totalRevenue = paymentData
        .filter(payment => payment.PaymentStatus === "Completed")
        .reduce((sum, payment) => sum + payment.Amount, 0);

    document.getElementById("totalRevenue").textContent = `Total Revenue: $${totalRevenue.toLocaleString("en-US")}`;

    console.log("DataTable initialized");
});