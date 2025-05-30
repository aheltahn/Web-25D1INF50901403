namespace CARSALE.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public DateTime OrderDate { get; set; }
        private decimal totalPrice;
        public decimal TotalPrice
        {
            get => totalPrice;
            set
            {
                if (value < 0) throw new ArgumentException("TotalPrice cannot be negative.");
                totalPrice = value;
            }
        }
        public string Unit_Code { get; set; } = string.Empty;
        public int UserID { get; set; }
        public int OrderTrackingID { get; set; }
        public int CarModelID { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string CarName { get; set; } = string.Empty;
        public DateTime CreateDatetime { get; set; }
    }
}