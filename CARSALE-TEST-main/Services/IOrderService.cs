using CARSALE.Models;
using System.Threading.Tasks;

namespace CARSALE.Services
{
    public interface IOrderService
    {
        Task<bool> PlaceOrderAsync(OrderRequest request, int userId);
    }
}