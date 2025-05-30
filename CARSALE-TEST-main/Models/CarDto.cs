namespace CARSALE.Models
{
    public class CarDto
    {
        public int CarId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Year { get; set; }
        public string Fuel { get; set; } = string.Empty;
        public string Engine { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Transmission { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }
}