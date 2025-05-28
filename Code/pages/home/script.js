

//Hiển thị danh sách sản phẩm
document.addEventListener("DOMContentLoaded", function () {
  fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
      .then(response => response.json())
      .then(data => {
          renderRecommendedCars(data);
      })
      .catch(error => {
          console.error("Error fetching recommended cars:", error);
      });

  function renderRecommendedCars(cars) {
      const container = document.getElementById("recommendedCars");
      container.innerHTML = "";
      
      // Tạo dòng chứa các thẻ
      const row = document.createElement("div");
      row.className = "row";

      cars.forEach(car => {
          const card = document.createElement("div");
          card.className = "col-lg-4 col-md-6 col-sm-12 mb-4"; // mỗi hàng 3 thẻ

          card.innerHTML = `
              <div class="card shadow custom-card h-100">
                  <div class="position-relative ratio" style="--bs-aspect-ratio: 60%;">
                      <img src="${car.image || 'https://via.placeholder.com/400x250?text=No+Image'}"
                          class="card-img-top" alt="${car.name}" style="object-fit: cover;">
                  </div>
                  <div class="card-body">
                      <h5 class="card-title mt-2">${car.name}</h5>
                      <h4 class="text-info">${car.price ? `$${Number(car.price).toLocaleString()}` : 'N/A'}</h4>

                      <div class="row">
                          <div class="col-6">
                              <p><i class="fa-solid fa-calendar text-info me-2"></i>Year: ${car.year || 'N/A'}</p>
                          </div>
                          <div class="col-6">
                              <p><i class="fa-solid fa-gas-pump text-info me-2"></i>Fuel: ${car.fuel || 'N/A'}</p>
                          </div>
                      </div>

                      <div class="row">
                          <div class="col-6">
                              <p><i class="fa-solid fa-gauge-high text-info me-2"></i>Engine: ${car.engine || 'N/A'}</p>
                          </div>
                          <div class="col-6">
                              <p><i class="fa-solid fa-palette text-info me-2"></i>Color: ${car.color || 'N/A'}</p>
                          </div>
                      </div>

                      <div class="row">
                          <div class="col-12">
                              <p><i class="fa-solid fa-cogs text-info me-2"></i>Transmission: ${car.transmission || 'N/A'}</p>
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
});

document.getElementById("search-addon").addEventListener("click", function () {
  const keyword = document.getElementById("searchInput").value.trim();

  if (keyword === "") {
      alert("Vui lòng nhập từ khóa để tìm kiếm.");
      return;
  }

  const url = `https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/CarSearch/search?keyword=${encodeURIComponent(keyword)}&brandName=${encodeURIComponent(keyword)}`;

  fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error(`Lỗi API: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          renderSearchedCars(data);
      })
      .catch(error => {
          console.error("Lỗi khi lấy kết quả tìm kiếm:", error);
          document.getElementById("recommendedCars").innerHTML = '<p class="text-white">Có lỗi xảy ra. Vui lòng thử lại sau.</p>';
      });
});

//Tìm kiếm
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("recommendedCars");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("search-addon");

  // Kiểm tra sự tồn tại của các phần tử
  if (!container || !searchInput || !searchButton) {
      console.error("Không tìm thấy phần tử cần thiết: recommendedCars, searchInput, hoặc search-addon");
      return;
  }

  // Hiển thị thông báo "Đang tải..." khi bắt đầu
  container.innerHTML = '<p class="text-white text-center">Đang tải danh sách xe...</p>';

  // Hiển thị danh sách xe đề xuất ban đầu
  fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
      .then(response => {
          if (!response.ok) {
              throw new Error(`Lỗi API: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          renderCars(data, container);
      })
      .catch(error => {
          console.error("Lỗi khi lấy danh sách xe đề xuất:", error);
          container.innerHTML = '<p class="text-white text-center">Không thể tải danh sách xe. Vui lòng thử lại sau.</p>';
      });

  // Debounce để hạn chế số lần gọi API khi người dùng nhập nhanh
  let debounceTimer;
  const debounce = (func, delay) => {
      return (...args) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => func.apply(this, args), delay);
      };
  };

  // Hàm tìm kiếm
  const performSearch = () => {
      console.log("Bắt đầu tìm kiếm...");
      const keyword = searchInput.value.trim();

      if (keyword === "") {
          // Nếu từ khóa rỗng, hiển thị lại danh sách xe đề xuất
          container.innerHTML = '<p class="text-white text-center">Đang tải danh sách xe...</p>';
          fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/RecommendedCars")
              .then(response => {
                  if (!response.ok) {
                      throw new Error(`Lỗi API: ${response.status}`);
                  }
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

      // Hiển thị thông báo "Đang tìm kiếm..." khi bắt đầu
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
          console.log('Kết quả tìm kiếm:', data);
          if (!data || typeof data !== 'object') {
              throw new Error("Dữ liệu trả về không hợp lệ");
          }
          const carList = Array.isArray(data) ? data : data.results || [];
          renderCars(carList, container);
      })
      .catch(error => {
          console.error("Lỗi khi lấy kết quả tìm kiếm:", error);
          container.innerHTML = '<p class="text-white text-center">Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.</p>';
      });
  };

  // Sự kiện tìm kiếm tự động khi người dùng nhập
  searchInput.addEventListener("input", debounce(performSearch, 500));

  // Sự kiện tìm kiếm khi nhấn nút
  searchButton.addEventListener("click", performSearch);

  // Sự kiện tìm kiếm khi nhấn Enter
  searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
          performSearch();
      }
  });

  // Hàm chung để hiển thị danh sách xe
  function renderCars(cars, container) {
      container.innerHTML = "";

      if (!Array.isArray(cars) || cars.length === 0) {
          container.innerHTML = '<p class="text-white text-center">Không tìm thấy xe nào.</p>';
          return;
      }

      const row = document.createElement("div");
      row.className = "row";

      cars.forEach(car => {
          const card = document.createElement("div");
          card.className = "col-lg-4 col-md-6 col-sm-12 mb-4";

          card.innerHTML = `
              <div class="card shadow custom-card h-100">
                  <div class="position-relative ratio" style="--bs-aspect-ratio: 60%;">
                      <img src="${car.image || car.Image || 'https://via.placeholder.com/400x250?text=No+Image'}"
                          class="card-img-top" alt="${car.name || car.carName || 'Unknown'}" style="object-fit: cover;">
                  </div>
                  <div class="card-body">
                      <h5 class="card-title mt-2">${car.name || car.carName || 'Unknown'}</h5>
                      <h4 class="text-info">${car.price ? '$' + Number(car.price).toLocaleString() : 'N/A'}</h4>
                      <div class="row">
                          <div class="col-6">
                              <p><i class="fa-solid fa-calendar text-info me-2"></i>Year: ${car.year || car.Year || 'N/A'}</p>
                          </div>
                          <div class="col-6">
                              <p><i class="fa-solid fa-gas-pump text-info me-2"></i>Fuel: ${car.fuel || car.Fuel || 'N/A'}</p>
                          </div>
                      </div>
                      <div class="row">
                          <div class="col-6">
                              <p><i class="fa-solid fa-gauge-high text-info me-2"></i>Engine: ${car.engine || car.Engine || 'N/A'}</p>
                          </div>
                          <div class="col-6">
                              <p><i class="fa-solid fa-palette text-info me-2"></i>Color: ${car.color || car.Color || 'N/A'}</p>
                          </div>
                      </div>
                      <div class="row">
                          <div class="col-12">
                              <p><i class="fa-solid fa-cogs text-info me-2"></i>Transmission: ${car.transmission || car.Transmission || 'N/A'}</p>
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
});

