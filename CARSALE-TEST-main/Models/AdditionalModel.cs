public class ChangePasswordRequest
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
public class PaymentRequest
{
    public int OrderID { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
}

public class Payment
{
    public int PaymentID { get; set; }
    public int OrderID { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Unit_Code { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public int UserID { get; set; }
}
public class UpdatePaymentRequest
{
    public int PaymentID { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
}
public class OrderRequest
{
    public int CarModelID { get; set; }
}