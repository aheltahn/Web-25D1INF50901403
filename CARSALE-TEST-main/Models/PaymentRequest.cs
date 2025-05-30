namespace CARSALE.Models
{
    public class PaymentRequest
    {
        public int OrderID { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionCode { get; set; } = string.Empty;
    }
}