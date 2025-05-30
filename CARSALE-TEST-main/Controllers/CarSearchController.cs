using CARSALE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarSearchController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public CarSearchController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("search")]
        public IActionResult SearchCars([FromQuery] string? keyword, [FromQuery] string? brandName)
        {
            if (_configuration == null)
            {
                return BadRequest("Configuration is not initialized.");
            }

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
            {
                return BadRequest("The connection string has not been initialized.");
            }

            List<CarModel> cars = new List<CarModel>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string sql = @"
                        SELECT cm.*, b.BrandName, c.CategoryName, s.StatusName
                        FROM CarModel cm
                        JOIN Brand b ON cm.BrandID = b.BrandID
                        JOIN CATEGORY c ON cm.CategoryID = c.CategoryID
                        JOIN CARSTATUS s ON cm.StatusID = s.StatusID
                        WHERE cm.IsHidden = 0"; 

                    if (!string.IsNullOrEmpty(keyword))
                    {
                        sql += " AND cm.CarName LIKE @Keyword";
                    }
                    if (!string.IsNullOrEmpty(brandName))
                    {
                        sql += " AND b.BrandName LIKE @BrandName";
                    }

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        if (!string.IsNullOrEmpty(keyword))
                        {
                            cmd.Parameters.AddWithValue("@Keyword", "%" + keyword + "%");
                        }
                        if (!string.IsNullOrEmpty(brandName))
                        {
                            cmd.Parameters.AddWithValue("@BrandName", "%" + brandName + "%");
                        }

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                cars.Add(new CarModel
                                {
                                    CarModelID = reader.GetInt32(reader.GetOrdinal("CarModelID")),
                                    CarName = reader.IsDBNull(reader.GetOrdinal("CarName")) ? string.Empty : reader.GetString(reader.GetOrdinal("CarName")),
                                    Year = reader.GetInt32(reader.GetOrdinal("Year")),
                                    FuelType = reader.IsDBNull(reader.GetOrdinal("FuelType")) ? string.Empty : reader.GetString(reader.GetOrdinal("FuelType")),
                                    Transmission = reader.IsDBNull(reader.GetOrdinal("Transmission")) ? string.Empty : reader.GetString(reader.GetOrdinal("Transmission")),
                                    EngineCapacity = reader.GetDecimal(reader.GetOrdinal("EngineCapacity")),
                                    Color = reader.IsDBNull(reader.GetOrdinal("Color")) ? string.Empty : reader.GetString(reader.GetOrdinal("Color")),
                                    ImageURL = reader.IsDBNull(reader.GetOrdinal("ImageURL")) ? string.Empty : reader.GetString(reader.GetOrdinal("ImageURL")),
                                    Model = reader.IsDBNull(reader.GetOrdinal("Model")) ? string.Empty : reader.GetString(reader.GetOrdinal("Model")),
                                    UnitPrice = reader.GetDecimal(reader.GetOrdinal("UnitPrice")),
                                    BrandID = reader.GetInt32(reader.GetOrdinal("BrandID")),
                                    CategoryID = reader.GetInt32(reader.GetOrdinal("CategoryID")),
                                    StatusID = reader.GetInt32(reader.GetOrdinal("StatusID")),
                                    BrandName = reader.IsDBNull(reader.GetOrdinal("BrandName")) ? string.Empty : reader.GetString(reader.GetOrdinal("BrandName")),
                                    CategoryName = reader.IsDBNull(reader.GetOrdinal("CategoryName")) ? string.Empty : reader.GetString(reader.GetOrdinal("CategoryName")),
                                    StatusName = reader.IsDBNull(reader.GetOrdinal("StatusName")) ? string.Empty : reader.GetString(reader.GetOrdinal("StatusName"))
                                });
                            }
                        }
                    }

                    conn.Close();
                }

                return Ok(cars);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}