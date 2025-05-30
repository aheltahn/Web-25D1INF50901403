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
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ViewOrderHistoryController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ViewOrderHistoryController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [AllowAnonymous]
        [HttpGet("ping")]
        public IActionResult Ping() => Ok("pong");

        [HttpGet]
        public IActionResult GetOrderHistory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User không xác định." });
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            List<OrderDto2> orders = new List<OrderDto2>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string sql = @"
                        SELECT 
                            o.OrderID,
                            o.OrderDate,
                            o.TotalPrice,
                            o.Unit_Code,
                            o.UserID,
                            o.CarModelID,
                            o.OrderTrackingID,
                            ot.OrderStatus,
                            p.PaymentStatus,
                            u.Name AS UserName,
                            cm.CarName,
                            o.CreateDatetime
                        FROM Orders o
                        JOIN OrderTracking ot ON o.OrderTrackingID = ot.OrderTrackingID
                        LEFT JOIN PAYMENT p ON o.OrderID = p.OrderID
                        JOIN USERS u ON o.UserID = u.UserID
                        JOIN CarModel cm ON o.CarModelID = cm.CarModelID
                        WHERE o.UserID = @UserID 
                        AND (o.OrderTrackingID = 4 OR o.OrderTrackingID = 5)";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.Add(new SqlParameter("@UserID", userId));
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                string userName = reader["UserName"]?.ToString();
                                string carName = reader["CarName"]?.ToString();

                                // Kiểm tra dữ liệu rỗng
                                if (string.IsNullOrEmpty(userName))
                                    return BadRequest(new { message = $"User with UserID {userId} does not have a valid name." });
                                if (string.IsNullOrEmpty(carName))
                                    return BadRequest(new { message = $"Car with CarModelID {(int)reader["CarModelID"]} does not have a valid name." });

                                orders.Add(new OrderDto2
                                {
                                    OrderID = (int)reader["OrderID"],
                                    OrderDate = (DateTime)reader["OrderDate"],
                                    TotalPrice = (decimal)reader["TotalPrice"],
                                    Unit_Code = reader["Unit_Code"]?.ToString() ?? string.Empty,
                                    UserID = (int)reader["UserID"],
                                    CarModelID = (int)reader["CarModelID"],
                                    OrderTrackingID = (int)reader["OrderTrackingID"],
                                    OrderStatus = reader["OrderStatus"]?.ToString() ?? string.Empty,
                                    PaymentStatus = reader["PaymentStatus"]?.ToString() ?? string.Empty,
                                    CreateDatetime = (DateTime)reader["CreateDatetime"],
                                    UserName = userName,
                                    CarName = carName
                                });
                            }
                        }
                    }

                    conn.Close();
                }

                if (orders.Count == 0)
                    return NotFound(new { message = "You don't have any completed or cancelled orders." });

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}