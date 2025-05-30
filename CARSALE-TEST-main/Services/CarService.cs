using CARSALE.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CARSALE.Services
{
    public class CarService : ICarService
    {
        private readonly string _connectionString;

        public CarService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("Database");
            if (string.IsNullOrEmpty(_connectionString))
            {
                throw new InvalidOperationException("The connection string has not been initialized.");
            }
        }

        public async Task<List<CarModel>> GetCarsAsync()
        {
            List<CarModel> cars = new List<CarModel>();
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string sql = @"
                    SELECT cm.*, b.BrandName, c.CategoryName, s.StatusName
                    FROM CarModel cm
                    JOIN Brand b ON cm.BrandID = b.BrandID
                    JOIN CATEGORY c ON cm.CategoryID = c.CategoryID
                    JOIN CARSTATUS s ON cm.StatusID = s.StatusID
                    WHERE cm.IsHidden = 0";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
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
            }
            return cars;
        }

        public async Task<bool> AddCarAsync(CarModel car)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string sql = @"
                    INSERT INTO CarModel (CarName, Year, FuelType, Transmission, EngineCapacity, Color, ImageURL, Model, UnitPrice, BrandID, CategoryID, StatusID)
                    VALUES (@CarName, @Year, @FuelType, @Transmission, @EngineCapacity, @Color, @ImageURL, @Model, @UnitPrice, @BrandID, @CategoryID, @StatusID)";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@CarName", car.CarName);
                    command.Parameters.AddWithValue("@Year", car.Year);
                    command.Parameters.AddWithValue("@FuelType", car.FuelType ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Transmission", car.Transmission ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EngineCapacity", car.EngineCapacity);
                    command.Parameters.AddWithValue("@Color", car.Color ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@ImageURL", car.ImageURL ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Model", car.Model ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@UnitPrice", car.UnitPrice);
                    command.Parameters.AddWithValue("@BrandID", car.BrandID);
                    command.Parameters.AddWithValue("@CategoryID", car.CategoryID);
                    command.Parameters.AddWithValue("@StatusID", car.StatusID);

                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        public async Task<bool> UpdateCarAsync(int id, CarModel car)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string sql = @"
                    UPDATE CarModel
                    SET CarName = @CarName, Year = @Year, FuelType = @FuelType, Transmission = @Transmission,
                        EngineCapacity = @EngineCapacity, Color = @Color, ImageURL = @ImageURL, Model = @Model,
                        UnitPrice = @UnitPrice, BrandID = @BrandID, CategoryID = @CategoryID, StatusID = @StatusID
                    WHERE CarModelID = @CarModelID";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@CarModelID", id);
                    command.Parameters.AddWithValue("@CarName", car.CarName);
                    command.Parameters.AddWithValue("@Year", car.Year);
                    command.Parameters.AddWithValue("@FuelType", car.FuelType ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Transmission", car.Transmission ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EngineCapacity", car.EngineCapacity);
                    command.Parameters.AddWithValue("@Color", car.Color ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@ImageURL", car.ImageURL ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@Model", car.Model ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@UnitPrice", car.UnitPrice);
                    command.Parameters.AddWithValue("@BrandID", car.BrandID);
                    command.Parameters.AddWithValue("@CategoryID", car.CategoryID);
                    command.Parameters.AddWithValue("@StatusID", car.StatusID);

                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        public async Task<bool> UpdateCarPartialAsync(int id, CarModelUpdateDto updateDto)
        {
            var validColumns = new HashSet<string>
            {
                "CarName", "Year", "FuelType", "Transmission", "EngineCapacity",
                "Color", "ImageURL", "Model", "UnitPrice", "BrandID", "CategoryID", "StatusID", "IsHidden"
            };

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
                throw new ArgumentException("No fields provided for update.");
            }

            if (updates.ContainsKey("CarName") && string.IsNullOrEmpty(updates["CarName"].ToString()))
            {
                throw new ArgumentException("CarName is required and cannot be empty.");
            }

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var setClauses = updates.Select(u => $"{u.Key} = @{u.Key}").ToList();
                string sql = $@"UPDATE CarModel SET {string.Join(", ", setClauses)} WHERE CarModelID = @CarModelID";
                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@CarModelID", id);
                    foreach (var update in updates)
                    {
                        command.Parameters.AddWithValue($"@{update.Key}", update.Value ?? DBNull.Value);
                    }

                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }

        public async Task<bool> DeleteCarAsync(int id)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string sqlDeletePayments = @"
                    DELETE FROM PAYMENT 
                    WHERE OrderID IN (SELECT OrderID FROM ORDERS WHERE CarModelID = @CarModelID)";
                using (SqlCommand commandDeletePayments = new SqlCommand(sqlDeletePayments, connection))
                {
                    commandDeletePayments.Parameters.AddWithValue("@CarModelID", id);
                    await commandDeletePayments.ExecuteNonQueryAsync();
                }

                string sqlDeleteOrders = "DELETE FROM ORDERS WHERE CarModelID = @CarModelID";
                using (SqlCommand commandDeleteOrders = new SqlCommand(sqlDeleteOrders, connection))
                {
                    commandDeleteOrders.Parameters.AddWithValue("@CarModelID", id);
                    await commandDeleteOrders.ExecuteNonQueryAsync();
                }

                string sqlDeleteCar = "DELETE FROM CarModel WHERE CarModelID = @CarModelID";
                using (SqlCommand commandDeleteCar = new SqlCommand(sqlDeleteCar, connection))
                {
                    commandDeleteCar.Parameters.AddWithValue("@CarModelID", id);
                    int rowsAffected = await commandDeleteCar.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }
    }
}