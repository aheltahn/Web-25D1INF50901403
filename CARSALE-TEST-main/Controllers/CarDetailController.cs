using CARSALE.Models;
using CARSALE.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CARSALE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarDetailController : ControllerBase
    {
        private readonly ICarService _carService;

        public CarDetailController(ICarService carService)
        {
            _carService = carService ?? throw new ArgumentNullException(nameof(carService));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCarDetail(int id)
        {
            try
            {
                var cars = await _carService.GetCarsAsync();
                var car = cars.Find(c => c.CarModelID == id);
                if (car == null)
                    return NotFound(new { message = "Car not found." });
                return Ok(car);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}