package ua.edu.ukma.clientserver.server.db;

import ua.edu.ukma.clientserver.server.models.ProductGroup;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ProductGroupRepository {
    private final DbConnection dbConnection;

    public ProductGroupRepository(DbConnection dbConnection) {
        this.dbConnection = dbConnection;
    }

    public ProductGroup createProductGroup(ProductGroup group) {
        String sql = "INSERT INTO product_groups(name, description) VALUES (?, ?)";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, group.name());
            statement.setString(2, group.description());
            statement.executeUpdate();
            ResultSet rs = statement.getGeneratedKeys();
            if (rs.next()) {
                int newId = rs.getInt(1);
                return new ProductGroup(newId, group.name(), group.description());
            }
            throw new SQLException("Creating product group failed, no ID obtained.");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<ProductGroup> getAllProductGroups() {
        String sql = "SELECT * FROM product_groups ORDER BY id";
        List<ProductGroup> groups = new ArrayList<>();
        try (Statement statement = dbConnection.getConnection().createStatement()) {
            ResultSet rs = statement.executeQuery(sql);
            while (rs.next()) {
                groups.add(mapRowToProductGroup(rs));
            }
            return groups;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<ProductGroup> getProductGroupById(int id) {
        String sql = "SELECT * FROM product_groups WHERE id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                return Optional.of(mapRowToProductGroup(rs));
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<ProductGroup> getProductGroupByName(String name) {
        String sql = "SELECT * FROM product_groups WHERE name = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setString(1, name);
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                return Optional.of(mapRowToProductGroup(rs));
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void updateProductGroup(ProductGroup group) {
        String sql = "UPDATE product_groups SET name = ?, description = ? WHERE id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setString(1, group.name());
            statement.setString(2, group.description());
            statement.setInt(3, group.id());
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteProductGroup(int id) {
        String sql = "DELETE FROM product_groups WHERE id = ?";
        try (PreparedStatement statement = dbConnection.getConnection().prepareStatement(sql)) {
            statement.setInt(1, id);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private ProductGroup mapRowToProductGroup(ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        String name = rs.getString("name");
        String description = rs.getString("description");
        return new ProductGroup(id, name, description);
    }
} 