document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
  
    if (password !== confirmPassword) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }
  
    const data = {
      Name: name,
      Address: address,
      PhoneNumber: phoneNumber,
      Email: email,
      Password: password,
      Role: role
    };
  
    fetch("https://carssaleweb-ghb6hjdmhuajejad.southeastasia-01.azurewebsites.net/api/Auth/Register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Đăng ký thất bại");
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message || "Đăng ký thành công!");
        // Chuyển hướng nếu cần:
        // window.location.href = "/login.html";
      })
      .catch((error) => {
        alert("Lỗi: " + error.message);
      });
  });
  