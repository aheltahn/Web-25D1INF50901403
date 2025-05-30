document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOMContentLoaded được kích hoạt ===');
    console.log('Thời gian hiện tại:', new Date().toLocaleString('vi-VN', { timeZone: 'UTC' }));

    const API_BASE_URL = 'https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api';

    // Kiểm tra và lấy dữ liệu localStorage
    let userData = {};
    let userId = null;
    let token = null;
    try {
        const rawUserData = localStorage.getItem('user');
        console.log('Dữ liệu thô từ localStorage.getItem("user"):', rawUserData);
        userData = JSON.parse(rawUserData) || {};
        console.log('Dữ liệu parsed từ localStorage:', userData);
        userId = userData.UserID;
        token = userData.token;
    } catch (error) {
        console.error('Lỗi khi parse dữ liệu từ localStorage:', error.message);
        userData = {};
    }

    console.log('token:', token ? 'Có token' : 'Không có token');
    console.log('userId:', userId ? `ID: ${userId}` : 'Không có userId');

    // Nếu không có token hoặc userId, chuyển hướng đến trang đăng nhập
    if (!token || !userId) {
        console.error('Thiếu token hoặc userId, chuyển hướng đến trang đăng nhập');
        alert('Vui lòng đăng nhập để xem thông báo');
        localStorage.removeItem('user');
        window.location.href = '../login/index.html';
        return;
    }

    function showSection(event, sectionId) {
        event.preventDefault();
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
    }

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

    function updateUnreadCount() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const unreadCountElement = document.getElementById('unreadCount');
        
        
        console.log('Cập nhật số lượng thông báo chưa đọc:', unreadCount);
        unreadCountElement.textContent = unreadCount;
        
    }

    function toggleNotification(notificationItem, notificationId) {
        console.log('toggleNotification được gọi với notificationId:', notificationId);
        
        if (!notificationItem) {
            console.error('Không tìm thấy .notification-item');
            return;
        }

        const content = notificationItem.querySelector('.notification-content');
        if (!content) {
            console.error('Không tìm thấy .notification-content trong notification-item');
            return;
        }

        // Toggle hiển thị nội dung bằng cách thêm/xóa class 'show'
        const isVisible = content.classList.contains('show');
        console.log('Trạng thái hiển thị trước khi toggle:', isVisible ? 'show' : 'hidden');
        content.classList.toggle('show');
        console.log('Trạng thái hiển thị sau khi toggle:', content.classList.contains('show') ? 'show' : 'hidden');

        // Đánh dấu thông báo là đã đọc khi nhấp vào (nếu chưa đọc)
        if (notificationItem.classList.contains('unread')) {
            console.log('Đánh dấu thông báo', notificationId, 'là đã đọc');
            notificationItem.classList.remove('unread');
            updateUnreadCount(); // Cập nhật số lượng thông báo chưa đọc

            // Kiểm tra notificationId hợp lệ
            if (!notificationId || isNaN(notificationId)) {
                console.error('notificationId không hợp lệ:', notificationId);
                alert('Không thể đánh dấu thông báo là đã đọc: ID không hợp lệ.');
                notificationItem.classList.add('unread'); // Hoàn tác
                updateUnreadCount();
                return;
            }

            // Gọi API để đánh dấu thông báo là đã đọc
            fetch(`${API_BASE_URL}/Notification/MarkAsRead/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Thêm body rỗng
            })
            .then(async response => {
                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 401) {
                        console.error('API MarkAsRead trả về lỗi 401:', errorText);
                        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                        localStorage.removeItem('user');
                        window.location.href = '../login/index.html';
                        return;
                    }
                    throw new Error(`Lỗi khi đánh dấu thông báo ${notificationId} là đã đọc: ${response.status} - ${response.statusText}. Chi tiết: ${errorText}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('API MarkAsRead phản hồi:', data);
                if (data !== 'Notification marked as read.') {
                    console.warn('Phản hồi API không như mong đợi:', data);
                }
            })
            .catch(error => {
                console.error('Lỗi khi gọi API MarkAsRead:', error.message);
                notificationItem.classList.add('unread'); // Hoàn tác thay đổi UI
                updateUnreadCount();
                alert(`Không thể đánh dấu thông báo là đã đọc: ${error.message}`);
            });
        } else {
            console.log('Thông báo', notificationId, 'đã được đọc trước đó, không gọi API MarkAsRead');
        }
    }

    // Gọi API và hiển thị danh sách thông báo
    async function fetchNotifications() {
        const notificationList = document.querySelector('.notification-list');
        
        if (!notificationList) {
            console.error("Không tìm thấy phần tử .notification-list");
            alert('Lỗi giao diện: Không tìm thấy danh sách thông báo.');
            return;
        }

        notificationList.innerHTML = '<div class="text-center">Đang tải thông báo...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/Notification/User/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('API Notification/User trả về lỗi 401');
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('user');
                    window.location.href = '../login/index.html';
                    return;
                }
                throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Dữ liệu thông báo từ API:', data);
            notificationList.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                notificationList.innerHTML = '<div class="text-center">Không có thông báo nào.</div>';
                return;
            }

            data.forEach(notification => {
                const isUnread = !notification.isRead;
                const notificationHtml = `
                    <div class="notification-item ${isUnread ? 'unread' : ''} mb-3" data-notification-id="${notification.notificationID}">
                        <p class="mb-1 notification-title">
                            <strong>${notification.title || 'N/A'}</strong>
                        </p>
                        <div class="notification-content">
                            <p class="mb-1">${notification.content || 'N/A'}</p>
                            <small>${notification.sentDate ? formatDate(notification.sentDate) : 'N/A'}</small>
                        </div>
                    </div>
                `;
                notificationList.innerHTML += notificationHtml;
            });

            // Thêm sự kiện click bằng event delegation
            notificationList.addEventListener('click', (event) => {
                const title = event.target.closest('.notification-title');
                if (title) {
                    const notificationItem = title.closest('.notification-item');
                    const notificationId = parseInt(notificationItem.dataset.notificationId);
                    if (!isNaN(notificationId)) {
                        toggleNotification(notificationItem, notificationId);
                    } else {
                        console.error('notificationId không hợp lệ:', notificationItem.dataset.notificationId);
                    }
                }
            });

            updateUnreadCount(); // Cập nhật số lượng thông báo chưa đọc
        } catch (error) {
            console.error('Lỗi khi gọi API thông báo:', error.message);
            notificationList.innerHTML = `
                <div class="text-center text-danger">Không thể tải thông báo: ${error.message}</div>
            `;
            alert(`Không thể tải thông báo: ${error.message}`);
        }
    }

    // Hiển thị section "Notification" và tải thông báo khi trang tải
    showSection({ preventDefault: function() {} }, 'notification');
    fetchNotifications();
});