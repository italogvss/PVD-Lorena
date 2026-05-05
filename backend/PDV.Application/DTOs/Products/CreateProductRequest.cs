namespace PDV.Application.DTOs.Products;

public record CreateProductRequest(
    string Name,
    string? Barcode,
    string? Ncm,
    decimal Price,
    int Stock);
