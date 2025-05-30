namespace CARSALE.Models
{
    public class UpdatePaymentRequest
    {
        public int PaymentID { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string TransactionCode { get; set; } = string.Empty;
    }
}