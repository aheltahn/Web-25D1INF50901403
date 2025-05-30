using CARSALE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] Users user)
        {
            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Check if email already exists
                    string checkSql = "SELECT COUNT(*) FROM USERS WHERE Email = @Email";
                    using (SqlCommand checkCmd = new SqlCommand(checkSql, connection))
                    {
                        checkCmd.Parameters.AddWithValue("@Email", user.Email);
                        int count = (int)checkCmd.ExecuteScalar();
                        if (count > 0)
                            return BadRequest(new { message = "Email already exists." });
                    }

                    // Kiểm tra giá trị Role
                    if (user.Role != "User" && user.Role != "Admin")
                        return BadRequest(new { message = "Invalid role. Role must be 'User' or 'Admin'." });

                    // Insert new user
                    string insertSql = @"
                        INSERT INTO USERS (Name, Address, PhoneNumber, Email, Password, Role)
                        VALUES (@Name, @Address, @PhoneNumber, @Email, @Password, @Role)";
                    using (SqlCommand insertCmd = new SqlCommand(insertSql, connection))
                    {
                        insertCmd.Parameters.AddWithValue("@Name", user.Name);
                        insertCmd.Parameters.AddWithValue("@Address", user.Address);
                        insertCmd.Parameters.AddWithValue("@PhoneNumber", user.PhoneNumber);
                        insertCmd.Parameters.AddWithValue("@Email", user.Email);
                        insertCmd.Parameters.AddWithValue("@Password", user.Password);
                        insertCmd.Parameters.AddWithValue("@Role", "User");

                        Console.WriteLine($"Executing SQL: {insertSql}");
                        Console.WriteLine($"Parameters: Name={user.Name}, Email={user.Email}, Role=User");

                        insertCmd.ExecuteNonQuery();
                    }

                    connection.Close();
                }

                return Ok(new { message = "Registration successful!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "SELECT UserID, Email, Password, Role FROM USERS WHERE Email = @Email AND Password = @Password";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.AddWithValue("@Email", request.Email);
                        cmd.Parameters.AddWithValue("@Password", request.Password);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                int userId = reader.GetInt32(reader.GetOrdinal("UserID"));
                                string email = reader.GetString(reader.GetOrdinal("Email"));
                                string role = reader.GetString(reader.GetOrdinal("Role"));

                                // Tạo token JWT
                                var token = GenerateJwtToken(userId, email, role);

                                return Ok(new
                                {
                                    message = "Đăng nhập thành công!",
                                    token = token,
                                    userId = userId,
                                    role = role
                                });
                            }
                            else
                            {
                                return Unauthorized(new { message = "Sai email hoặc mật khẩu." });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private string GenerateJwtToken(int userId, string email, string role)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiresInMinutes"])),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("SessionId");
            return Ok(new { message = "Logout successful!" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}