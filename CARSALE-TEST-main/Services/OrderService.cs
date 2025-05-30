using CARSALE.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace CARSALE.Services
{
    public class OrderService : IOrderService
    {
        private readonly IConfiguration _configuration;

        public OrderService(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<bool> PlaceOrderAsync(OrderRequest request, int userId)
        {
            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                throw new InvalidOperationException("The connection string has not been initialized.");

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Kiểm tra xem UserID có tồn tại không
                string userCheckSql = "SELECT COUNT(*) FROM USERS WHERE UserID = @UserID";
                using (SqlCommand userCheckCmd = new SqlCommand(userCheckSql, connection))
                {
                    userCheckCmd.Parameters.AddWithValue("@UserID", userId);
                    int userCount = (int)await userCheckCmd.ExecuteScalarAsync();
                    if (userCount == 0)
                        return false;
                }

                // Lấy giá xe theo CarModelID
                decimal unitPrice = 0;
                string priceSql = "SELECT UnitPrice FROM CarModel WHERE CarModelID = @CarModelID AND IsHidden = 0";
                using (SqlCommand priceCmd = new SqlCommand(priceSql, connection))
                {
                    priceCmd.Parameters.AddWithValue("@CarModelID", request.CarModelID);
                    var result = await priceCmd.ExecuteScalarAsync();
                    if (result == null)
                        return false;
                    unitPrice = Convert.ToDecimal(result);
                }

                // Chèn đơn hàng
                string insertSql = @"
                    INSERT INTO ORDERS (OrderDate, TotalPrice, Unit_Code, UserID, CarModelID, OrderTrackingID, CreateDatetime)
                    VALUES (@OrderDate, @TotalPrice, @Unit_Code, @UserID, @CarModelID, @OrderTrackingID, @CreateDatetime)";
                using (SqlCommand insertCmd = new SqlCommand(insertSql, connection))
                {
                    DateTime now = DateTime.Now;
                    insertCmd.Parameters.AddWithValue("@OrderDate", now);
                    insertCmd.Parameters.AddWithValue("@TotalPrice", unitPrice);
                    insertCmd.Parameters.AddWithValue("@Unit_Code", "VND");
                    insertCmd.Parameters.AddWithValue("@UserID", userId);
                    insertCmd.Parameters.AddWithValue("@CarModelID", request.CarModelID);
                    insertCmd.Parameters.AddWithValue("@OrderTrackingID", 1);
                    insertCmd.Parameters.AddWithValue("@CreateDatetime", now);

                    await insertCmd.ExecuteNonQueryAsync();
                }
            }
            return true;
        }
    }
}