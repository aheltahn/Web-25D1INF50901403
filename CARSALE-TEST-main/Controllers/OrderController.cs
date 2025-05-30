using CARSALE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using CARSALE.Attributes;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public OrderController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("{orderId}")]
        public IActionResult GetOrderById(int orderId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int tokenUserId))
            {
                return Unauthorized(new { message = "Cannot authorize." });
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            OrderDto2 order = null;
            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = @"
                        SELECT 
                            o.OrderID,
                            o.OrderDate,
                            o.TotalPrice,
                            o.Unit_Code,
                            o.UserID,
                            o.CarModelID,
                            o.OrderTrackingID,
                            ot.OrderStatus AS DeliveryStatus,
                            p.PaymentStatus,
                            u.Name AS UserName,
                            cm.CarName,
                            o.CreateDatetime
                        FROM Orders o
                        JOIN OrderTracking ot ON o.OrderTrackingID = ot.OrderTrackingID
                        LEFT JOIN PAYMENT p ON o.OrderID = p.OrderID
                        JOIN USERS u ON o.UserID = u.UserID
                        JOIN CarModel cm ON o.CarModelID = cm.CarModelID
                        WHERE o.OrderID = @OrderID";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@OrderID", orderId));
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                order = new OrderDto2
                                {
                                    OrderID = (int)reader["OrderID"],
                                    OrderDate = (DateTime)reader["OrderDate"],
                                    TotalPrice = (decimal)reader["TotalPrice"],
                                    Unit_Code = reader["Unit_Code"]?.ToString() ?? string.Empty,
                                    UserID = (int)reader["UserID"],
                                    CarModelID = (int)reader["CarModelID"],
                                    OrderTrackingID = (int)reader["OrderTrackingID"],
                                    OrderStatus = reader["DeliveryStatus"]?.ToString() ?? string.Empty,
                                    PaymentStatus = reader["PaymentStatus"]?.ToString() ?? string.Empty,
                                    CreateDatetime = (DateTime)reader["CreateDatetime"],
                                    UserName = reader["UserName"]?.ToString() ?? string.Empty,
                                    CarName = reader["CarName"]?.ToString() ?? string.Empty
                                };
                            }
                        }
                    }
                    connection.Close();
                }

                if (order == null)
                    return NotFound(new { message = "Order not found." });

                // Kiểm tra quyền: chỉ user sở hữu đơn hàng hoặc admin mới có thể xem
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (order.UserID != tokenUserId && userRole != "Admin")
                {
                    return Forbid();
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}