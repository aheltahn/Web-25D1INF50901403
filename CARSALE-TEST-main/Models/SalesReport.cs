namespace CARSALE.Models
{
    public class SalesSummary
    {
        public decimal TotalRevenue { get; set; } // Tổng doanh thu
        public int TotalOrders { get; set; } // Tổng số đơn hàng
        public int CompletedOrders { get; set; } // Số đơn hoàn thành
        public int CanceledOrders { get; set; } // Số đơn hủy
        public decimal CompletionRate { get; set; } // Tỷ lệ đơn hoàn thành (%)
        public decimal CancellationRate { get; set; } // Tỷ lệ đơn hủy (%)
        public object TopSellingCar { get; set; } // Xe bán chạy nhất (theo số lượng)
    }
}