# Skill — EF Core Entity & Migration

Follow these steps in order when creating a new domain entity or adding columns to an existing one.

> Always inspect the current schema via MySQL MCP before creating a migration.

---

## 1. Entity — `PDV.Domain/Entities/`

- All entities have `Guid Id` (PK) and `DateTime CreatedAt` (UTC).
- Soft delete **only on `Product`** via `IsActive bool`. All others use hard delete.
- No framework references — pure C# classes.

```csharp
public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? NCM { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ICollection<SaleItem> SaleItems { get; set; } = [];
}
```

---

## 2. Repository Interface — `PDV.Domain/Interfaces/`

Define the contract in `PDV.Domain`. No EF Core references here.

```csharp
public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id);
    Task<IEnumerable<Product>> GetAllActiveAsync(int page, int pageSize, string? nameFilter);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
}
```

---

## 3. EF Configuration — `PDV.Infrastructure/Persistence/Configurations/`

Use `IEntityTypeConfiguration<T>` to keep `DbContext` clean.

```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Barcode).HasMaxLength(50);
        builder.Property(p => p.NCM).HasMaxLength(10);
        builder.Property(p => p.Price).HasColumnType("decimal(10,2)");
        builder.Property(p => p.CreatedAt).IsRequired();

        builder.HasIndex(p => p.Barcode).IsUnique().HasFilter("Barcode IS NOT NULL");

        // Apply global query filter for soft delete
        builder.HasQueryFilter(p => p.IsActive);
    }
}
```

---

## 4. DbContext — `PDV.Infrastructure/Persistence/AppDbContext.cs`

Add the `DbSet` and apply the configuration:

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

---

## 5. Repository Implementation — `PDV.Infrastructure/Repositories/`

```csharp
public class ProductRepository(AppDbContext context) : IProductRepository
{
    public async Task<Product?> GetByIdAsync(Guid id) =>
        await context.Products.FirstOrDefaultAsync(p => p.Id == id);

    public async Task AddAsync(Product product)
    {
        await context.Products.AddAsync(product);
        await context.SaveChangesAsync();
    }
}
```

Register in DI:
```csharp
services.AddScoped<IProductRepository, ProductRepository>();
```

---

## 6. Migration

Run from the `backend/` directory:

```bash
dotnet ef migrations add <MigrationName> \
  --project PDV.Infrastructure \
  --startup-project PDV.Api
```

Then apply:

```bash
dotnet ef database update \
  --project PDV.Infrastructure \
  --startup-project PDV.Api
```

After running, **verify with MySQL MCP** that the table/columns were created correctly.

---

## Checklist

- [ ] Entity class in `PDV.Domain/Entities/` with `Guid Id` and `DateTime CreatedAt`
- [ ] Repository interface in `PDV.Domain/Interfaces/`
- [ ] EF configuration in `PDV.Infrastructure/Persistence/Configurations/`
- [ ] `DbSet` added to `AppDbContext`
- [ ] Repository implementation in `PDV.Infrastructure/Repositories/` and registered in DI
- [ ] Migration created and applied
- [ ] Schema verified via MySQL MCP