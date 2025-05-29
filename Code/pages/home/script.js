document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;
  
  
    // Lấy user từ localStorage (đồng bộ tất cả tab)
    let user = JSON.parse(localStorage.getItem('user'));
  
  
  
  
    // Đồng bộ logout giữa các tab qua sự kiện localStorage
    window.addEventListener('storage', function (e) {
      if (e.key === 'logout-event') {
        localStorage.removeItem('user');
        window.location.href = '../login/index.html';
      }
    });
  
  
    // Các nút UI
    const logInBtn = document.getElementsByName('logInBtn')[0];
    const registerBtn = document.getElementsByName('registerBtn')[0];
    const logOutBtn = document.getElementsByName('logOutBtn')[0];
  
  
    function updateUI() {
      let user = JSON.parse(localStorage.getItem('user'));
      if (user && user.UserID) {
        if (logInBtn) logInBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logOutBtn) logOutBtn.style.display = 'inline-block';
      } else {
        if (logInBtn) logInBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (logOutBtn) logOutBtn.style.display = 'none';
      }
    }
  
  
    if (logInBtn) {
      logInBtn.addEventListener('click', () => {
        // Nếu đã login thì không cho vào trang login nữa
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
          alert('Bạn đã đăng nhập rồi!');
          return;
        }
        window.location.href = '../login/index.html';
      });
    }
  
  
    if (logOutBtn) {
      logOutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        updateUI();
        localStorage.setItem('logout-event', Date.now());
        window.location.href = '../login/index.html';
      });
    }
  
  
    window.onLoginSuccess = function (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      updateUI();
    };
  
  
    updateUI();
  
  
    // --- Hàm kiểm tra URL hợp lệ ---
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
  
  
    // --- Hiển thị danh sách xe đề xuất ---
    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
      .then(response => response.json())
      .then(data => {
        renderRecommendedCars(data);
      })
      .catch(error => {
        console.error("Error fetching recommended cars:", error);
        const container = document.getElementById("recommendedCars");
        if (container) {
          container.innerHTML = '<p class="text-white text-center">Có lỗi xảy ra. Vui lòng thử lại sau.</p>';
        }
      });
  
  
    function renderRecommendedCars(cars) {
      const container = document.getElementById("recommendedCars");
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
        const imageUrl = car.ImageURL || car.imageURL || car.image || car.Image || car.img || car.imageUrl || (car.Car && (car.Car.ImageURL || car.Car.image)) || 'https://via.placeholder.com/400x250?text=No+Image';
        const validImageUrl = imageUrl && isValidUrl(imageUrl) ? (imageUrl.match(/^https?:\/\//) ? imageUrl : `https://${imageUrl}`) : 'https://via.placeholder.com/400x250?text=No+Image';
        const carName = car.name || car.Name || car.carName || (car.Car && (car.Car.name || car.Car.CarName)) || 'N/A';
        const price = car.price || car.Price || car.unitPrice || car.UnitPrice || null;
        const year = car.year || car.Year || 'N/A';
        const fuel = car.fuel || car.Fuel || car.FuelType || car.fuelType || 'N/A';
        const engine = car.engine || car.Engine || car.EngineCapacity || car.engineCapacity || 'N/A';
        const color = car.color || car.Color || 'N/A';
        const transmission = car.transmission || car.Transmission || 'N/A';
  
  
        const card = document.createElement("div");
        card.className = "col-lg-4 col-md-6 col-sm-12 mb-4";
  
  
        card.innerHTML = `
          <div class="card shadow custom-card h-100">
            <div class="position-relative ratio" style="--bs-aspect-ratio: 60%;">
              <img src="${validImageUrl}" class="card-img-top" alt="${carName}" style="object-fit: cover;">
            </div>
            <div class="card-body">
              <h5 class="card-title mt-2">${carName}</h5>
              <h4 class="text-info">${price !== undefined && price !== null && !isNaN(price) ? '$' + Number(price).toLocaleString() : 'N/A'}</h4>
              <div class="row">
                <div class="col-6">
                  <p><i class="fa-solid fa-calendar text-info me-2"></i>Year: ${year}</p>
                </div>
                <div class="col-6">
                  <p><i class="fa-solid fa-gas-pump text-info me-2"></i>Fuel: ${fuel}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-6">
                  <p><i class="fa-solid fa-gauge-high text-info me-2"></i>Engine: ${engine}</p>
                </div>
                <div class="col-6">
                  <p><i class="fa-solid fa-palette text-info me-2"></i>Color: ${color}</p>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <p><i class="fa-solid fa-cogs text-info me-2"></i>Transmission: ${transmission}</p>
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
                <span class="text-white">(12 Reviews)</span>
              </div>
            </div>
          </div>
        `;
        row.appendChild(card);
      });
  
  
      container.appendChild(row);
    }
  
  
    // --- Xử lý tìm kiếm ---
    const container = document.getElementById("recommendedCars");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("search-addon");
  
  
    if (!container || !searchInput || !searchButton) {
      console.error("Không tìm thấy phần tử cần thiết: recommendedCars, searchInput, hoặc search-addon");
      return;
    }
  
  
    container.innerHTML = '<p class="text-white text-center">Đang tải danh sách xe...</p>';
  
  
    function debounce(func, delay) {
      let debounceTimer;
      return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
      }
    }
  
  
    const performSearch = () => {
      const keyword = searchInput.value.trim();
  
  
      if (keyword === "") {
        container.innerHTML = '<p class="text-white text-center">Đang tải danh sách xe...</p>';
        fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
          .then(response => {
            if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
            return response.json();
          })
          .then(data => {
            renderCars(data, container);
          })
          .catch(error => {
            console.error("Lỗi khi lấy danh sách xe đề xuất:", error);
            container.innerHTML = '<p class="text-white text-center">Không thể tải danh sách xe. Vui lòng thử lại sau.</p>';
          });
        return;
      }
  
  
      container.innerHTML = '<p class="text-white text-center">Đang tìm kiếm...</p>';
  
  
      const url = `https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarSearch/search?keyword=${encodeURIComponent(keyword)}&brandName=${encodeURIComponent(keyword)}`;
  
  
      fetch(url, { headers: { 'Role': 'Admin' } })
        .then(response => {
          if (!response.ok) throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
          return response.json();
        })
        .then(data => {
          const carList = Array.isArray(data) ? data : data.results || [];
          renderCars(carList, container);
        })
        .catch(error => {
          console.error("Lỗi khi lấy kết quả tìm kiếm:", error);
          container.innerHTML = '<p class="text-white text-center">Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.</p>';
        });
    };
  
  
    const debouncedSearch = debounce(performSearch, 500);
  
  
    searchInput.addEventListener("input", debouncedSearch);
    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") performSearch();
    });
  });
  
  
  
  