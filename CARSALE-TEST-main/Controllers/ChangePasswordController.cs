using CARSALE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChangePasswordController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ChangePasswordController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpPut("{id}")]
        public IActionResult ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "User không xác định." });

            if (!int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(new { message = "UserID trong token không hợp lệ." });

            if (userId != id && User.FindFirst(ClaimTypes.Role)?.Value != "Admin")
                return Forbid();

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // Kiểm tra mật khẩu cũ
                    string checkSql = "SELECT Password FROM USERS WHERE UserID = @UserID";
                    using (SqlCommand checkCmd = new SqlCommand(checkSql, conn))
                    {
                        checkCmd.Parameters.AddWithValue("@UserID", id);
                        var existingPassword = checkCmd.ExecuteScalar()?.ToString();

                        if (existingPassword == null)
                            return NotFound(new { message = "User not found." });

                        if (existingPassword != request.OldPassword)
                            return BadRequest(new { message = "Old password is incorrect." });
                    }

                    // Cập nhật mật khẩu mới
                    string updateSql = "UPDATE USERS SET Password = @NewPassword WHERE UserID = @UserID";
                    using (SqlCommand updateCmd = new SqlCommand(updateSql, conn))
                    {
                        updateCmd.Parameters.AddWithValue("@UserID", id);
                        updateCmd.Parameters.AddWithValue("@NewPassword", request.NewPassword);
                        int rowsAffected = updateCmd.ExecuteNonQuery();

                        if (rowsAffected == 0)
                            return NotFound(new { message = "User not found or password not updated." });
                    }
                }

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}