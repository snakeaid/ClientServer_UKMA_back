package ua.edu.ukma.clientserver.server.db;

import ua.edu.ukma.clientserver.server.models.Product;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ProductRepository {
    private final DbConnection dbConnection;

    public ProductRepository(DbConnection dbConnection) {
        this.dbConnection = dbConnection;
    }

    public Product createProduct(Product product) {
        String sql = "INSERT INTO products(group_id, name, description, manufacturer, quantity, price) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setInt(1, product.groupId());
            statement.setString(2, product.name());
            statement.setString(3, product.description());
            statement.setString(4, product.manufacturer());
            statement.setInt(5, product.quantity());
            statement.setBigDecimal(6, product.price());
            statement.executeUpdate();
            ResultSet rs = statement.getGeneratedKeys();
            if (rs.next()) {
                int newId = rs.getInt(1);
                return new Product(newId, product.groupId(), product.name(), product.description(), product.manufacturer(), product.quantity(), product.price());
            }
            throw new SQLException("Creating product failed, no ID obtained.");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Product> getAllProducts() {
        String sql = "SELECT * FROM products ORDER BY id";
        List<Product> products = new ArrayList<>();
        try (Statement statement = dbConnection.getConnection().createStatement()) {
            ResultSet rs = statement.executeQuery(sql);
            while (rs.next()) {
                products.add(mapRowToProduct(rs));
            }
            return products;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<Product> getProductById(int id) {
        String sql = "SELECT * FROM products WHERE id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                return Optional.of(mapRowToProduct(rs));
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<Product> getProductByName(String name) {
        String sql = "SELECT * FROM products WHERE name = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setString(1, name);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                return Optional.of(mapRowToProduct(rs));
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void updateProduct(Product product) {
        String sql = "UPDATE products SET group_id = ?, name = ?, description = ?, manufacturer = ?, quantity = ?, price = ? WHERE id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, product.groupId());
            statement.setString(2, product.name());
            statement.setString(3, product.description());
            statement.setString(4, product.manufacturer());
            statement.setInt(5, product.quantity());
            statement.setBigDecimal(6, product.price());
            statement.setInt(7, product.id());
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteProduct(int id) {
        String sql = "DELETE FROM products WHERE id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Product> findProducts(String query) {
        String sql = "SELECT * FROM products WHERE name ILIKE ? OR description ILIKE ? OR manufacturer ILIKE ?";
        List<Product> products = new ArrayList<>();
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            String searchQuery = "%" + query + "%";
            statement.setString(1, searchQuery);
            statement.setString(2, searchQuery);
            statement.setString(3, searchQuery);
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                products.add(mapRowToProduct(rs));
            }
            return products;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Product> getProductsByGroupId(int groupId) {
        String sql = "SELECT * FROM products WHERE group_id = ? ORDER BY id";
        List<Product> products = new ArrayList<>();
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, groupId);
            ResultSet rs = statement.executeQuery();
            while (rs.next()) {
                products.add(mapRowToProduct(rs));
            }
            return products;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public BigDecimal getTotalValue() {
        String sql = "SELECT SUM(quantity * price) AS total_value FROM products";
        try (Statement statement = dbConnection.getConnection().createStatement()) {
            ResultSet rs = statement.executeQuery(sql);
            if (rs.next()) {
                return rs.getBigDecimal("total_value");
            }
            return BigDecimal.ZERO;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public BigDecimal getTotalValueByGroupId(int groupId) {
        String sql = "SELECT SUM(quantity * price) AS total_value FROM products WHERE group_id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, groupId);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                return rs.getBigDecimal("total_value");
            }
            return BigDecimal.ZERO;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private Product mapRowToProduct(ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        int groupId = rs.getInt("group_id");
        String name = rs.getString("name");
        String description = rs.getString("description");
        String manufacturer = rs.getString("manufacturer");
        int quantity = rs.getInt("quantity");
        BigDecimal price = rs.getBigDecimal("price");
        return new Product(id, groupId, name, description, manufacturer, quantity, price);
    }
} 