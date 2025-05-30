document.addEventListener("DOMContentLoaded", () => {
    const logInBtn = document.getElementsByName("logInBtn")[0];
    const registerBtn = document.getElementsByName("registerBtn")[0];
    const logOutBtn = document.getElementsByName("logOutBtn")[0];

    function updateUI() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.UserID) {
            if (logInBtn) logInBtn.style.display = "none";
            if (registerBtn) registerBtn.style.display = "none";
            if (logOutBtn) logOutBtn.style.display = "inline-block";
        } else {
            if (logInBtn) logInBtn.style.display = "inline-block";
            if (registerBtn) registerBtn.style.display = "inline-block";
            if (logOutBtn) logOutBtn.style.display = "none";
        }
    }

    if (logInBtn) {
        logInBtn.addEventListener("click", () => {
            window.location.href = "../login/index.html";
        });
    }
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            window.location.href = "../register/index.html";
        });
    }

    if (logOutBtn) {
        logOutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            sessionStorage.removeItem("user");
            updateUI();
        });
    }

    window.onLoginSuccess = function (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("user", JSON.stringify(userData));
        updateUI();
    };

    updateUI();
});

// Hàm kiểm tra URL hợp lệ
function isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    try {
        const url = string.match(/^https?:\/\//) ? string : `https://${string}`;
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

// Hàm định dạng tiền USD
function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Hiển thị danh sách xe đề xuất và nút Xem Thêm
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("recommendedCars");
    if (!container) {
        console.error("Không tìm thấy phần tử với id 'recommendedCars'");
        return;
    }

    // Tạo nút Xem Thêm
    const showMoreBtnContainer = document.createElement("div");
    showMoreBtnContainer.className = "text-center mt-4";
    showMoreBtnContainer.innerHTML = `
        <button id="showMoreBtn" class="btn btn-info btn-lg text-white">Show more</button>
    `;
    container.parentElement.appendChild(showMoreBtnContainer);

    // Lấy danh sách xe đề xuất ban đầu
    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
        .then(response => response.json())
        .then(data => {
            console.log('Phản hồi API RecommendedCars:', JSON.stringify(data, null, 2));
            renderRecommendedCars(data);
        })
        .catch(error => {
            console.error("Lỗi khi lấy danh sách xe đề xuất:", error);
            container.innerHTML = '<p class="text-white text-center">Có lỗi xảy ra. Vui lòng thử lại sau.</p>';
        });

    // Xử lý nút Xem Thêm
    const showMoreBtn = document.getElementById("showMoreBtn");
    if (showMoreBtn) {
        showMoreBtn.addEventListener("click", () => {
            container.innerHTML = '<p class="text-white text-center">Đang tải tất cả xe...</p>';
            fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Lỗi API: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Phản hồi API CarModel:', JSON.stringify(data, null, 2));
                    renderRecommendedCars(data);
                    showMoreBtn.style.display = "none";
                })
                .catch(error => {
                    console.error("Lỗi khi lấy danh sách xe:", error);
                    container.innerHTML = '<p class="text-white text-center">Không thể tải danh sách xe. Vui lòng thử lại sau.</p>';
                });
        });
    }

    function renderRecommendedCars(cars) {
        if (!container) {
            console.error("Không tìm thấy phần tử với id 'recommendedCars'");
            return;
        }
        container.innerHTML = "";

        const row = document.createElement("div");
        row.className = "row";

        if (!Array.isArray(cars) || cars.length === 0) {
            container.innerHTML = '<p class="text-white text-center">Không có xe nào để hiển thị.</p>';
            return;
        }

        cars.forEach(car => {
            const imageUrl = car.imageUrl || car.ImageURL || car.imageURL || car.image || car.Image || car.img || car.imageUrl || (car.Car && (car.Car.ImageURL || car.Car.image)) || 'https://via.placeholder.com/400x250?text=No+Image';
            const validImageUrl = imageUrl && isValidUrl(imageUrl) ? (imageUrl.match(/^https?:\/\//) ? imageUrl : `https://${imageUrl}`) : 'https://via.placeholder.com/400x250?text=No+Image';
            const carName = car.name || car.CarName || car.Name || car.carName || (car.Car && (car.Car.name || car.Car.CarName)) || 'N/A';
            const price = car.price || car.UnitPrice || car.Price || car.unitPrice || null;
            const year = car.year || car.Year || 'N/A';
            const fuel = car.fuel || car.FuelType || car.fuelType || car.Fuel || 'N/A';
            const engine = car.engine || car.EngineCapacity || car.Engine || car.engineCapacity || 'N/A';
            const color = car.color || car.Color || 'N/A';
            const transmission = car.transmission || car.Transmission || 'N/A';
            // Ưu tiên carId từ API /RecommendedCars, sau đó mới đến các trường khác
            const carModelID = car.carId || car.carModelID || car.CarModelID || car.ID || car.id || car.CarID || car.ModelID || car.modelID || (car.Car && (car.Car.carModelID || car.Car.CarModelID || car.Car.ID || car.Car.id || car.Car.CarID || car.Car.ModelID || car.Car.modelID)) || 'N/A';

            console.log(`Xe: ${carName}, carModelID: ${carModelID}`);

            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 col-sm-12 mb-4";

            card.innerHTML = `
                <div class="card shadow custom-card h-100">
                    <div class="position-relative ratio" style="--bs-aspect-ratio: 60%;">
                        <img src="${validImageUrl}" class="card-img-top" alt="${carName}" style="object-fit: cover; cursor: ${carModelID !== 'N/A' ? 'pointer' : 'default'};" data-car-model-id="${carModelID}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title mt-2">${carName}</h5>
                        <h4 class="text-info">${price !== undefined && price !== null && !isNaN(price) ? formatCurrency(price) : 'N/A'}</h4>
                        <div class="row">
                            <div class="col-6">
                                <p><i class="fa-solid fa-calendar text-info me-2"></i>Năm: ${year}</p>
                            </div>
                            <div class="col-6">
                                <p><i class="fa-solid fa-gas-pump text-info me-2"></i>Nhiên liệu: ${fuel}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <p><i class="fa-solid fa-gauge-high text-info me-2"></i>Động cơ: ${engine}</p>
                            </div>
                            <div class="col-6">
                                <p><i class="fa-solid fa-palette text-info me-2"></i>Màu: ${color}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <p><i class="fa-solid fa-cogs text-info me-2"></i>Hộp số: ${transmission}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="mt-2 d-flex align-items-center">
                            <span class="text-white fs-5 me-2">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-regular fa-star"></i>
                            </span>
                            <span class="text-white">(12 Đánh giá)</span>
                        </div>
                    </div>
                </div>
            `;
            row.appendChild(card);
        });

        container.appendChild(row);

        // Thêm sự kiện nhấp chuột vào ảnh
        const carImages = container.querySelectorAll('.card-img-top');
        carImages.forEach(image => {
            const carModelID = image.getAttribute('data-car-model-id');
            if (carModelID && carModelID !== 'N/A') {
                image.addEventListener('click', () => {
                    console.log('Chuyển hướng đến CarDetails với carModelID:', carModelID);
                    window.location.href = `../CarDetails/index.html?id=${carModelID}`;
                });
            } else {
                console.warn('Không gắn sự kiện nhấp chuột cho xe với carModelID không hợp lệ:', carModelID);
                image.addEventListener('click', () => {
                    alert('Không thể xem chi tiết xe do thiếu ID xe. Vui lòng liên hệ quản trị viên.');
                });
            }
        });
    }
});

// Xử lý tìm kiếm và render kết quả tìm kiếm
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("recommendedCars");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("search-addon");

    if (!container || !searchInput || !searchButton) {
        console.error("Không tìm thấy phần tử cần thiết: recommendedCars, searchInput, hoặc search-addon");
        return;
    }

    container.innerHTML = '<p class="text-white text-center">Đang tải danh sách xe...</p>';

    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Phản hồi API RecommendedCars (tìm kiếm):', JSON.stringify(data, null, 2));
            renderCars(data, container);
        })
        .catch(error => {
            console.error("Lỗi khi lấy danh sách xe đề xuất:", error);
            container.innerHTML = '<p class="text-white text-center">Không thể tải danh sách xe. Vui lòng thử lại sau.</p>';
        });

    let debounceTimer;
    const debounce = (func, delay) => {
        return (...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const performSearch = () => {
        console.log("Bắt đầu tìm kiếm...");
        const keyword = searchInput.value.trim();

        if (keyword === "") {
            container.innerHTML = '<p class="text-white text-center">Đang tải danh sách xe...</p>';
            fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Lỗi API: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Phản hồi API RecommendedCars (tìm kiếm):', JSON.stringify(data, null, 2));
                    renderCars(data, container);
                    const showMoreBtn = document.getElementById("showMoreBtn");
                    if (showMoreBtn) showMoreBtn.style.display = "block";
                })
                .catch(error => {
                    console.error("Lỗi khi lấy danh sách xe đề xuất:", error);
                    container.innerHTML = '<p class="text-white text-center">Không thể tải danh sách xe. Vui lòng thử lại sau.</p>';
                });
            return;
        }

        container.innerHTML = '<p class="text-white text-center">Đang tìm kiếm...</p>';

        const url = `https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarSearch/search?keyword=${encodeURIComponent(keyword)}&brandName=${encodeURIComponent(keyword)}`;

        fetch(url, {
            headers: {
                'Role': 'Admin'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Kết quả tìm kiếm:', JSON.stringify(data, null, 2));
                if (!data || typeof data !== 'object') {
                    throw new Error("Dữ liệu trả về không hợp lệ");
                }
                const carList = Array.isArray(data) ? data : data.results || [];
                renderCars(carList, container);
                const showMoreBtn = document.getElementById("showMoreBtn");
                if (showMoreBtn) showMoreBtn.style.display = "block";
            })
            .catch(error => {
                console.error("Lỗi khi lấy kết quả tìm kiếm:", error);
                container.innerHTML = '<p class="text-white text-center">Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.</p>';
            });
    };

    searchInput.addEventListener("input", debounce(performSearch, 500));
    searchButton.addEventListener("click", performSearch);

    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    function renderCars(cars, container) {
        container.innerHTML = "";

        if (!Array.isArray(cars) || cars.length === 0) {
            container.innerHTML = '<p class="text-white text-center">Không tìm thấy xe nào.</p>';
            return;
        }

        const row = document.createElement("div");
        row.className = "row";

        cars.forEach(car => {
            const imageUrl = car.imageUrl || car.ImageURL || car.imageURL || car.image || car.Image || car.img || car.imageUrl || (car.Car && (car.Car.ImageURL || car.Car.image)) || 'https://via.placeholder.com/400x250?text=No+Image';
            const validImageUrl = imageUrl && isValidUrl(imageUrl) ? (imageUrl.match(/^https?:\/\//) ? imageUrl : `https://${imageUrl}`) : 'https://via.placeholder.com/400x250?text=No+Image';
            const carName = car.name || car.CarName || car.Name || car.carName || (car.Car && (car.Car.name || car.Car.CarName)) || 'N/A';
            const price = car.price || car.UnitPrice || car.Price || car.unitPrice || null;
            const year = car.year || car.Year || 'N/A';
            const fuel = car.fuel || car.FuelType || car.fuelType || car.Fuel || 'N/A';
            const engine = car.engine || car.EngineCapacity || car.Engine || car.engineCapacity || 'N/A';
            const color = car.color || car.Color || 'N/A';
            const transmission = car.transmission || car.Transmission || 'N/A';
            // Ưu tiên carId từ API /RecommendedCars, sau đó mới đến các trường khác
            const carModelID = car.carId || car.carModelID || car.CarModelID || car.ID || car.id || car.CarID || car.ModelID || car.modelID || (car.Car && (car.Car.carModelID || car.Car.CarModelID || car.Car.ID || car.Car.id || car.Car.CarID || car.Car.ModelID || car.Car.modelID)) || 'N/A';

            console.log(`Xe: ${carName}, carModelID: ${carModelID}`);

            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 col-sm-12 mb-4";

            card.innerHTML = `
                <div class="card shadow custom-card h-100">
                    <div class="position-relative ratio" style="--bs-aspect-ratio: 60%;">
                        <img src="${validImageUrl}" class="card-img-top" alt="${carName}" style="object-fit: cover; cursor: ${carModelID !== 'N/A' ? 'pointer' : 'default'};" data-car-model-id="${carModelID}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title mt-2">${carName}</h5>
                        <h4 class="text-info">${price !== undefined && price !== null && !isNaN(price) ? formatCurrency(price) : 'N/A'}</h4>
                        <div class="row">
                            <div class="col-6">
                                <p><i class="fa-solid fa-calendar text-info me-2"></i>Năm: ${year}</p>
                            </div>
                            <div class="col-6">
                                <p><i class="fa-solid fa-gas-pump text-info me-2"></i>Nhiên liệu: ${fuel}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <p><i class="fa-solid fa-gauge-high text-info me-2"></i>Động cơ: ${engine}</p>
                            </div>
                            <div class="col-6">
                                <p><i class="fa-solid fa-palette text-info me-2"></i>Màu: ${color}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <p><i class="fa-solid fa-cogs text-info me-2"></i>Hộp số: ${transmission}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="mt-2 d-flex align-items-center">
                            <span class="text-white fs-5 me-2">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-regular fa-star"></i>
                            </span>
                            <span class="text-white">(12 Đánh giá)</span>
                        </div>
                    </div>
                </div>
            `;
            row.appendChild(card);
        });

        container.appendChild(row);

        // Thêm sự kiện nhấp chuột vào ảnh
        const carImages = container.querySelectorAll('.card-img-top');
        carImages.forEach(image => {
            const carModelID = image.getAttribute('data-car-model-id');
            if (carModelID && carModelID !== 'N/A') {
                image.addEventListener('click', () => {
                    console.log('Chuyển hướng đến CarDetails với carModelID:', carModelID);
                    window.location.href = `../CarDetails/index.html?id=${carModelID}`;
                });
            } else {
                console.warn('Không gắn sự kiện nhấp chuột cho xe với carModelID không hợp lệ:', carModelID);
                image.addEventListener('click', () => {
                    alert('Không thể xem chi tiết xe do thiếu ID xe. Vui lòng liên hệ quản trị viên.');
                });
            }
        });
    }
});