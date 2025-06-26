package ua.edu.ukma.clientserver.server.handlers;

import com.sun.net.httpserver.HttpExchange;
import ua.edu.ukma.clientserver.server.db.ProductRepository;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class StatsHandler extends BaseHandler {

    private final ProductRepository productRepository;

    public StatsHandler(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    protected void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (method.equals("GET")) {
            if (path.equals("/api/stats/total-value")) {
                handleGetTotalValue(exchange);
            } else if (path.matches("/api/stats/groups/\\d+/total-value")) {
                int groupId = Integer.parseInt(path.split("/")[4]);
                handleGetTotalValueByGroup(exchange, groupId);
            } else {
                sendResponse(exchange, 404, "{\"error\":\"Not Found\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
        }
    }

    private void handleGetTotalValue(HttpExchange exchange) throws IOException {
        BigDecimal totalValue = productRepository.getTotalValue();
        if (totalValue == null) {
            totalValue = BigDecimal.ZERO;
        }
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalValue", totalValue);
        sendResponse(exchange, 200, gson.toJson(response));
    }

    private void handleGetTotalValueByGroup(HttpExchange exchange, int groupId) throws IOException {
        BigDecimal totalValue = productRepository.getTotalValueByGroupId(groupId);
        if (totalValue == null) {
            totalValue = BigDecimal.ZERO;
        }
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalValue", totalValue);
        sendResponse(exchange, 200, gson.toJson(response));
    }
} 