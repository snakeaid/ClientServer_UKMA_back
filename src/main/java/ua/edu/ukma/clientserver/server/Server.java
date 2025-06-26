package ua.edu.ukma.clientserver.server;

import com.sun.net.httpserver.HttpServer;
import ua.edu.ukma.clientserver.server.db.DbConnection;
import ua.edu.ukma.clientserver.server.db.ProductGroupRepository;
import ua.edu.ukma.clientserver.server.db.ProductRepository;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class Server {

    public static void main(String[] args) throws IOException {
        DbConnection dbConnection = new DbConnection();
        ProductGroupRepository productGroupRepository = new ProductGroupRepository(dbConnection);
        ProductRepository productRepository = new ProductRepository(dbConnection);

        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);

        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("Server is listening on port 8000");
    }
} 