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
    public class RecommendedCarsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public RecommendedCarsController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet]
        public IActionResult GetRecommendedCars()
        {
            if (_configuration == null)
                return BadRequest("Configuration is not initialized.");

            string connectionString = _configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("The connection string has not been initialized.");

            List<CarDto> cars = new List<CarDto>();

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string sql = @"
                        SELECT TOP 6 
                            cm.*, 
                            b.BrandName, 
                            c.CategoryName, 
                            s.StatusName,
                            COALESCE(SUM(o.TotalPrice), 0) AS TotalRevenue
                        FROM CarModel cm
                        LEFT JOIN Orders o ON cm.CarModelID = o.CarModelID
                        JOIN Brand b ON cm.BrandID = b.BrandID
                        JOIN CATEGORY c ON cm.CategoryID = c.CategoryID
                        JOIN CARSTATUS s ON cm.StatusID = s.StatusID
                        WHERE cm.IsHidden = 0
                        GROUP BY 
                            cm.CarModelID, cm.CarName, cm.Year, cm.FuelType, cm.Transmission, 
                            cm.EngineCapacity, cm.Color, cm.ImageURL, cm.Model, cm.UnitPrice, 
                            cm.BrandID, cm.CategoryID, cm.StatusID, cm.IsHidden,
                            b.BrandName, c.CategoryName, s.StatusName
                        ORDER BY TotalRevenue DESC";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                cars.Add(new CarDto
                                {
                                    CarId = Convert.ToInt32(reader["CarModelID"]),
                                    Name = reader["CarName"]?.ToString() ?? string.Empty,
                                    Price = Convert.ToDecimal(reader["UnitPrice"]),
                                    Year = Convert.ToInt32(reader["Year"]),
                                    Fuel = reader["FuelType"]?.ToString() ?? string.Empty,
                                    Engine = reader["EngineCapacity"]?.ToString() ?? string.Empty,
                                    Color = reader["Color"]?.ToString() ?? string.Empty,
                                    Transmission = reader["Transmission"]?.ToString() ?? string.Empty,
                                    ImageUrl = reader["ImageURL"]?.ToString() ?? string.Empty
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