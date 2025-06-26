package ua.edu.ukma.clientserver.server;

import com.sun.net.httpserver.HttpServer;
import ua.edu.ukma.clientserver.server.db.DbConnection;
import ua.edu.ukma.clientserver.server.db.ProductGroupRepository;
import ua.edu.ukma.clientserver.server.db.ProductRepository;
import ua.edu.ukma.clientserver.server.handlers.ProductGroupHandler;
import ua.edu.ukma.clientserver.server.handlers.ProductHandler;
import ua.edu.ukma.clientserver.server.handlers.StatsHandler;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class Server {

    public static void main(String[] args) throws IOException {
        DbConnection dbConnection = new DbConnection();
        ProductGroupRepository productGroupRepository = new ProductGroupRepository(dbConnection);
        ProductRepository productRepository = new ProductRepository(dbConnection);

        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);

        server.createContext("/api/groups", new ProductGroupHandler(productGroupRepository));
        server.createContext("/api/products", new ProductHandler(productRepository));
        server.createContext("/api/stats/", new StatsHandler(productRepository));

        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("Server is listening on port 8000");
    }
} 