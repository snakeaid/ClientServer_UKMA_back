package ua.edu.ukma.clientserver.server.handlers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import ua.edu.ukma.clientserver.util.EncryptionUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public abstract class BaseHandler implements HttpHandler {

    protected final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            // Set CORS headers
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1); // No Content
                return;
            }

            handleRequest(exchange);
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Internal Server Error\"}");
        }
    }

    protected abstract void handleRequest(HttpExchange exchange) throws IOException;

    protected <T> T readRequestBody(HttpExchange exchange, Class<T> type) throws IOException {
        String encryptedBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        String json = EncryptionUtil.decrypt(encryptedBody);
        return gson.fromJson(json, type);
    }

    protected void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        String encryptedResponse = EncryptionUtil.encrypt(response);

        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, encryptedResponse.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(encryptedResponse.getBytes());
        os.close();
    }
} 