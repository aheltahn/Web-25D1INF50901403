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
  const paymentTableBody = document.getElementById('paymentTableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const itemsPerPageSelect = document.getElementById('itemsPerPage');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const paginationContainer = document.getElementById('pagination');

  let payments = [];
  let filteredPayments = [];
  let currentPage = 1;
  let itemsPerPage = parseInt(itemsPerPageSelect.value);

  // Lấy token từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
      alert('Vui lòng đăng nhập lại!');
      window.location.href = '../path/to/login.html';
      return;
  }

  // Lấy danh sách thanh toán
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
              filteredPayments = [...payments];
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

  // Hiển thị danh sách thanh toán
  function displayPayments() {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedPayments = filteredPayments.slice(start, end);

      paymentTableBody.innerHTML = '';
      paginatedPayments.forEach(payment => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${payment.paymentID}</td>
              <td>${payment.orderID}</td>
              <td>${payment.userID}</td>
              <td>${new Date(payment.paymentDate).toLocaleString()}</td>
              <td>${payment.unit_Code}</td>
              <td>${payment.paymentMethod}</td>
              <td>
                  <select class="status-select custom-input text-white" data-payment-id="${payment.paymentID}">
                      <option value="Pending" ${payment.paymentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Completed" ${payment.paymentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                      <option value="Failed" ${payment.paymentStatus === 'Failed' ? 'selected' : ''}>Failed</option>
                  </select>
              </td>
              <td>${payment.transactionCode}</td>
          `;
          paymentTableBody.appendChild(row);
      });

      // Cập nhật phân trang
      updatePagination();

      // Thêm sự kiện cho các select để cập nhật trạng thái
      document.querySelectorAll('.status-select').forEach(select => {
          select.addEventListener('change', async function () {
              const paymentId = this.getAttribute('data-payment-id');
              const newStatus = this.value;
              await updatePaymentStatus(paymentId, newStatus);
          });
      });
  }

  // Cập nhật trạng thái thanh toán
  async function updatePaymentStatus(paymentId, newStatus) {
      try {
          const response = await fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/AddPayment/Update', {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${user.token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  paymentID: parseInt(paymentId),
                  paymentStatus: newStatus
              })
          });

          if (response.ok) {
              alert('Cập nhật trạng thái thanh toán thành công!');
              // Cập nhật danh sách payments
              const payment = payments.find(p => p.paymentID === parseInt(paymentId));
              if (payment) {
                  payment.paymentStatus = newStatus;
              }
              filteredPayments = [...payments];
              filterPayments();
          } else {
              const errorText = await response.text();
              alert(`Lỗi khi cập nhật trạng thái: ${response.status} - ${errorText}`);
          }
      } catch (error) {
          console.error('Lỗi khi cập nhật trạng thái:', error);
          alert('Không thể kết nối đến máy chủ!');
      }
  }

  // Lọc danh sách thanh toán
  function filterPayments() {
      const searchTerm = searchInput.value.toLowerCase();
      const status = statusFilter.value;

      filteredPayments = payments.filter(payment => {
          const matchesSearch = payment.transactionCode.toLowerCase().includes(searchTerm);
          const matchesStatus = status === 'all' || payment.paymentStatus === status;
          return matchesSearch && matchesStatus;
      });

      currentPage = 1; // Reset về trang đầu
      displayPayments();
  }

  // Cập nhật phân trang
  function updatePagination() {
      const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
      paginationContainer.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement('button');
          btn.className = `btn btn-custom-gray ${i === currentPage ? 'active' : ''}`;
          btn.textContent = i;
          btn.addEventListener('click', () => {
              currentPage = i;
              displayPayments();
          });
          paginationContainer.appendChild(btn);
      }

      prevPageBtn.disabled = currentPage === 1;
      nextPageBtn.disabled = currentPage === totalPages;
  }

  // Sự kiện tìm kiếm
  searchInput.addEventListener('input', filterPayments);

  // Sự kiện lọc trạng thái
  statusFilter.addEventListener('change', filterPayments);

  // Sự kiện thay đổi số lượng mục trên mỗi trang
  itemsPerPageSelect.addEventListener('change', () => {
      itemsPerPage = parseInt(itemsPerPageSelect.value);
      currentPage = 1;
      displayPayments();
  });

  // Sự kiện phân trang
  prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
          currentPage--;
          displayPayments();
      }
  });

  nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
      if (currentPage < totalPages) {
          currentPage++;
          displayPayments();
      }
  });

  // Khởi tạo
  fetchPayments();
});