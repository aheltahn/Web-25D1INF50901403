using CARSALE.Attributes;
using CARSALE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public NotificationController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // POST: /api/Notification/Send - Gửi thông báo đến user (chỉ admin)
        [HttpPost("Send")]
        [AdminAuthorize]
        public IActionResult Send([FromBody] Notification notification)
        {
            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
            {
                return BadRequest("The connection string has not been initialized.");
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Kiểm tra xem UserID có tồn tại không
                    string userCheckSql = "SELECT COUNT(*) FROM USERS WHERE UserID = @UserID";
                    using (SqlCommand userCheckCmd = new SqlCommand(userCheckSql, connection))
                    {
                        userCheckCmd.Parameters.Add(new SqlParameter("@UserID", notification.UserID));
                        int userCount = (int)userCheckCmd.ExecuteScalar();
                        if (userCount == 0)
                            return NotFound(new { message = "User not found." });
                    }

                    // Thêm thông báo
                    string sql = @"
                        INSERT INTO NOTIFICATION (Title, Content, SentDate, UserID, IsRead, CreateDatetime)
                        VALUES (@Title, @Content, GETDATE(), @UserID, 0, GETDATE())";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@Title", notification.Title));
                        command.Parameters.Add(new SqlParameter("@Content", notification.Content));
                        command.Parameters.Add(new SqlParameter("@UserID", notification.UserID));
                        command.ExecuteNonQuery();
                    }
                    connection.Close();
                }
                return Ok("The notification has been sent successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/Notification/MarkAsRead/{notificationId} - Đánh dấu thông báo đã đọc
        [HttpPut("MarkAsRead/{notificationId}")]
        public IActionResult MarkAsRead(int notificationId)
        {
            // Lấy UserID từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Cannot authorize." });
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
            {
                return BadRequest("The connection string has not been initialized.");
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Kiểm tra xem thông báo có thuộc về user không
                    string checkSql = "SELECT UserID FROM NOTIFICATION WHERE NotificationID = @NotificationID";
                    int notificationUserId;
                    using (SqlCommand checkCmd = new SqlCommand(checkSql, connection))
                    {
                        checkCmd.Parameters.Add(new SqlParameter("@NotificationID", notificationId));
                        var result = checkCmd.ExecuteScalar();
                        if (result == null)
                            return NotFound(new { message = "Notification not found." });

                        notificationUserId = Convert.ToInt32(result);
                    }

                    // Chỉ user sở hữu thông báo hoặc admin mới có thể đánh dấu đã đọc
                    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                    if (notificationUserId != userId && userRole != "Admin")
                    {
                        return Forbid();
                    }

                    // Cập nhật IsRead
                    string sql = @"
                        UPDATE NOTIFICATION
                        SET IsRead = 1
                        WHERE NotificationID = @NotificationID";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@NotificationID", notificationId));
                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                            return Ok("Notification marked as read.");
                        else
                            return NotFound("Notification not found.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: /api/Notification/User/{userId} - Lấy danh sách thông báo của user
        [HttpGet("User/{userId}")]
        public IActionResult GetNotifications(int userId)
        {
            // Lấy UserID từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int tokenUserId))
            {
                return Unauthorized(new { message = "Cannot authorize." });
            }

            // Chỉ user sở hữu thông báo hoặc admin mới có thể xem
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userId != tokenUserId && userRole != "Admin")
            {
                return Forbid();
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            List<Notification> notifications = new List<Notification>();
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "SELECT * FROM NOTIFICATION WHERE UserID = @UserID";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@UserID", userId));
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                notifications.Add(new Notification
                                {
                                    NotificationID = reader.GetInt32(reader.GetOrdinal("NotificationID")),
                                    Title = reader.GetString(reader.GetOrdinal("Title")),
                                    Content = reader.GetString(reader.GetOrdinal("Content")),
                                    SentDate = reader.GetDateTime(reader.GetOrdinal("SentDate")),
                                    UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                                    IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead"))
                                });
                            }
                        }
                    }
                    connection.Close();
                }
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}