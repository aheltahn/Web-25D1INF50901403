using CARSALE.Models;
using CARSALE.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarModelController : BaseController
    {
        public CarModelController(IConfiguration configuration) : base(configuration) { }

        protected override IActionResult ValidateRequest(object request)
        {
            if (request is CarModel car && string.IsNullOrEmpty(car.CarName))
                return BadRequest("CarName is required.");
            return base.ValidateRequest(request);
        }

        [HttpGet]
        public IActionResult GetCars()
        {
            string connectionString = GetConnectionString();
            List<CarModel> cars = new List<CarModel>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = @"
                        SELECT cm.*, b.BrandName, c.CategoryName, s.StatusName
                        FROM CarModel cm
                        JOIN Brand b ON cm.BrandID = b.BrandID
                        JOIN CATEGORY c ON cm.CategoryID = c.CategoryID
                        JOIN CARSTATUS s ON cm.StatusID = s.StatusID
                        WHERE cm.IsHidden = 0";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
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
                                    StatusName = reader.IsDBNull(reader.GetOrdinal("StatusName")) ? string.Empty : reader.GetString(reader.GetOrdinal("StatusName")),
                                    IsHidden = reader.GetBoolean(reader.GetOrdinal("IsHidden"))
                                });
                            }
                        }
                    }
                    connection.Close();
                }
                return Ok(cars);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [AdminAuthorize]
        public IActionResult AddCar([FromBody] CarModel car)
        {
            if (string.IsNullOrEmpty(car.CarName))
                return BadRequest("CarName is required.");

            string connectionString = GetConnectionString();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = @"
                        INSERT INTO CarModel (CarName, Year, FuelType, Transmission, EngineCapacity, Color, ImageURL, Model, UnitPrice, BrandID, CategoryID, StatusID, IsHidden)
                        VALUES (@CarName, @Year, @FuelType, @Transmission, @EngineCapacity, @Color, @ImageURL, @Model, @UnitPrice, @BrandID, @CategoryID, @StatusID, 0)";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@CarName", car.CarName));
                        command.Parameters.Add(new SqlParameter("@Year", car.Year));
                        command.Parameters.Add(new SqlParameter("@FuelType", car.FuelType ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@Transmission", car.Transmission ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@EngineCapacity", car.EngineCapacity));
                        command.Parameters.Add(new SqlParameter("@Color", car.Color ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@ImageURL", car.ImageURL ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@Model", car.Model ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@UnitPrice", car.UnitPrice));
                        command.Parameters.Add(new SqlParameter("@BrandID", car.BrandID));
                        command.Parameters.Add(new SqlParameter("@CategoryID", car.CategoryID));
                        command.Parameters.Add(new SqlParameter("@StatusID", car.StatusID));
                        command.ExecuteNonQuery();
                    }
                    connection.Close();
                }
                return Ok("Car added successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [AdminAuthorize]
        public IActionResult UpdateCar(int id, [FromBody] CarModelUpdateDto updateDto)
        {
            string connectionString = GetConnectionString();

            // Danh sách các cột hợp lệ để cập nhật
            var validColumns = new HashSet<string>
            {
                "CarName", "Year", "FuelType", "Transmission", "EngineCapacity",
                "Color", "ImageURL", "Model", "UnitPrice", "BrandID", "CategoryID", "StatusID", "IsHidden"
            };

            // Lọc các trường được gửi từ request và kiểm tra xem có trường nào để cập nhật không
            var updates = new Dictionary<string, object>();
            if (updateDto.CarName != null) updates["CarName"] = updateDto.CarName;
            if (updateDto.Year.HasValue) updates["Year"] = updateDto.Year.Value;
            if (updateDto.FuelType != null) updates["FuelType"] = updateDto.FuelType;
            if (updateDto.Transmission != null) updates["Transmission"] = updateDto.Transmission;
            if (updateDto.EngineCapacity.HasValue) updates["EngineCapacity"] = updateDto.EngineCapacity.Value;
            if (updateDto.Color != null) updates["Color"] = updateDto.Color;
            if (updateDto.ImageURL != null) updates["ImageURL"] = updateDto.ImageURL;
            if (updateDto.Model != null) updates["Model"] = updateDto.Model;
            if (updateDto.UnitPrice.HasValue) updates["UnitPrice"] = updateDto.UnitPrice.Value;
            if (updateDto.BrandID.HasValue) updates["BrandID"] = updateDto.BrandID.Value;
            if (updateDto.CategoryID.HasValue) updates["CategoryID"] = updateDto.CategoryID.Value;
            if (updateDto.StatusID.HasValue) updates["StatusID"] = updateDto.StatusID.Value;
            if (updateDto.IsHidden.HasValue) updates["IsHidden"] = updateDto.IsHidden.Value;

            if (!updates.Any())
            {
                return BadRequest("No fields provided for update.");
            }

            // Kiểm tra CarName nếu được gửi
            if (updates.ContainsKey("CarName") && string.IsNullOrEmpty(updates["CarName"].ToString()))
            {
                return BadRequest("CarName is required and cannot be empty.");
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    // Tạo câu lệnh SQL động chỉ cập nhật các trường được gửi
                    var setClauses = updates.Select(u => $"{u.Key} = @{u.Key}").ToList();
                    string sql = $@"UPDATE CarModel SET {string.Join(", ", setClauses)} WHERE CarModelID = @CarModelID";

                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@CarModelID", id));
                        foreach (var update in updates)
                        {
                            command.Parameters.Add(new SqlParameter($"@{update.Key}", update.Value ?? DBNull.Value));
                        }

                        int rowsAffected = command.ExecuteNonQuery();
                        if (rowsAffected == 0)
                            return NotFound("Car not found.");

                        return Ok("Car updated successfully.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("UpdateFull/{id}")]
        [AdminAuthorize]
        public IActionResult UpdateCarFull(int id, [FromBody] CarModel car)
        {
            if (string.IsNullOrEmpty(car.CarName))
                return BadRequest("CarName is required.");

            string connectionString = GetConnectionString();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = @"
                        UPDATE CarModel
                        SET CarName = @CarName, Year = @Year, FuelType = @FuelType, Transmission = @Transmission,
                            EngineCapacity = @EngineCapacity, Color = @Color, ImageURL = @ImageURL, Model = @Model,
                            UnitPrice = @UnitPrice, BrandID = @BrandID, CategoryID = @CategoryID, StatusID = @StatusID,
                            IsHidden = @IsHidden
                        WHERE CarModelID = @CarModelID";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@CarModelID", id));
                        command.Parameters.Add(new SqlParameter("@CarName", car.CarName));
                        command.Parameters.Add(new SqlParameter("@Year", car.Year));
                        command.Parameters.Add(new SqlParameter("@FuelType", car.FuelType ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@Transmission", car.Transmission ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@EngineCapacity", car.EngineCapacity));
                        command.Parameters.Add(new SqlParameter("@Color", car.Color ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@ImageURL", car.ImageURL ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@Model", car.Model ?? (object)DBNull.Value));
                        command.Parameters.Add(new SqlParameter("@UnitPrice", car.UnitPrice));
                        command.Parameters.Add(new SqlParameter("@BrandID", car.BrandID));
                        command.Parameters.Add(new SqlParameter("@CategoryID", car.CategoryID));
                        command.Parameters.Add(new SqlParameter("@StatusID", car.StatusID));
                        command.Parameters.Add(new SqlParameter("@IsHidden", car.IsHidden));
                        int rowsAffected = command.ExecuteNonQuery();
                        connection.Close();

                        if (rowsAffected > 0)
                            return Ok("Car updated successfully.");
                        else
                            return NotFound("Car not found.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [AdminAuthorize]
        public IActionResult DeleteCar(int id)
        {
            string connectionString = GetConnectionString();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    string sql = "UPDATE CarModel SET IsHidden = 1 WHERE CarModelID = @CarModelID";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@CarModelID", id));
                        int rowsAffected = command.ExecuteNonQuery();

                        connection.Close();

                        if (rowsAffected > 0)
                            return Ok("Car hidden successfully.");
                        else
                            return NotFound("Car not found.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}