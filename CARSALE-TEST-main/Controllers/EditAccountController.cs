using CARSALE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // Bắt buộc xác thực mới được truy cập
    public class EditAccountController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public EditAccountController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpPut]
        public IActionResult UpdateUser([FromBody] Users updatedUser)
        {
            // Debug: In header Authorization ra console để kiểm tra
            var authHeader = Request.Headers["Authorization"].ToString();
            Console.WriteLine("Authorization header: " + authHeader);

            // Lấy claim UserID từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            Console.WriteLine("UserID from token: " + userIdClaim?.Value);

            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User không xác định." });
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "UserID trong token không hợp lệ." });
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
            {
                return BadRequest("The connection string has not been initialized.");
            }

            // Kiểm tra định dạng PhoneNumber (10 chữ số liên tục)
            if (!string.IsNullOrEmpty(updatedUser.PhoneNumber) && !Regex.IsMatch(updatedUser.PhoneNumber, @"^\d{10}$"))
            {
                return BadRequest(new { message = "Phone number must be exactly 10 digits." });
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string sql = @"
                        UPDATE USERS 
                        SET Name = @Name, Address = @Address, PhoneNumber = @PhoneNumber, Email = @Email
                        WHERE UserID = @UserID AND Role = 'User'";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserID", userId);
                        cmd.Parameters.AddWithValue("@Name", updatedUser.Name ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Address", updatedUser.Address ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@PhoneNumber", updatedUser.PhoneNumber ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Email", updatedUser.Email ?? (object)DBNull.Value);

                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected == 0)
                        {
                            return NotFound(new { message = "User not found for update." });
                        }
                    }
                }

                return Ok(new { message = "User information updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}



