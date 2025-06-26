package ua.edu.ukma.clientserver.server.handlers;

import com.sun.net.httpserver.HttpExchange;
import ua.edu.ukma.clientserver.server.db.ProductGroupRepository;
import ua.edu.ukma.clientserver.server.models.ProductGroup;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class ProductGroupHandler extends BaseHandler {

    private final ProductGroupRepository productGroupRepository;

    public ProductGroupHandler(ProductGroupRepository productGroupRepository) {
        this.productGroupRepository = productGroupRepository;
    }

    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (path.equals("/api/groups")) {
            if (method.equals("GET")) {
                handleGetAllGroups(exchange);
            } else if (method.equals("POST")) {
                handleCreateGroup(exchange);
            }
        } else if (path.matches("/api/groups/\\d+")) {
            int id = Integer.parseInt(path.substring(path.lastIndexOf('/') + 1));
            if (method.equals("GET")) {
                handleGetGroupById(exchange, id);
            } else if (method.equals("PUT")) {
                handleUpdateGroup(exchange, id);
            } else if (method.equals("DELETE")) {
                handleDeleteGroup(exchange, id);
            }
        } else {
            sendResponse(exchange, 404, "{\"error\":\"Not Found\"}");
        }
    }

    private void handleGetAllGroups(HttpExchange exchange) throws IOException {
        List<ProductGroup> groups = productGroupRepository.getAllProductGroups();
        sendResponse(exchange, 200, gson.toJson(groups));
    }

    private void handleCreateGroup(HttpExchange exchange) throws IOException {
        ProductGroup group = readRequestBody(exchange, ProductGroup.class);
        if (productGroupRepository.getProductGroupByName(group.name()).isPresent()) {
            sendResponse(exchange, 409, "{\"error\":\"Group with this name already exists\"}");
            return;
        }
        ProductGroup createdGroup = productGroupRepository.createProductGroup(group);
        sendResponse(exchange, 201, gson.toJson(createdGroup));
    }

    private void handleGetGroupById(HttpExchange exchange, int id) throws IOException {
        Optional<ProductGroup> group = productGroupRepository.getProductGroupById(id);
        if (group.isPresent()) {
            sendResponse(exchange, 200, gson.toJson(group.get()));
        } else {
            sendResponse(exchange, 404, "{\"error\":\"Group not found\"}");
        }
    }

    private void handleUpdateGroup(HttpExchange exchange, int id) throws IOException {
        ProductGroup group = readRequestBody(exchange, ProductGroup.class);
        if (productGroupRepository.getProductGroupById(id).isEmpty()) {
            sendResponse(exchange, 404, "{\"error\":\"Group not found\"}");
            return;
        }
        Optional<ProductGroup> existingGroupWithSameName = productGroupRepository.getProductGroupByName(group.name());
        if (existingGroupWithSameName.isPresent() && existingGroupWithSameName.get().id() != id) {
            sendResponse(exchange, 409, "{\"error\":\"Another group with this name already exists\"}");
            return;
        }
        productGroupRepository.updateProductGroup(new ProductGroup(id, group.name(), group.description()));
        sendResponse(exchange, 200, "{\"message\":\"Group updated successfully\"}");
    }

    private void handleDeleteGroup(HttpExchange exchange, int id) throws IOException {
        if (productGroupRepository.getProductGroupById(id).isEmpty()) {
            sendResponse(exchange, 404, "{\"error\":\"Group not found\"}");
            return;
        }
        productGroupRepository.deleteProductGroup(id);
        sendResponse(exchange, 200, "{\"message\":\"Group deleted successfully\"}");
    }
} 