using Microsoft.AspNetCore.Mvc;

public abstract class BaseController : ControllerBase
{
    protected readonly IConfiguration _configuration;

    protected BaseController(IConfiguration configuration)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    protected string GetConnectionString()
    {
        string connectionString = _configuration.GetConnectionString("Database");
        if (string.IsNullOrEmpty(connectionString))
            throw new InvalidOperationException("The connection string has not been initialized.");
        return connectionString;
    }

    protected virtual IActionResult ValidateRequest(object request) => Ok(); // Phương thức virtual
}