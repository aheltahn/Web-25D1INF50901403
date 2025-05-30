using CARSALE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForgotPasswordController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        private static Dictionary<string, (string otp, DateTime expires)> otpStore = new();

        public ForgotPasswordController(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpPost("request")]
        public IActionResult RequestReset([FromBody] EmailRequest req)
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

            string email = req.Email;

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string sql = "SELECT COUNT(*) FROM USERS WHERE Email = @Email";
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@Email", email);
                        int count = (int)cmd.ExecuteScalar();
                        if (count == 0)
                            return NotFound(new { message = "Email not registered." });
                    }

                    conn.Close();
                }

                string otp = new Random().Next(100000, 999999).ToString();
                otpStore[email] = (otp, DateTime.Now.AddMinutes(5));

                var smtp = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential("vuthiennhan321@gmail.com", "mpjspwkyzbbidqmj"),
                    EnableSsl = true
                };
                var mail = new MailMessage("vuthiennhan321@gmail.com", email)
                {
                    Subject = "Password Reset Verification Code",
                    Body = $"Your OTP is: {otp}\nValid for 5 minutes."
                };
                smtp.Send(mail);

                return Ok(new { message = "Verification code sent to email." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send email.", error = ex.Message });
            }
        }

        [HttpPost("verify")]
        public IActionResult VerifyReset([FromBody] VerifyResetRequest req)
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

            if (!otpStore.ContainsKey(req.Email))
                return BadRequest(new { message = "No OTP request found for this email." });

            var (otp, expires) = otpStore[req.Email];

            if (DateTime.Now > expires)
                return BadRequest(new { message = "OTP has expired." });

            if (req.OTP != otp)
                return BadRequest(new { message = "Invalid OTP." });

            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    string checkSql = "SELECT COUNT(*) FROM USERS WHERE Email = @Email AND Role = 'User'";
                    using (SqlCommand checkCmd = new SqlCommand(checkSql, conn))
                    {
                        checkCmd.Parameters.AddWithValue("@Email", req.Email);
                        int count = (int)checkCmd.ExecuteScalar();
                        if (count == 0)
                            return NotFound(new { message = "User not found with this email or not a customer user." });
                    }

                    string sql = "UPDATE USERS SET Password = @Password WHERE Email = @Email";
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@Password", req.NewPassword);
                        cmd.Parameters.AddWithValue("@Email", req.Email);
                        int rowsAffected = cmd.ExecuteNonQuery();

                        if (rowsAffected == 0)
                            return NotFound(new { message = "User not found with this email." });
                    }

                    conn.Close();
                }

                otpStore.Remove(req.Email);
                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}