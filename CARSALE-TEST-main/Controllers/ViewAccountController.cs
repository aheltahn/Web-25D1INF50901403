using CARSALE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ViewAccountController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ViewAccountController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpGet("{id}")]
        public IActionResult GetUserById(int id)
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

            UserDto userDto = null;

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string sql = "SELECT * FROM USERS WHERE UserID = @UserID AND Role = 'User'";
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@UserID", id);
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                userDto = new UserDto
                                {
                                    UserID = Convert.ToInt32(reader["UserID"]),
                                    Name = reader["Name"]?.ToString() ?? string.Empty,
                                    Address = reader["Address"]?.ToString() ?? string.Empty,
                                    PhoneNumber = reader["PhoneNumber"]?.ToString() ?? string.Empty,
                                    Email = reader["Email"]?.ToString() ?? string.Empty
                                };
                            }
                        }
                    }

                    conn.Close();
                }

                if (userDto == null)
                    return NotFound(new { message = "User not found." });

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}