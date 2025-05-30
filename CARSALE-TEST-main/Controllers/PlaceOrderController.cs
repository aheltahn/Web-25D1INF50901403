using CARSALE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;
using CARSALE.Services;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PlaceOrderController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IOrderService _orderService;

        public PlaceOrderController(IConfiguration configuration, IOrderService orderService)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderRequest request)
        {
            // Log header Authorization để debug
            var authHeader = Request.Headers["Authorization"].ToString();
            Console.WriteLine("Authorization header: " + authHeader);

            // Lấy UserID từ token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            Console.WriteLine("===== LIST CLAIMS FROM TOKEN =====");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"[CLAIM] {claim.Type} = {claim.Value}");
            }
            Console.WriteLine("===== END CLAIMS =====");
            Console.WriteLine("UserID from token: " + userIdClaim?.Value);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Cannot authorize." });
            }

            try
            {
                // Gọi OrderService để đặt hàng
                bool success = await _orderService.PlaceOrderAsync(request, userId);
                if (!success)
                {
                    return NotFound(new { message = "Cannot place order. Car or user not found." });
                }

                // Lấy OrderID vừa tạo
                string connectionString = _configuration.GetConnectionString("Database");
                if (string.IsNullOrEmpty(connectionString))
                    return BadRequest(new { message = "The connection string has not been initialized." });

                int newOrderId;
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    string orderIdSql = "SELECT MAX(OrderID) FROM Orders WHERE UserID = @UserID AND CarModelID = @CarModelID";
                    using (SqlCommand orderIdCmd = new SqlCommand(orderIdSql, connection))
                    {
                        orderIdCmd.Parameters.AddWithValue("@UserID", userId);
                        orderIdCmd.Parameters.AddWithValue("@CarModelID", request.CarModelID);
                        var result = await orderIdCmd.ExecuteScalarAsync();
                        if (result == null)
                            return StatusCode(500, new { message = "Failed to retrieve new order ID." });

                        newOrderId = Convert.ToInt32(result);
                    }
                    connection.Close();
                }

                return Ok(new
                {
                    message = "Order created.",
                    orderId = newOrderId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PlaceOrder: {ex.Message}");
                return BadRequest(new { message = $"System error: {ex.Message}" });
            }
        }
    }
}