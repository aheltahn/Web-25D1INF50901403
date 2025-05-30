

// Hàm cập nhật số lượng thông báo chưa đọc
function updateUnreadCount() {
    const bellUnreadCount = document.getElementById('bellUnreadCount');
    if (bellUnreadCount) {
        bellUnreadCount.textContent = simulatedUnreadCount > 0 ? simulatedUnreadCount : '';
    } else {
        console.warn('Không tìm thấy phần tử #bellUnreadCount trong HTML');
    }
}

// Hàm điều hướng
function navigateTo(event, page) {
    event.preventDefault();
    if (page === 'home') {
        window.location.href = '../home/index.html';
    }
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

document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api';
    const carStatusElement = document.getElementById('car-status');
    const orderButton = document.getElementById('order-button');

    // Kiểm tra phần tử HTML
    if (!carStatusElement) {
        console.warn('Không tìm thấy phần tử #car-status trong HTML');
    }
    if (!orderButton) {
        console.error('Không tìm thấy phần tử #order-button trong HTML. Vui lòng kiểm tra ID trong HTML.');
        return;
    }

    console.log('=== BẮT ĐẦU TẢI TRANG CAR DETAILS ===');
    console.log('orderButton:', orderButton);
    console.log('orderButton tag:', orderButton.tagName.toLowerCase());
    console.log('orderButton initial disabled:', orderButton.disabled);
    console.log('orderButton classes:', orderButton.className);

    // Lấy user data từ localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const token = userData.token;
    const userId = userData.UserID || userData.userID;
    console.log('userData:', userData);
    console.log('token:', token ? 'Có token' : 'Không có token');
    console.log('userId:', userId);

    // Lấy carId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    console.log('carId:', carId);

    // Kiểm tra xem carId có tồn tại không
    if (!carId) {
        console.error('Không tìm thấy carModelID trong URL');
        const carTitle = document.querySelector('.title-highlight');
        if (carTitle) {
            carTitle.textContent = 'Lỗi: Không tìm thấy ID xe';
        } else {
            console.warn('Không tìm thấy phần tử .title-highlight trong HTML');
        }
        const priceElement = document.querySelector('.h4.fw-bold.text-primary');
        if (priceElement) {
            priceElement.textContent = 'N/A';
        } else {
            console.warn('Không tìm thấy phần tử .h4.fw-bold.text-primary trong HTML');
        }
        orderButton.disabled = true;
        orderButton.classList.add('disabled');
        orderButton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Không thể đặt hàng do thiếu ID xe.');
        });
        return;
    }

    // Gọi API CarDetail
    fetch(`${API_BASE_URL}/CarDetail/${carId}`, {
        headers: {
            'Authorization': `Bearer ${token || ''}`
        }
    })
        .then(response => {
            console.log('Phản hồi API CarDetail:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Lỗi API CarDetail: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Dữ liệu từ API CarDetail:', data);

            // Kiểm tra dữ liệu trả về
            if (!data || typeof data !== 'object') {
                throw new Error('Dữ liệu trả về từ API CarDetail không hợp lệ');
            }

            // Cập nhật giao diện
            const carTitle = document.querySelector('.title-highlight');
            if (carTitle) {
                carTitle.textContent = data.carName || 'N/A';
            } else {
                console.warn('Không tìm thấy phần tử .title-highlight trong HTML');
            }

            const priceElement = document.querySelector('.h4.fw-bold.text-primary');
            if (priceElement) {
                priceElement.textContent = formatCurrency(data.unitPrice, 'USD');
            } else {
                console.warn('Không tìm thấy phần tử .h4.fw-bold.text-primary trong HTML');
            }

            const carInfoElements = document.querySelectorAll('.car-info .d-flex');
            if (carInfoElements.length >= 10) {
                carInfoElements[0].querySelector('span:last-child').textContent = data.carName || 'N/A';
                carInfoElements[1].querySelector('span:last-child').textContent = data.year || 'N/A';
                carInfoElements[2].querySelector('span:last-child').textContent = data.brandName || 'N/A';
                carInfoElements[3].querySelector('span:last-child').textContent = data.model || 'N/A';
                carInfoElements[4].querySelector('span:last-child').textContent = data.fuelType || 'N/A';
                carInfoElements[5].querySelector('span:last-child').textContent = data.transmission || 'N/A';
                carInfoElements[6].querySelector('span:last-child').textContent = data.engineCapacity ? `${data.engineCapacity} L` : 'N/A';
                carInfoElements[7].querySelector('span:last-child').textContent = data.color || 'N/A';
                carInfoElements[8].querySelector('span:last-child').textContent = data.categoryName || 'N/A';
                carInfoElements[9].querySelector('span:last-child').textContent = data.statusName || 'N/A';
            } else {
                console.warn('Không đủ phần tử .car-info .d-flex trong HTML, cần ít nhất 10 phần tử');
            }

            // Cập nhật trạng thái nút Place Order
            const carStatus = data.statusName ? data.statusName.toLowerCase() : '';
            console.log('carStatus:', carStatus);
            if (carStatus === 'unavailable') {
                console.log('Nút Place Order bị vô hiệu hóa do xe không khả dụng');
                orderButton.disabled = true;
                orderButton.classList.add('disabled');
                orderButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Xe không khả dụng để đặt hàng.');
                });
            } else {
                console.log('Nút Place Order được kích hoạt');
                orderButton.disabled = false;
                orderButton.classList.remove('disabled');
                const placeOrderUrl = `../PlaceOrder/index.html?carModelId=${data.carModelID}`;
                if (orderButton.tagName.toLowerCase() === 'a') {
                    orderButton.href = placeOrderUrl;
                    orderButton.addEventListener('click', (e) => {
                        console.log('Nút Place Order (a) được nhấn, chuyển hướng đến:', placeOrderUrl);
                    });
                } else {
                    orderButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('Nút Place Order (button) được nhấn, chuyển hướng đến:', placeOrderUrl);
                        window.location.href = placeOrderUrl;
                    });
                }
                // Lưu carDetails vào localStorage
                localStorage.setItem('carDetails', JSON.stringify(data));
            }

            // Cập nhật hình ảnh chính
            const mainImage = document.querySelector('.ecommerce-gallery-main-img');
            if (mainImage && data.imageURL) {
                mainImage.src = data.imageURL;
                mainImage.alt = data.carName || 'Main Truck';
            } else {
                console.warn('Không tìm thấy phần tử .ecommerce-gallery-main-img hoặc imageURL không tồn tại');
            }

            // Cập nhật hình ảnh trong carousel
            const carouselItems = document.querySelectorAll('.multi-carousel-item img');
            if (carouselItems.length > 0 && data.imageURL) {
                carouselItems[0].src = data.imageURL;
            } else {
                console.warn('Không tìm thấy phần tử .multi-carousel-item img hoặc imageURL không tồn tại');
            }
        })
        .catch(error => {
            console.error('Lỗi khi gọi API CarDetail:', error);
            const carTitle = document.querySelector('.title-highlight');
            if (carTitle) {
                carTitle.textContent = 'Lỗi tải dữ liệu';
            } else {
                console.warn('Không tìm thấy phần tử .title-highlight trong HTML');
            }
            const priceElement = document.querySelector('.h4.fw-bold.text-primary');
            if (priceElement) {
                priceElement.textContent = 'N/A';
            } else {
                console.warn('Không tìm thấy phần tử .h4.fw-bold.text-primary trong HTML');
            }
            orderButton.disabled = true;
            orderButton.classList.add('disabled');
            orderButton.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Không thể tải dữ liệu xe. Vui lòng thử lại sau.');
            });
        });

    // Cập nhật số lượng thông báo
    updateUnreadCount();

    // Xử lý sự kiện click chuông thông báo
    const notificationBell = document.querySelector('.notification-bell a');
    if (notificationBell) {
        notificationBell.addEventListener('click', function () {
            simulatedUnreadCount = 0;
            updateUnreadCount();
        });
    } else {
        console.warn('Không tìm thấy phần tử .notification-bell a trong HTML');
    }
});