package ua.edu.ukma.clientserver.server.db;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public abstract class BaseRepositoryTest {

    private static final String JDBC_URL = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1";
    private static final String USER = "sa";
    private static final String PASSWORD = "";

    protected Connection connection;
    protected DbConnection dbConnection;

    @BeforeEach
    void setUp() throws SQLException, IOException {
        connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
        dbConnection = new DbConnection() {
            @Override
            public Connection getConnection() {
                return connection;
            }
        };
        runInitScript();
    }

    @AfterEach
    void tearDown() throws SQLException {
        try (Statement st = connection.createStatement()) {
            st.execute("DROP ALL OBJECTS");
        }
        connection.close();
    }

    private void runInitScript() throws IOException, SQLException {
        try (Reader reader = new InputStreamReader(
                BaseRepositoryTest.class.getClassLoader().getResourceAsStream("init.sql"),
                StandardCharsets.UTF_8
        )) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader br = new BufferedReader(reader)) {
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                    if (!line.trim().endsWith(";")) {
                        sb.append(System.lineSeparator());
                    } else {
                        sb.append(" ");
                    }
                }
            }

            String[] a = sb.toString().split(";");
            for (String s : a) {
                if (!s.trim().isEmpty()) {
                    try (Statement st = connection.createStatement()) {
                        st.execute(s);
                    }
                }
            }
        }
    }
} 