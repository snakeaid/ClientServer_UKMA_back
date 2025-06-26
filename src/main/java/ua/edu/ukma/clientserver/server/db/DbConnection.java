package ua.edu.ukma.clientserver.server.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public abstract class DbConnection {

    private final Connection connection;

    public DbConnection() {
        String url = "jdbc:postgresql://localhost:5432/mydb";
        String user = "root";
        String password = "root";
        String driver = "org.postgresql.Driver";

        try {
            Class.forName(driver);
            this.connection = DriverManager.getConnection(url, user, password);
        } catch (SQLException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    protected Connection getConnection() {
        return connection;
    }
} 