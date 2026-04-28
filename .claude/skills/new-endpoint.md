# Skill — New API Endpoint

Follow these steps in order for every new endpoint. Each step maps to a layer in Clean Architecture.

---

## 1. DTO — `PDV.Application/DTOs/`

Create request and/or response DTOs. DTOs are plain C# records or classes — no domain entities exposed.

```csharp
// Request
public record CreateProductRequest(string Name, decimal Price, int Stock);

// Response
public record ProductResponse(Guid Id, string Name, decimal Price, int Stock, bool IsActive);
```

---

## 2. Validator — `PDV.Application/Validators/`

Use FluentValidation for every request DTO that modifies data.

```csharp
public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
    }
}
```

Register in DI (if not using auto-registration):
```csharp
services.AddValidatorsFromAssemblyContaining<CreateProductRequestValidator>();
```

---

## 3. Service Interface — `PDV.Application/Interfaces/`

Define the contract. Returns DTOs — never domain entities.

```csharp
public interface IProductService
{
    Task<ProductResponse> CreateAsync(CreateProductRequest request);
    Task<PaginatedResponse<ProductResponse>> GetAllAsync(int page, int pageSize, string? name);
}
```

---

## 4. Service Implementation — `PDV.Infrastructure/Services/`

Implement the interface. Inject the repository interface (from `PDV.Domain`). Apply business rules here.

```csharp
public class ProductService(IProductRepository repository) : IProductService
{
    public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
    {
        var product = new Product { ... };
        await repository.AddAsync(product);
        return new ProductResponse(...);
    }
}
```

Register in DI (`PDV.Api/Program.cs` or a dedicated extension):
```csharp
services.AddScoped<IProductService, ProductService>();
```

---

## 5. Controller Action — `PDV.Api/Controllers/`

- Inject the service interface (not the implementation).
- Return DTOs via `Ok()`, `Created()`, `NoContent()`.
- Validate with `[FromBody]` + automatic FluentValidation pipeline.
- Apply `[Authorize]` / `[Authorize(Roles = "Admin")]` per the access profile rules.

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController(IProductService service) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var result = await service.CreateAsync(request);
        return Created($"api/products/{result.Id}", result);
    }
}
```

---

## Error Handling

Do NOT add try/catch in controllers or services for domain errors. Throw domain exceptions; the global middleware maps them:

| Exception              | HTTP  |
|------------------------|-------|
| `NotFoundException`    | 404   |
| `ValidationException`  | 400   |
| `BusinessException`    | 422   |
| `UnauthorizedException`| 401   |
| `ForbiddenException`   | 403   |

---

## Checklist

- [ ] DTO(s) created in `PDV.Application/DTOs/`
- [ ] Validator created (if mutating data) in `PDV.Application/Validators/`
- [ ] Interface defined in `PDV.Application/Interfaces/`
- [ ] Implementation in `PDV.Infrastructure/Services/`
- [ ] Registered in DI
- [ ] Controller action added with correct `[Authorize]` attribute
- [ ] Returns DTO, not domain entity