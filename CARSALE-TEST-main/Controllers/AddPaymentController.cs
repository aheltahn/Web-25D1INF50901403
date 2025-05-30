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
    public class AddPaymentController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AddPaymentController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpPost]
        public IActionResult AddPayment([FromBody] PaymentRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int tokenUserId))
            {
                return Unauthorized(new { message = "Cannot Authorize." });
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
            {
                return BadRequest("The connection string has not been initialized.");
            }

            try
            {
                int newPaymentId;
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    // Xác thực xem Order đó có thuộc về user đang đăng nhập không
                    string getOrderSql = "SELECT UserID, Unit_Code FROM Orders WHERE OrderID = @OrderID";
                    int orderOwnerId = 0;
                    string unitCode = "";

                    using (SqlCommand getCmd = new SqlCommand(getOrderSql, conn))
                    {
                        getCmd.Parameters.Add(new SqlParameter("@OrderID", request.OrderID));
                        using (SqlDataReader reader = getCmd.ExecuteReader())
                        {
                            if (!reader.Read())
                                return NotFound(new { message = "Cannot find order." });

                            orderOwnerId = Convert.ToInt32(reader["UserID"]);
                            unitCode = reader["Unit_Code"]?.ToString() ?? string.Empty;
                        }
                    }

                    if (orderOwnerId != tokenUserId)
                        return Forbid();

                    // Kiểm tra xem OrderID đã có bản ghi thanh toán chưa
                    string checkPaymentSql = "SELECT COUNT(*) FROM PAYMENT WHERE OrderID = @OrderID";
                    using (SqlCommand checkCmd = new SqlCommand(checkPaymentSql, conn))
                    {
                        checkCmd.Parameters.Add(new SqlParameter("@OrderID", request.OrderID));
                        int paymentCount = (int)checkCmd.ExecuteScalar();
                        if (paymentCount > 0)
                            return BadRequest(new { message = "Order already has a payment method. Each order can only have one payment." });
                    }

                    // Thêm thông tin thanh toán và lấy PaymentID vừa tạo
                    string insertSql = @"
                        INSERT INTO PAYMENT (OrderID, PaymentDate, Unit_Code, PaymentMethod, PaymentStatus, TransactionCode, UserID)
                        OUTPUT INSERTED.PaymentID
                        VALUES (@OrderID, @PaymentDate, @Unit_Code, @PaymentMethod, @PaymentStatus, @TransactionCode, @UserID)";

                    using (SqlCommand insertCmd = new SqlCommand(insertSql, conn))
                    {
                        insertCmd.Parameters.Add(new SqlParameter("@OrderID", request.OrderID));
                        insertCmd.Parameters.Add(new SqlParameter("@PaymentDate", DateTime.Now));
                        insertCmd.Parameters.Add(new SqlParameter("@Unit_Code", unitCode));
                        insertCmd.Parameters.Add(new SqlParameter("@PaymentMethod", request.PaymentMethod));
                        insertCmd.Parameters.Add(new SqlParameter("@PaymentStatus", "Pending"));
                        insertCmd.Parameters.Add(new SqlParameter("@TransactionCode", request.TransactionCode));
                        insertCmd.Parameters.Add(new SqlParameter("@UserID", tokenUserId));

                        newPaymentId = (int)insertCmd.ExecuteScalar();
                    }

                    conn.Close();
                }

                return Ok(new { message = "Phương thức thanh toán đã được thêm thành công.", paymentId = newPaymentId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}