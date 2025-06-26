package ua.edu.ukma.clientserver.server.dao;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public abstract class BaseDao {

    private final Connection connection;

    public BaseDao() {
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