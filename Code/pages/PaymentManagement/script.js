const select = document.getElementById('statusSelect');

  function updateSelectColor() {
    select.classList.remove('bg-info', 'bg-success', 'bg-danger');
    const value = select.value;

    if (value === 'pending') {
      select.classList.add('bg-info');
    } else if (value === 'completed') {
      select.classList.add('bg-success');
    } else if (value === 'failed') {
      select.classList.add('bg-danger');
    }
  }

  // Khởi tạo màu nền khi trang tải
  updateSelectColor();

  // Lắng nghe sự kiện thay đổi
  select.addEventListener('change', updateSelectColor);