using CARSALE.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CARSALE.Services
{
    public interface ICarService
    {
        Task<List<CarModel>> GetCarsAsync();
        Task<bool> AddCarAsync(CarModel car);
        Task<bool> UpdateCarAsync(int id, CarModel car);
        Task<bool> UpdateCarPartialAsync(int id, CarModelUpdateDto updateDto);
        Task<bool> DeleteCarAsync(int id);
    }
}