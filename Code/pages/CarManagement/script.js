//Hiển thị danh sách
// Hàm định dạng tiền USD
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Hiển thị danh sách xe
document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.getElementById('car-table-body');
    if (!tbody) {
        console.error("Không tìm thấy phần tử với id 'car-table-body'");
        return;
    }

    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Đang tải dữ liệu...</td></tr>`;

    fetch('https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel', {
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
        console.log('Dữ liệu từ API:', data);
        tbody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">Không có dữ liệu xe.</td></tr>`;
            return;
        }

        data.forEach((car, index) => {
            const statusClass = car.StatusName && typeof car.StatusName === 'string' && car.StatusName.toLowerCase() === 'available' ? 'bg-success' : 'bg-secondary';
            const row = `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>${index + 1}</td>
                    <td class="d-flex align-items-center gap-3">
                        <div class="rounded overflow-hidden" style="width: 100px; height: 100px;">
                            <img src="${car.ImageURL || car.image || 'https://via.placeholder.com/100?text=No+Image'}" 
                                 class="img-fluid object-fit-cover" 
                                 alt="${car.CarName || car.name || 'Unknown'}">
                        </div>
                        <span class="fw-bold">${car.CarName || car.name || 'Unknown'}</span>
                    </td>
                    <td>${car.Year || car.year || 'N/A'}-01-01</td>
                    <td>${car.UnitPrice ? formatCurrency(car.UnitPrice) : 'N/A'}</td>
                    <td><span class="badge text-white ${statusClass}">${car.StatusName || 'Unknown'}</span></td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editModal" data-id="${car.CarModelID || ''}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#viewModal" data-id="${car.CarModelID || ''}">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" data-id="${car.CarModelID || ''}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    })
    .catch(error => {
        console.error('Lỗi khi gọi API:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Không thể tải dữ liệu xe: ${error.message}</td>
            </tr>
        `;
    });
});

// Thêm xe (giữ nguyên mã hiện tại)
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

    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Role": "Admin"
        },
        body: JSON.stringify(carData)
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else if (response.status === 403) {
            throw new Error("Forbidden: Missing or invalid Role header.");
        } else {
            throw new Error("Error adding car.");
        }
    })
    .then(message => {
        alert(message);
        const addModal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
        addModal.hide();
        document.getElementById("addCarForm").reset();

        // Gọi lại API để làm mới danh sách
        document.dispatchEvent(new Event('DOMContentLoaded'));
    })
    .catch(error => {
        alert(error.message);
        console.error(error);
    });
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

    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarModel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Role": "Admin"
        },
        body: JSON.stringify(carData)
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else if (response.status === 403) {
                throw new Error("Forbidden: Missing or invalid Role header.");
            } else {
                throw new Error("Error adding car.");
            }
        })
        .then(message => {
            alert(message);
            const addModal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
            addModal.hide();
            document.getElementById("addCarForm").reset();

            // Gọi lại API để làm mới danh sách
            document.dispatchEvent(new Event('DOMContentLoaded'));
        })
        .catch(error => {
            alert(error.message);
            console.error(error);
        });
});