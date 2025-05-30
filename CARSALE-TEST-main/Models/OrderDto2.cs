namespace CARSALE.Models
{
    public class OrderDto2
    {
        public int OrderID { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalPrice { get; set; }
        public string Unit_Code { get; set; } = string.Empty;
        public int UserID { get; set; }
        public int CarModelID { get; set; }
        public int OrderTrackingID { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime CreateDatetime { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string CarName { get; set; } = string.Empty;
    }
}