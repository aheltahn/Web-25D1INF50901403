// Lấy token từ localStorage
const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;


// Kiểm tra token
if (!token) {
    alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
    window.location.href = '../login/index.html';
}
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


// Hàm kiểm tra URL hợp lệ
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}


// Lưu trữ danh sách xe để sử dụng khi chỉnh sửa
let carList = [];


// Hàm làm mới danh sách xe
function refreshCarList() {
    const tbody = document.getElementById('car-table-body');
    if (!tbody) {
        console.error("Không tìm thấy phần tử với id 'car-table-body'");
        return;
    }


    tbody.innerHTML = `<tr><td colspan="15" class="text-center">Đang tải dữ liệu...</td></tr>`;


    fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel', {
    headers: {
        'Authorization': `Bearer ${token}`, // ✅ Bắt buộc
        'Role': 'Admin'                      // (tuỳ logic backend, giữ lại nếu đang dùng)
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
    }
    return response.json();
})


    .then(data => {
        console.log('Dữ liệu từ API:', data);
        tbody.innerHTML = '';


        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="15" class="text-center">Không có dữ liệu xe.</td></tr>`;
            carList = [];
            return;
        }


        // Lưu danh sách xe vào biến toàn cục
        carList = data;


        data.forEach((car, index) => {
            const carName = car.carName || car.CarName || (car.Car && car.Car.carName) || 'N/A';
            const imageUrl = car.imageURL || car.ImageURL || (car.Car && car.Car.imageURL) || 'https://via.placeholder.com/100?text=No+Image';
            const year = car.year || car.Year || 'N/A';
            const fuelType = car.fuelType || car.FuelType || 'N/A';
            const transmission = car.transmission || car.Transmission || 'N/A';
            const engineCapacity = car.engineCapacity || car.EngineCapacity || 'N/A';
            const color = car.color || car.Color || 'N/A';
            const model = car.model || car.Model || 'N/A';
            const brand = (car.brand && (car.brand.brandName || car.brand.BrandName)) || car.brandName || car.BrandName || 'N/A';
            const category = (car.category && (car.category.categoryName || car.category.CategoryName)) || car.categoryName || car.CategoryName || 'N/A';
            const unitPrice = car.unitPrice || car.UnitPrice || car.price || car.Price || null;
            const formattedPrice = (unitPrice !== undefined && unitPrice !== null && !isNaN(unitPrice)) ? formatCurrency(unitPrice) : 'N/A';
            const statusName = (car.status && (car.status.statusName || car.status.StatusName)) || car.statusName || car.StatusName || 'N/A';
            const statusClass = statusName.toLowerCase() === 'available' ? 'bg-success' : 'bg-secondary';


            // Lưu BrandID, CategoryID, StatusID vào localStorage nếu có
            const carId = car.carModelID || car.CarModelID || car.id || car.CarModelId || '';
            if (carId) {
                const brandId = car.brandID || car.BrandID || (car.brand && (car.brand.brandID || car.brand.BrandID || car.brand.Id || car.brand.id || car.brand.brand_id)) || '';
                const categoryId = car.categoryID || car.CategoryID || (car.category && (car.category.categoryID || car.category.CategoryID || car.category.Id || car.category.id || car.category.category_id)) || '';
                const statusId = car.statusID || car.StatusID || (car.status && (car.status.statusID || car.status.StatusID || car.status.Id || car.status.id || car.status.status_id)) || '';


                if (brandId) localStorage.setItem(`BrandID_${carId}`, brandId);
                if (categoryId) localStorage.setItem(`CategoryID_${carId}`, categoryId);
                if (statusId) localStorage.setItem(`StatusID_${carId}`, statusId);
            }
       
            const row = `
                <tr data-id="${carId}">
                    <td><input type="checkbox"></td>
                    <td>${index + 1}</td>
                    <td>${carName}</td>
                    <td>
                        <img src="${imageUrl}" alt="${carName}" style="width: 100px; height: 60px; object-fit: cover;" />
                    </td>
                    <td>${year}</td>
                    <td>${fuelType}</td>
                    <td>${transmission}</td>
                    <td>${engineCapacity}</td>
                    <td>${color}</td>
                    <td>${model}</td>
                    <td>${brand}</td>
                    <td>${category}</td>
                    <td>${formattedPrice}</td>
                    <td><span class="badge text-white ${statusClass}">${statusName}</span></td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-bs-toggle="modal" data-bs-target="#editModal" data-id="${carId}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary view-btn" data-bs-toggle="modal" data-bs-target="#viewModal" data-id="${carId}">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${carId}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });


        // Thêm sự kiện cho các nút "Edit" sau khi bảng được hiển thị
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                const carId = this.getAttribute('data-id');
                if (!carId) {
                    alert("Không tìm thấy ID xe để chỉnh sửa!");
                    return;
                }


                if (!carList || carList.length === 0) {
                    alert("Danh sách xe rỗng, không thể chỉnh sửa!");
                    return;
                }


                // Tìm xe trong danh sách đã tải sẵn
                const car = carList.find(c => String(c.carModelID || c.CarModelID || c.id || c.CarModelId || '') === String(carId));
                if (!car) {
                    alert("Không tìm thấy dữ liệu xe để chỉnh sửa!");
                    return;
                }


                // Điền dữ liệu vào modal
                document.getElementById('editCarModelID').value = car.carModelID || car.CarModelID || car.id || car.CarModelId || 'N/A';
                document.getElementById('editCarName').value = car.carName || car.CarName || (car.Car && car.Car.carName) || 'N/A';
                document.getElementById('editYear').value = car.year || car.Year || '';
                document.getElementById('editFuelType').value = car.fuelType || car.FuelType || 'N/A';
                document.getElementById('editTransmission').value = car.transmission || car.Transmission || 'N/A';
                document.getElementById('editEngineCapacity').value = car.engineCapacity || car.EngineCapacity || '';
                document.getElementById('editColor').value = car.color || car.Color || 'N/A';
                document.getElementById('editImageURL').value = car.imageURL || car.ImageURL || (car.Car && car.Car.imageURL) || 'https://via.placeholder.com/100?text=No+Image';
                document.getElementById('editModel').value = car.model || car.Model || 'N/A';
                document.getElementById('editUnitPrice').value = car.unitPrice || car.UnitPrice || car.price || car.Price || '';


                // Cập nhật cách lấy BrandID, CategoryID, StatusID từ dữ liệu API
                const brandIdFromApi = car.brandID || car.BrandID || (car.brand && (car.brand.brandID || car.brand.BrandID || car.brand.Id || car.brand.id || car.brand.brand_id)) || '';
                const categoryIdFromApi = car.categoryID || car.CategoryID || (car.category && (car.category.categoryID || car.category.CategoryID || car.category.Id || car.category.id || car.category.category_id)) || '';
                const statusIdFromApi = car.statusID || car.StatusID || (car.status && (car.status.statusID || car.status.StatusID || car.status.Id || car.status.id || car.status.status_id)) || '';


                // Lấy giá trị từ localStorage nếu API không có dữ liệu
                const brandId = brandIdFromApi || localStorage.getItem(`BrandID_${carId}`) || '';
                const categoryId = categoryIdFromApi || localStorage.getItem(`CategoryID_${carId}`) || '';
                const statusId = statusIdFromApi || localStorage.getItem(`StatusID_${carId}`) || '';


                // Điền giá trị vào modal và kiểm tra lỗi
                document.getElementById('editBrandID').value = brandId || '';
                document.getElementById('editCategoryID').value = categoryId || '';
                document.getElementById('editStatusID').value = statusId || '';


                // Thông báo cho người dùng nếu không tìm thấy giá trị
                if (!brandId) {
                    console.warn(`BrandID không tìm thấy cho CarModelID: ${carId}`);
                    alert(`Không tìm thấy BrandID cho xe ${carId}. Vui lòng nhập giá trị hợp lệ.`);
                }
                if (!categoryId) {
                    console.warn(`CategoryID không tìm thấy cho CarModelID: ${carId}`);
                    alert(`Không tìm thấy CategoryID cho xe ${carId}. Vui lòng nhập giá trị hợp lệ.`);
                }
                if (!statusId) {
                    console.warn(`StatusID không tìm thấy cho CarModelID: ${carId}`);
                    alert(`Không tìm thấy StatusID cho xe ${carId}. Vui lòng nhập giá trị hợp lệ.`);
                }
            });
        });


        // Thêm sự kiện cho các nút "View" sau khi bảng được hiển thị
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function () {
                const carId = this.getAttribute('data-id');
                if (!carId) {
                    alert("Không tìm thấy ID xe để xem!");
                    return;
                }


                if (!carList || carList.length === 0) {
                    alert("Danh sách xe rỗng, không thể xem!");
                    return;
                }


                // Tìm xe trong danh sách đã tải sẵn
                const car = carList.find(c => String(c.carModelID || c.CarModelID || c.id || c.CarModelId || '') === String(carId));
                if (!car) {
                    alert("Không tìm thấy dữ liệu xe để xem!");
                    return;
                }


                // Điền dữ liệu vào modal viewModal
                document.getElementById('viewCarModelID').textContent = car.carModelID || car.CarModelID || car.id || car.CarModelId || 'N/A';
                document.getElementById('viewCarName').textContent = car.carName || car.CarName || (car.Car && car.Car.carName) || 'N/A';
                document.getElementById('viewYear').textContent = car.year || car.Year || 'N/A';
                document.getElementById('viewFuelType').textContent = car.fuelType || car.FuelType || 'N/A';
                document.getElementById('viewTransmission').textContent = car.transmission || car.Transmission || 'N/A';
                document.getElementById('viewEngineCapacity').textContent = car.engineCapacity || car.EngineCapacity || 'N/A';
                document.getElementById('viewColor').textContent = car.color || car.Color || 'N/A';
                const imageLink = document.getElementById('viewImageURL');
                const imageUrl = car.imageURL || car.ImageURL || (car.Car && car.Car.imageURL) || 'https://via.placeholder.com/100?text=No+Image';
                imageLink.href = imageUrl;
                imageLink.textContent = imageUrl;
                document.getElementById('viewModel').textContent = car.model || car.Model || 'N/A';
                document.getElementById('viewUnitPrice').textContent = car.unitPrice || car.UnitPrice || car.price || car.Price ? formatCurrency(car.unitPrice || car.UnitPrice || car.price || car.Price) : 'N/A';
               
                // Cập nhật cách lấy BrandID, CategoryID, StatusID từ dữ liệu API
                const brandId = car.brandID || car.BrandID || (car.brand && (car.brand.brandID || car.brand.BrandID || car.brand.Id || car.brand.id || car.brand.brand_id)) || '';
                const categoryId = car.categoryID || car.CategoryID || (car.category && (car.category.categoryID || car.category.CategoryID || car.category.Id || car.category.id || car.category.category_id)) || '';
                const statusId = car.statusID || car.StatusID || (car.status && (car.status.statusID || car.status.StatusID || car.status.Id || car.status.id || car.status.status_id)) || '';
               
                document.getElementById('viewBrandID').textContent = brandId || 'N/A';
                document.getElementById('viewCategoryID').textContent = categoryId || 'N/A';
                document.getElementById('viewStatusID').textContent = statusId || 'N/A';
               
                // Hiển thị các trường bổ sung từ API
                document.getElementById('viewBrandName').textContent = (car.brand && (car.brand.brandName || car.brand.BrandName)) || car.brandName || car.BrandName || 'N/A';
                document.getElementById('viewCategoryName').textContent = (car.category && (car.category.categoryName || car.category.CategoryName)) || car.categoryName || car.CategoryName || 'N/A';
                document.getElementById('viewStatusName').textContent = (car.status && (car.status.statusName || car.status.StatusName)) || car.statusName || car.StatusName || 'N/A';
                document.getElementById('viewIsHidden').textContent = car.isHidden !== undefined ? (car.isHidden ? 'Yes' : 'No') : 'N/A';
            });
        });


        // Thêm sự kiện cho các nút "Delete" sau khi bảng được hiển thị
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const carId = this.getAttribute('data-id');
                if (!carId) {
                    alert("Không tìm thấy ID xe để xóa!");
                    return;
                }


                // Xác nhận trước khi xóa
                if (!confirm(`Bạn có chắc chắn muốn xóa xe có ID ${carId} không?`)) {
                    return;
                }


                try {
                    // Gửi yêu cầu DELETE đến API
                    const response = await fetch(`https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel/${carId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                            "Role": "Admin" // Thêm header Role: Admin
                        }
                    });


                    console.log('Phản hồi từ API DELETE:', response);


                    if (response.ok) {
                        const message = await response.text();
                        console.log('Thông báo từ server:', message);
                        alert(message || "Xóa xe thành công!");
                       
                        // Xóa các giá trị liên quan trong localStorage
                        localStorage.removeItem(`BrandID_${carId}`);
                        localStorage.removeItem(`CategoryID_${carId}`);
                        localStorage.removeItem(`StatusID_${carId}`);


                        // Làm mới danh sách xe
                        refreshCarList();
                    } else if (response.status === 403) {
                        throw new Error("Forbidden: Token không hợp lệ hoặc không có quyền xóa.");
                    } else {
                        const errorText = await response.text();
                        throw new Error(`Error deleting car: ${response.status} - ${response.statusText}. Details: ${errorText}`);
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa xe:', error);
                    if (error.message.includes("Failed to fetch")) {
                        alert("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc trạng thái server.");
                    } else {
                        alert(error.message);
                    }
                }
            });
        });
    })
    .catch(error => {
        console.error('Lỗi khi gọi API:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="15" class="text-center text-danger">Không thể tải dữ liệu xe: ${error.message}</td>
            </tr>
        `;
    });
}


// Hiển thị danh sách xe khi tải trang
document.addEventListener('DOMContentLoaded', function () {
    refreshCarList();
});


// Thêm xe
document.getElementById("addCarForm").addEventListener("submit", function (event) {
    event.preventDefault();


    const carData = {
        CarName: document.getElementById("carName").value.trim(),
        Year: Number(document.getElementById("year").value),
        FuelType: document.getElementById("fuelType").value.trim(),
        Transmission: document.getElementById("transmission").value.trim(),
        EngineCapacity: parseFloat(document.getElementById("engineCapacity").value),
        Color: document.getElementById("color").value.trim(),
        ImageURL: document.getElementById("imageURL").value.trim(),
        Model: document.getElementById("model").value.trim(),
        UnitPrice: parseFloat(document.getElementById("unitPrice").value),
        BrandID: Number(document.getElementById("brandID").value),
        CategoryID: Number(document.getElementById("categoryID").value),
        StatusID: Number(document.getElementById("statusID").value)
    };


    // Kiểm tra dữ liệu nghiêm ngặt hơn
    if (!carData.CarName || !carData.FuelType || !carData.Transmission || !carData.Color ||
        !carData.ImageURL || !carData.Model || !isValidURL(carData.ImageURL)) {
        alert("Vui lòng nhập đầy đủ các trường chuỗi và đảm bảo ImageURL là một URL hợp lệ!");
        return;
    }


    if (isNaN(carData.Year) || carData.Year <= 0 || carData.Year > 2025 ||
        isNaN(carData.EngineCapacity) || carData.EngineCapacity <= 0 ||
        isNaN(carData.UnitPrice) || carData.UnitPrice <= 0 ||
        isNaN(carData.BrandID) || carData.BrandID <= 0 ||
        isNaN(carData.CategoryID) || carData.CategoryID <= 0 ||
        isNaN(carData.StatusID) || carData.StatusID <= 0) {
        alert("Vui lòng nhập đầy đủ và đúng định dạng các trường số! Năm phải từ 1886 đến 2025, các trường số phải lớn hơn 0.");
        return;
    }


    console.log('Dữ liệu gửi lên API POST:', carData);


    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Role": "Admin",
            "Authorization":  `Bearer ${token}`,
        },
        body: JSON.stringify(carData)
    })
    .then(response => {
        console.log('Phản hồi từ API POST:', response);
        if (response.ok) {
            return response.text();
        } else if (response.status === 403) {
            throw new Error("Forbidden: Missing or invalid Role header.");
        } else {
            return response.text().then(errorText => {
                throw new Error(`Error adding car: ${response.status} - ${response.statusText}. Details: ${errorText}`);
            });
        }
    })
    .then(message => {
        console.log('Thông báo từ server:', message);
        alert(message || "Thêm xe thành công!");
        const addModal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
        addModal.hide();
        document.getElementById("addCarForm").reset();


        // Lưu BrandID, CategoryID, StatusID vào localStorage với carId từ phản hồi nếu cần
        refreshCarList();
    })
    .catch(error => {
        console.error('Lỗi khi thêm xe:', error);
        alert(error.message);
    });
});


// Xử lý chỉnh sửa xe
document.getElementById("editCarForm").addEventListener("submit", function (event) {
    event.preventDefault();


    const carId = document.getElementById("editCarModelID").value;
    if (!carId) {
        alert("Không tìm thấy ID xe để cập nhật!");
        return;
    }


    const carData = {
        CarName: document.getElementById("editCarName").value.trim(),
        Year: parseInt(document.getElementById("editYear").value),
        FuelType: document.getElementById("editFuelType").value.trim(),
        Transmission: document.getElementById("editTransmission").value.trim(),
        EngineCapacity: parseFloat(document.getElementById("editEngineCapacity").value),
        Color: document.getElementById("editColor").value.trim(),
        ImageURL: document.getElementById("editImageURL").value.trim(),
        Model: document.getElementById("editModel").value.trim(),
        UnitPrice: parseFloat(document.getElementById("editUnitPrice").value),
        BrandID: parseInt(document.getElementById("editBrandID").value),
        CategoryID: parseInt(document.getElementById("editCategoryID").value),
        StatusID: parseInt(document.getElementById("editStatusID").value)
    };


    // Kiểm tra dữ liệu nghiêm ngặt hơn
    if (!carData.CarName ||
        isNaN(carData.Year) || carData.Year <= 0 ||
        isNaN(carData.EngineCapacity) || carData.EngineCapacity <= 0 ||
        isNaN(carData.UnitPrice) || carData.UnitPrice <= 0 ||
        isNaN(carData.BrandID) || carData.BrandID <= 0 ||
        isNaN(carData.CategoryID) || carData.CategoryID <= 0 ||
        isNaN(carData.StatusID) || carData.StatusID <= 0) {
        alert("Vui lòng nhập đầy đủ và đúng định dạng các trường dữ liệu! Các trường số phải lớn hơn 0.");
        return;
    }


    console.log('Dữ liệu gửi lên API PUT:', carData);


    fetch(`https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel/${carId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Role": "Admin"
        },
        body: JSON.stringify(carData)
    })
    .then(response => {
        console.log('Phản hồi từ API PUT:', response);
        if (response.ok) {
            return response.text();
        } else if (response.status === 403) {
            throw new Error("Forbidden: Missing or invalid Role header.");
        } else {
            return response.text().then(errorText => {
                throw new Error(`Error updating car: ${response.status} - ${response.statusText}. Details: ${errorText}`);
            });
        }
    })
    .then(message => {
        console.log('Thông báo từ server:', message);
        if (message) {
            alert(message || "Cập nhật xe thành công!");
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();


            // Lưu BrandID, CategoryID, StatusID vào localStorage
            localStorage.setItem(`BrandID_${carId}`, carData.BrandID);
            localStorage.setItem(`CategoryID_${carId}`, carData.CategoryID);
            localStorage.setItem(`StatusID_${carId}`, carData.StatusID);


            // Làm mới danh sách xe
            refreshCarList();


            // Kiểm tra dữ liệu API GET sau khi cập nhật
            fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel', {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Role': 'Admin'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Dữ liệu sau khi cập nhật:', data);
            });
        } else {
            throw new Error("Cập nhật xe không thành công: Không nhận được phản hồi hợp lệ từ server.");
        }
    })
    .catch(error => {
        console.error('Lỗi khi cập nhật xe:', error);
        alert(error.message);
    });
});

