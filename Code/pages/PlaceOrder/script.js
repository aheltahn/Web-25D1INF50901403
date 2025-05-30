const tempToken = localStorage.getItem('user');
const jsonToken = tempToken ? JSON.parse(tempToken) : null;
const poToken = jsonToken?.token || null;
const poUserId = jsonToken?.UserID || null;


document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOMContentLoaded event triggered ===');
    console.log('Thời gian hiện tại:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));


    const API_BASE_URL = 'https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api';


    // Hàm giải mã token (nếu cần)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Không thể giải mã token:", e);
            return null;
        }
    }


   
  async function checkApiConnection(carModelId) {
    if (!poToken) {
        console.error('Không có token để kiểm tra API.');
        return false;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/PlaceOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${poToken}`
            },
            body: JSON.stringify({
                CarModelID: carModelId
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Lỗi kiểm tra kết nối API PlaceOrder:', error);
        return false;
    }
}




    // Kiểm tra token còn hợp lệ
    async function checkTokenValidity() {
        if (!poToken || !poUserId) {
            console.error('Thiếu token hoặc userId:', { poToken, poUserId });
            return false;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/ViewAccount/${poUserId}`, {
                headers: { 'Authorization': `Bearer ${poToken}` }
            });
            return response.ok;
        } catch (error) {
            console.error('Lỗi khi kiểm tra token:', error);
            return false;
        }
    }


    // Format tiền tệ
    function formatCurrency(amount, unitCode = 'USD') {
        if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
        return new Intl.NumberFormat(unitCode === 'USD' ? 'en-US' : 'vi-VN', {
            style: 'currency',
            currency: unitCode
        }).format(amount);
    }


    // Lấy carModelId từ URL
    function getCarModelIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const carModelIdStr = params.get('carModelId');
        if (!carModelIdStr || isNaN(parseInt(carModelIdStr))) {
            alert('Không tìm thấy carModelId hợp lệ trong URL.');
            return null;
        }
        return parseInt(carModelIdStr);
    }


    // Lấy chi tiết xe, ưu tiên localStorage nếu có
    async function fetchCarDetails(carModelId) {
        const storedCarDetails = JSON.parse(localStorage.getItem('carDetails')) || {};
        if (storedCarDetails.carModelID === carModelId) {
            updateCarDetailsUI(storedCarDetails);
            return storedCarDetails;
        }


        if (!(await checkApiConnection())) {
            alert('Không thể kết nối đến server.');
            return null;
        }


        try {
            const response = await fetch(`${API_BASE_URL}/CarDetail/${carModelId}`, {
                headers: { 'Authorization': `Bearer ${poToken || ''}` }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('user');
                    window.location.href = '../login/index.html';
                    return null;
                }
                throw new Error(`Lỗi API CarDetail: ${response.status}`);
            }
            const data = await response.json();
            updateCarDetailsUI(data);
            localStorage.setItem('carDetails', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Lỗi khi gọi API CarDetail:', error);
            alert(`Không thể tải thông tin xe: ${error.message}`);
            return null;
        }
    }


    // Cập nhật giao diện chi tiết xe
    function updateCarDetailsUI(data) {
        if (data.statusName && data.statusName.toLowerCase() === 'unavailable') {
            placeOrderButton.disabled = true;
            placeOrderButton.classList.add('disabled');
            placeOrderButton.textContent = 'Unavailable';
            alert('Xe không khả dụng để đặt hàng');
            return;
        }


        carTitleElement.textContent = data.carName || 'N/A';
        transmissionElement.textContent = data.transmission || 'N/A';
        engineCapacityElement.textContent = data.engineCapacity ? `${data.engineCapacity} L` : 'N/A';
        colorElement.textContent = data.color || 'N/A';
        categoryElement.textContent = data.categoryName || 'N/A';
        statusElement.textContent = data.statusName || 'N/A';
        mainImage.src = data.imageURL || 'https://via.placeholder.com/600x400?text=Car+Image';
        mainImage.alt = data.carName || 'Car Image';
        thumbnailGallery.innerHTML = `
            <img src="${data.imageURL || 'https://via.placeholder.com/100x60?text=Thumb+1'}" class="thumbnail-img" alt="Thumbnail 1">
            <img src=" https://static.wixstatic.com/media/b4dcef_0a96409b108042ac95fe93893f2d90c8~mv2.png/v1/fill/w_800,h_475,al_c,q_90/b4dcef_0a96409b108042ac95fe93893f2d90c8~mv2.png" class ="thumbnail-img" alt="Thumbnail 2">
            <img src="https://vcdn1-vnexpress.vnecdn.net/2021/12/17/toyota-camry-2-1639733236-1639-9625-3741-1639734273.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=jffFzsJhBTTSC3VHnzqEOw" class ="thumbnail-img" alt="Thumbnail 3">
        `;
    }
    

    // Cập nhật giá lên UI
    function updatePriceUI(deposit, remaining, totalPrice, unitCode) {
        depositElement.textContent = formatCurrency(deposit, unitCode);
        remainingElement.textContent = formatCurrency(remaining, unitCode);
        totalPriceElement.textContent = formatCurrency(totalPrice, unitCode);
    }


    // Lấy giá từ CarModel API
    async function fetchOrderTotalPrice(carModelId) {
        const fallbackPrice = { totalPrice: 30000, unitCode: 'USD', deposit: 6000, remaining: 24000 };
        if (!(await checkApiConnection())) {
            updatePriceUI(fallbackPrice.deposit, fallbackPrice.remaining, fallbackPrice.totalPrice, fallbackPrice.unitCode);
            return fallbackPrice;
        }


        try {
            const response = await fetch(`${API_BASE_URL}/CarModel`, {
                headers: { 'Authorization': `Bearer ${poToken || ''}` }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('user');
                    window.location.href = '../login/index.html';
                    return null;
                }
                throw new Error(`Lỗi API CarModel: ${response.status}`);
            }
            const carModels = await response.json();
            const carDetails = carModels.find(car => car.CarModelID === parseInt(carModelId));
            if (!carDetails || !carDetails.UnitPrice) {
                alert('Không thể tải thông tin giá. Sử dụng giá mặc định.');
                updatePriceUI(fallbackPrice.deposit, fallbackPrice.remaining, fallbackPrice.totalPrice, fallbackPrice.unitCode);
                return fallbackPrice;
            }


            const totalPrice = carDetails.UnitPrice;
            const unitCode = 'USD';
            const deposit = totalPrice * 0.2;
            const remaining = totalPrice - deposit;
            updatePriceUI(deposit, remaining, totalPrice, unitCode);
            return { totalPrice, unitCode, deposit, remaining };
        } catch (error) {
            console.error('Lỗi khi lấy UnitPrice:', error);
            updatePriceUI(fallbackPrice.deposit, fallbackPrice.remaining, fallbackPrice.totalPrice, fallbackPrice.unitCode);
            return fallbackPrice;
        }
    }


    // Xử lý đặt hàng
    async function handlePlaceOrder(carModelId) {
        if (!poToken) {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để đặt hàng.');
            localStorage.removeItem('user');
            window.location.href = '../login/index.html';
            return;
        }


        if (!(await checkTokenValidity())) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            localStorage.removeItem('user');
            window.location.href = '../login/index.html';
            return;
        }


        const orderDate = new Date().toISOString();


        // Lấy dữ liệu chi tiết xe và giá
        const carDetails = await fetchCarDetails(carModelId);
        if (!carDetails) return;


        const priceData = await fetchOrderTotalPrice(carModelId);
        if (!priceData) return;


        // Tạo object order tạm thời lưu localStorage (chưa có orderId)
        const tempOrder = {
            orderId: null,
            carModelId: carModelId,
            carDetails: {
                carName: carDetails.carName,
                transmission: carDetails.transmission,
                engineCapacity: carDetails.engineCapacity,
                color: carDetails.color,
                categoryName: carDetails.categoryName,
                imageURL: carDetails.imageURL
            },
            totalPrice: priceData.totalPrice,
            unitCode: priceData.unitCode,
            deposit: priceData.deposit,
            remaining: priceData.remaining
        };
        localStorage.setItem('currentOrder', JSON.stringify(tempOrder));


        if (!(await checkApiConnection(carModelId))) {
    alert('Không thể kết nối đến server. Vui lòng thử lại.');
    return;
}




        try {
            const response = await fetch(`${API_BASE_URL}/PlaceOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${poToken}`
                },
                body: JSON.stringify({
                    OrderDate: orderDate,
                    CarModelID: carModelId
                })
            });


            if (!response.ok) {
                if (response.status === 401) {
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('user');
                    window.location.href = '../login/index.html';
                    return;
                }
                throw new Error(`Lỗi API PlaceOrder: ${response.status} - ${response.statusText}`);
            }


            const data = await response.json();
            const orderId = data.orderId;
            if (!orderId) {
                throw new Error('Không nhận được orderId từ API.');
            }


            // Cập nhật orderId vào currentOrder và lưu lại
            tempOrder.orderId = orderId;
            localStorage.setItem('currentOrder', JSON.stringify(tempOrder));


            alert('Đặt hàng thành công! Chuyển hướng đến trang thanh toán.');
            window.location.href = `../Payment/index.html?orderId=${orderId}&carModelId=${carModelId}`;
        } catch (error) {
            alert(`Không thể đặt hàng: ${error.message}`);
            console.error('Lỗi khi đặt hàng:', error);
        }
    }


    // Khởi tạo trang
    async function initializePage() {
        const carModelId = getCarModelIdFromUrl();
        if (!carModelId) return;


        const carDetails = await fetchCarDetails(carModelId);
        if (!carDetails) return;


        if (carDetails.statusName.toLowerCase() !== 'unavailable') {
            await fetchOrderTotalPrice(carModelId);
        } else {
            placeOrderButton.disabled = true;
            placeOrderButton.classList.add('disabled');
            placeOrderButton.textContent = 'Unavailable';
        }


        placeOrderButton.addEventListener('click', (event) => {
            event.preventDefault();
            handlePlaceOrder(carModelId);
        });
    }


    // Các phần tử DOM
    const mainImage = document.querySelector('#mainImage');
    const thumbnailGallery = document.querySelector('#thumbnailGallery');
    const transmissionElement = document.querySelector('.car-info .d-flex:nth-child(1) span:last-child');
    const engineCapacityElement = document.querySelector('.car-info .d-flex:nth-child(2) span:last-child');
    const colorElement = document.querySelector('.car-info .d-flex:nth-child(3) span:last-child');
    const categoryElement = document.querySelector('.car-info .d-flex:nth-child(4) span:last-child');
    const statusElement = document.querySelector('.car-info .d-flex:nth-child(5) span:last-child');
    const depositElement = document.querySelector('.payment-info .d-flex:nth-child(1) span:last-child');
    const remainingElement = document.querySelector('.payment-info .d-flex:nth-child(2) span:last-child');
    const totalPriceElement = document.querySelector('.payment-info .d-flex:nth-child(3) span:last-child');
    const carTitleElement = document.querySelector('.header-line .text');
    const placeOrderButton = document.querySelector('#order-button');


    // Kiểm tra DOM đủ không
    if (!mainImage || !thumbnailGallery || !transmissionElement || !engineCapacityElement || !colorElement || !categoryElement || !statusElement || !depositElement || !remainingElement || !totalPriceElement || !carTitleElement || !placeOrderButton) {
        alert('Lỗi giao diện: Một số phần tử không được tìm thấy.');
        return;
    }


    // Bắt đầu khởi tạo
    initializePage().catch(error => {
        alert(`Lỗi khi tải trang: ${error.message}`);
        console.error(error);
    });
});



