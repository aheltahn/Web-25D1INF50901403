namespace CARSALE.Models
{
    public class CarModelUpdateDto
    {
        public string? CarName { get; set; }
        public int? Year { get; set; }
        public string? FuelType { get; set; }
        public string? Transmission { get; set; }
        public decimal? EngineCapacity { get; set; }
        public string? Color { get; set; }
        public string? ImageURL { get; set; }
        public string? Model { get; set; }
        public decimal? UnitPrice { get; set; }
        public int? BrandID { get; set; }
        public int? CategoryID { get; set; }
        public int? StatusID { get; set; }
        public bool? IsHidden { get; set; }
    }
}