namespace CARSALE.Models
{
    public class CarModel
    {
        private string carName = string.Empty;
        private int year;

        public int CarModelID { get; set; }
        public string CarName
        {
            get => carName;
            set
            {
                if (string.IsNullOrEmpty(value))
                    throw new ArgumentException("CarName is required.");
                carName = value;
            }
        }
        public int Year
        {
            get => year;
            set
            {
                if (value < 1900 || value > 2025)
                    throw new ArgumentException("Year must be between 1900 and 2025.");
                year = value;
            }
        }
        public string FuelType { get; set; } = string.Empty;
        public string Transmission { get; set; } = string.Empty;
        public decimal EngineCapacity { get; set; }
        public string Color { get; set; } = string.Empty;
        public string ImageURL { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int BrandID { get; set; }
        public int CategoryID { get; set; }
        public int StatusID { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public bool IsHidden { get; set; } // Thêm thuộc tính này
    }
}