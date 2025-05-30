// Hàm chuyển đổi giữa các tab
function showSection(event, sectionId) {
    if (event) event.preventDefault();
    const sections = document.querySelectorAll('.section-content');
    const tabs = document.querySelectorAll('.nav-links .nav-link');

    sections.forEach(section => section.classList.remove('active'));
    tabs.forEach(tab => tab.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    const targetTab = document.querySelector(`.nav-links [data-section="${sectionId}"]`);
    if (targetSection) targetSection.classList.add('active');
    if (targetTab) targetTab.classList.add('active');
}

// Hàm hiển thị thông báo
function showSuccessMessage(message, isError = false) {
    const successOverlay = document.getElementById('success-overlay');
    const successMessage = successOverlay.querySelector('.success-message p');
    successMessage.textContent = message;
    successOverlay.classList.remove('d-none');
    if (isError) {
        successOverlay.style.backgroundColor = '#f8d7da'; // Màu đỏ nhạt cho lỗi
    } else {
        successOverlay.style.backgroundColor = '#d4edda'; // Màu xanh nhạt cho thành công
    }
    setTimeout(() => {
        successOverlay.classList.add('d-none');
        successOverlay.style.backgroundColor = ''; // Reset màu
    }, 3000);
}

// Hàm hiển thị lỗi cho input
function showError(elementId, message) {
    const input = document.getElementById(elementId);
    const errorElement = document.getElementById(`${elementId}-error`);
    if (input) input.classList.add('is-invalid');
    if (errorElement) errorElement.textContent = message;
}

// Hàm xóa lỗi trong form
function clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) errorElement.textContent = '';
    });
}

// Hàm validate thông tin cá nhân
function validatePersonalInfo() {
    let isValid = true;
    clearErrors('personalInfoForm');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!name) {
        showError('name', 'Full name is required.');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        showError('name', 'Full name can only contain letters and spaces.');
        isValid = false;
    }

    if (!email) {
        showError('email', 'Email is required.');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid email address.');
        isValid = false;
    }

    if (phone && !/^\+?\d{10,15}$/.test(phone)) {
        showError('phone', 'Please enter a valid phone number (10-15 digits).');
        isValid = false;
    }

    if (address && !/^[a-zA-Z0-9\s,.\-]+$/.test(address)) {
        showError('address', 'Address contains invalid characters.');
        isValid = false;
    }

    return isValid;
}

// Hàm validate đổi mật khẩu
function validateAccountSettings() {
    let isValid = true;
    clearErrors('accountSettingsForm');

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword) {
        showError('current-password', 'Current password is required.');
        isValid = false;
    }
    if (!newPassword) {
        showError('new-password', 'New password is required.');
        isValid = false;
    } else if (newPassword.length < 8) {
        showError('new-password', 'New password must be at least 8 characters long.');
        isValid = false;
    }
    if (!confirmPassword) {
        showError('confirm-password', 'Please confirm your new password.');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showError('confirm-password', 'Passwords do not match.');
        isValid = false;
    }
    return isValid;
}

// Hàm lấy token từ localStorage hoặc sessionStorage
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

// Hàm lấy thông tin tài khoản từ API
function loadAccountInfo(userId) {
    const token = getToken();
    fetch(`https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/ViewAccount/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Role': 'User'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        console.log('Dữ liệu tài khoản:', data);
        document.getElementById('name').value = data.name || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('phone').value = data.phoneNumber || '';
        document.getElementById('email').value = data.email || '';
    })
    .catch(error => {
        console.error('Lỗi khi gọi API ViewAccount:', error);
        showSuccessMessage('Không thể tải thông tin tài khoản. Vui lòng thử lại.', true);
    });
}

// Hàm cập nhật thông tin tài khoản
function updateAccountInfo(userId) {
    if (!validatePersonalInfo()) return;

    const token = getToken();
    if (!token) {
        showSuccessMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', true);
        window.location.href = '../login/index.html';
        return;
    }

    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    fetch(`https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/EditAccount/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Role': 'Admin'
        },
        body: JSON.stringify({
            name,
            address,
            phoneNumber: phone,
            email
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                let errorMsg = text || response.statusText;
                throw new Error(errorMsg);
            });
        }
        if (response.status === 204) {
            return null;
        }
        return response.json();
    })
    .then(data => {
        showSuccessMessage('Cập nhật thông tin tài khoản thành công!');
    })
    .catch(error => {
        console.error('Lỗi khi gọi API EditAccount:', error);
        showSuccessMessage(`Lỗi: ${error.message}`, true);
    });
}

// Hàm đổi mật khẩu
function changePassword(userId) {
    if (!validateAccountSettings()) return;

    const token = getToken();
    if (!token) {
        showSuccessMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', true);
        window.location.href = '../login/index.html';
        return;
    }

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;

    console.log('Calling ChangePassword API with:', { userId, token, body: { OldPassword: currentPassword, NewPassword: newPassword } });

    fetch(`https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/ChangePassword/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            OldPassword: currentPassword,
            NewPassword: newPassword
        })
    })
    .then(async response => {
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                errorMessage = JSON.parse(errorText).message || `Lỗi API: ${response.status}`;
            } catch {
                errorMessage = errorText || `Lỗi API: ${response.status}`;
            }
            if (response.status === 400 && errorMessage.includes('Old password')) {
                errorMessage = 'Mật khẩu hiện tại không đúng.';
            } else if (response.status === 404) {
                errorMessage = 'Người dùng không tồn tại.';
            }
            throw new Error(errorMessage);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : { message: "Password changed successfully." };
    })
    .then(data => {
        showSuccessMessage(data.message);
        document.getElementById('accountSettingsForm').reset();
    })
    .catch(error => {
        console.error('Lỗi khi gọi API ChangePassword:', error);
        showSuccessMessage(`Lỗi: ${error.message}`, true);
    });
}

// Hàm xử lý navigation
function navigateTo(event, page) {
    event.preventDefault();
    if (page === 'homepage') {
        alert('Navigating to Homepage (simulated)');
    } else if (page === 'profile') {
        alert('Navigating to Profile (simulated)');
    }
}

// Sự kiện khi DOM được tải
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    let userId = null;
    if (userStr) {
        try {
            const userObj = JSON.parse(userStr);
            userId = userObj.UserID || null;
        } catch {
            userId = null;
        }
    }
    if (!userId) {
        alert('Bạn chưa đăng nhập hoặc phiên đăng nhập hết hạn.');
        window.location.href = '../login/index.html';
        return;
    }

    console.log('UserID:', userId);
    showSection(null, 'personal-info');
    loadAccountInfo(userId);

    const notificationBell = document.querySelector('.notification-bell a');
    if (notificationBell) {
        notificationBell.addEventListener('click', () => {
            simulatedUnreadCount = 0;
            updateUnreadCount();
        });
    }

    const saveChangesButton = document.getElementById('save-changes-button');
    if (saveChangesButton) {
        saveChangesButton.addEventListener('click', () => {
            updateAccountInfo(userId);
        });
    }

    const changePasswordButton = document.getElementById('change-password-button');
    if (changePasswordButton) {
        changePasswordButton.addEventListener('click', () => {
            changePassword(userId);
        });
    }

    updateUnreadCount();
});