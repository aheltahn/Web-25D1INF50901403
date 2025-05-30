using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using CARSALE.Models;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesReportController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SalesReportController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("GetSalesReport")]
        public IActionResult GetSalesReport()
        {
            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            SalesSummary summary = new SalesSummary();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Tổng doanh thu, số đơn hàng hoàn thành và hủy
                    string sqlSummary = @"
                        SELECT 
                            SUM(CAST(TotalPrice AS DECIMAL(18, 2))) AS TotalRevenue,
                            COUNT(*) AS TotalOrders,
                            SUM(CASE WHEN OrderTrackingID = 4 THEN 1 ELSE 0 END) AS CompletedOrders,
                            SUM(CASE WHEN OrderTrackingID = 5 THEN 1 ELSE 0 END) AS CanceledOrders
                        FROM ORDERS";
                    using (SqlCommand command = new SqlCommand(sqlSummary, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                summary.TotalRevenue = reader.IsDBNull(reader.GetOrdinal("TotalRevenue")) ? 0 : reader.GetDecimal(reader.GetOrdinal("TotalRevenue"));
                                summary.TotalOrders = reader.GetInt32(reader.GetOrdinal("TotalOrders"));
                                summary.CompletedOrders = reader.GetInt32(reader.GetOrdinal("CompletedOrders"));
                                summary.CanceledOrders = reader.GetInt32(reader.GetOrdinal("CanceledOrders"));

                                // Tính tổng số đơn liên quan (chỉ tính đơn hoàn thành và hủy)
                                decimal relevantOrders = summary.CompletedOrders + summary.CanceledOrders;

                                // Làm tròn 2 số thập phân
                                summary.CompletionRate = relevantOrders > 0 ? decimal.Round(summary.CompletedOrders * 100.0m / relevantOrders, 2) : 0;
                                summary.CancellationRate = relevantOrders > 0 ? decimal.Round(summary.CanceledOrders * 100.0m / relevantOrders, 2) : 0;
                            }
                        }
                    }

                    // Xe bán chạy nhất (theo số lượng)
                    string sqlTopSellingCar = @"
                        SELECT TOP 1 
                            cm.CarName, 
                            COUNT(o.OrderID) AS QuantitySold
                        FROM ORDERS o
                        JOIN CarModel cm ON o.CarModelID = cm.CarModelID
                        WHERE o.OrderTrackingID = 4
                        GROUP BY cm.CarName
                        ORDER BY QuantitySold DESC";
                    using (SqlCommand command = new SqlCommand(sqlTopSellingCar, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                summary.TopSellingCar = new
                                {
                                    CarName = reader.GetString(reader.GetOrdinal("CarName")),
                                    QuantitySold = reader.GetInt32(reader.GetOrdinal("QuantitySold"))
                                };
                            }
                            else
                            {
                                summary.TopSellingCar = new { CarName = "N/A", QuantitySold = 0 };
                            }
                        }
                    }

                    connection.Close();
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}