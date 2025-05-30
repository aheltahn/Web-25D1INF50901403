namespace CARSALE.Models
{
    public class Users
    {
        private string email = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email
        {
            get => email;
            set
            {
                if (string.IsNullOrEmpty(value) || !value.Contains("@"))
                    throw new ArgumentException("Email must be valid.");
                email = value;
            }
        }
        private string password = string.Empty;
        public string Password
        {
            get => password;
            set
            {
                if (string.IsNullOrEmpty(value) || value.Length < 6)
                    throw new ArgumentException("Password must be at least 6 characters long.");
                password = value;
            }
        }
        public string Role { get; set; } = "User";
    }
}