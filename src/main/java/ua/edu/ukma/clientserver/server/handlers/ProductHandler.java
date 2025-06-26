package ua.edu.ukma.clientserver.server.handlers;

import com.sun.net.httpserver.HttpExchange;
import ua.edu.ukma.clientserver.server.db.ProductRepository;
import ua.edu.ukma.clientserver.server.models.Product;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class ProductHandler extends BaseHandler {

    private final ProductRepository productRepository;

    public ProductHandler(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (path.equals("/api/products")) {
            if (method.equals("GET")) {
                handleGetAllProducts(exchange);
            } else if (method.equals("POST")) {
                handleCreateProduct(exchange);
            }
        } else if (path.matches("/api/products/\\d+")) {
            int id = Integer.parseInt(path.substring(path.lastIndexOf('/') + 1));
            if (method.equals("GET")) {
                handleGetProductById(exchange, id);
            } else if (method.equals("PUT")) {
                handleUpdateProduct(exchange, id);
            } else if (method.equals("DELETE")) {
                handleDeleteProduct(exchange, id);
            }
        } else if (path.equals("/api/products/search")) {
            if (method.equals("GET")) {
                handleSearchProducts(exchange);
            }
        } else if (path.matches("/api/products/\\d+/add")) {
            if (method.equals("POST")) {
                int id = Integer.parseInt(path.split("/")[3]);
                handleAddStock(exchange, id);
            }
        } else if (path.matches("/api/products/\\d+/sell")) {
            if (method.equals("POST")) {
                int id = Integer.parseInt(path.split("/")[3]);
                handleSellStock(exchange, id);
            }
        } else {
            sendResponse(exchange, 404, "{\"error\":\"Not Found\"}");
        }
    }

    private void handleGetAllProducts(HttpExchange exchange) throws IOException {
        List<Product> products = productRepository.getAllProducts();
        sendResponse(exchange, 200, gson.toJson(products));
    }

    private void handleCreateProduct(HttpExchange exchange) throws IOException {
        Product product = readRequestBody(exchange, Product.class);
        if (productRepository.getProductByName(product.name()).isPresent()) {
            sendResponse(exchange, 409, "{\"error\":\"Product with this name already exists\"}");
            return;
        }
        Product createdProduct = productRepository.createProduct(product);
        sendResponse(exchange, 201, gson.toJson(createdProduct));
    }

    private void handleGetProductById(HttpExchange exchange, int id) throws IOException {
        Optional<Product> product = productRepository.getProductById(id);
        if (product.isPresent()) {
            sendResponse(exchange, 200, gson.toJson(product.get()));
        } else {
            sendResponse(exchange, 404, "{\"error\":\"Product not found\"}");
        }
    }

    private void handleUpdateProduct(HttpExchange exchange, int id) throws IOException {
        Product product = readRequestBody(exchange, Product.class);
        if (productRepository.getProductById(id).isEmpty()) {
            sendResponse(exchange, 404, "{\"error\":\"Product not found\"}");
            return;
        }
        Optional<Product> existingProductWithSameName = productRepository.getProductByName(product.name());
        if (existingProductWithSameName.isPresent() && existingProductWithSameName.get().id() != id) {
            sendResponse(exchange, 409, "{\"error\":\"Another product with this name already exists\"}");
            return;
        }
        productRepository.updateProduct(new Product(id, product.groupId(), product.name(), product.description(), product.manufacturer(), product.quantity(), product.price()));
        sendResponse(exchange, 200, "{\"message\":\"Product updated successfully\"}");
    }

    private void handleDeleteProduct(HttpExchange exchange, int id) throws IOException {
        if (productRepository.getProductById(id).isEmpty()) {
            sendResponse(exchange, 404, "{\"error\":\"Product not found\"}");
            return;
        }
        productRepository.deleteProduct(id);
        sendResponse(exchange, 200, "{\"message\":\"Product deleted successfully\"}");
    }

    private void handleSearchProducts(HttpExchange exchange) throws IOException {
        String query = exchange.getRequestURI().getQuery().split("=")[1];
        List<Product> products = productRepository.findProducts(query);
        sendResponse(exchange, 200, gson.toJson(products));
    }

    private void handleAddStock(HttpExchange exchange, int id) throws IOException {
        Optional<Product> optionalProduct = productRepository.getProductById(id);
        if (optionalProduct.isEmpty()) {
            sendResponse(exchange, 404, "{\"error\":\"Product not found\"}");
            return;
        }
        Product product = optionalProduct.get();
        AmountUpdateRequest request = readRequestBody(exchange, AmountUpdateRequest.class);
        int newQuantity = product.quantity() + request.amount();
        productRepository.updateProduct(new Product(id, product.groupId(), product.name(), product.description(), product.manufacturer(), newQuantity, product.price()));
        sendResponse(exchange, 200, "{\"message\":\"Stock added successfully\"}");
    }

    private void handleSellStock(HttpExchange exchange, int id) throws IOException {
        Optional<Product> optionalProduct = productRepository.getProductById(id);
        if (optionalProduct.isEmpty()) {
            sendResponse(exchange, 404, "{\"error\":\"Product not found\"}");
            return;
        }
        Product product = optionalProduct.get();
        AmountUpdateRequest request = readRequestBody(exchange, AmountUpdateRequest.class);
        if (product.quantity() < request.amount()) {
            sendResponse(exchange, 400, "{\"error\":\"Not enough stock\"}");
            return;
        }
        int newQuantity = product.quantity() - request.amount();
        productRepository.updateProduct(new Product(id, product.groupId(), product.name(), product.description(), product.manufacturer(), newQuantity, product.price()));
        sendResponse(exchange, 200, "{\"message\":\"Stock sold successfully\"}");
    }

    private static class AmountUpdateRequest {
        private int amount;

        public int amount() {
            return amount;
        }
    }
} 