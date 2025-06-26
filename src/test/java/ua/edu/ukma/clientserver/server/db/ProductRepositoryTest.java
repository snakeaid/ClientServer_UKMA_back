package ua.edu.ukma.clientserver.server.db;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ua.edu.ukma.clientserver.server.models.Product;
import ua.edu.ukma.clientserver.server.models.ProductGroup;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ProductRepositoryTest extends BaseRepositoryTest {

    private ProductRepository productRepository;
    private ProductGroupRepository productGroupRepository;
    private int groupId;

    @BeforeEach
    void setupRepos() {
        productGroupRepository = new ProductGroupRepository(dbConnection);
        productRepository = new ProductRepository(dbConnection);

        ProductGroup group = productGroupRepository.createProductGroup(new ProductGroup(0, "Test Group", ""));
        this.groupId = group.id();
    }

    @Test
    void testCreateAndGetProduct() {
        Product product = new Product(0, groupId, "Test Product", "Desc", "Manu", 10, BigDecimal.valueOf(9.99));
        Product createdProduct = productRepository.createProduct(product);

        assertNotEquals(0, createdProduct.id());
        assertEquals("Test Product", createdProduct.name());

        Optional<Product> foundProduct = productRepository.getProductById(createdProduct.id());
        assertTrue(foundProduct.isPresent());
        assertEquals("Test Product", foundProduct.get().name());
    }

    @Test
    void testUpdateProduct() {
        Product product = productRepository.createProduct(new Product(0, groupId, "Original Name", "Desc", "Manu", 10, BigDecimal.valueOf(9.99)));
        Product updatedProduct = new Product(product.id(), groupId, "New Name", "New Desc", "New Manu", 20, BigDecimal.valueOf(19.99));
        
        productRepository.updateProduct(updatedProduct);

        Optional<Product> foundProduct = productRepository.getProductById(product.id());
        assertTrue(foundProduct.isPresent());
        assertEquals("New Name", foundProduct.get().name());
        assertEquals(20, foundProduct.get().quantity());
    }
    
    @Test
    void testDeleteProduct() {
        Product product = productRepository.createProduct(new Product(0, groupId, "To Be Deleted", "Desc", "Manu", 10, BigDecimal.valueOf(9.99)));
        
        productRepository.deleteProduct(product.id());

        Optional<Product> foundProduct = productRepository.getProductById(product.id());
        assertFalse(foundProduct.isPresent());
    }

    @Test
    void testFindProducts() {
        productRepository.createProduct(new Product(0, groupId, "Apple", "A fruit", "Farm", 10, BigDecimal.ONE));
        productRepository.createProduct(new Product(0, groupId, "Banana", "A yellow fruit", "Farm", 20, BigDecimal.TEN));
        productRepository.createProduct(new Product(0, groupId, "Car", "A vehicle", "Factory", 30, BigDecimal.ZERO));

        List<Product> results = productRepository.findProducts("fruit");
        assertEquals(2, results.size());
    }

    @Test
    void testGetProductsByGroupId() {
        ProductGroup newGroup = productGroupRepository.createProductGroup(new ProductGroup(0, "Another Group", ""));
        productRepository.createProduct(new Product(0, groupId, "Product A", "", "", 1, BigDecimal.ONE));
        productRepository.createProduct(new Product(0, newGroup.id(), "Product B", "", "", 1, BigDecimal.ONE));

        List<Product> groupProducts = productRepository.getProductsByGroupId(groupId);
        assertEquals(1, groupProducts.size());
        assertEquals("Product A", groupProducts.get(0).name());
    }

    @Test
    void testGetTotalValue() {
        productRepository.createProduct(new Product(0, groupId, "P1", "", "", 10, BigDecimal.valueOf(1.50))); // 15.00
        productRepository.createProduct(new Product(0, groupId, "P2", "", "", 5, BigDecimal.valueOf(10.00))); // 50.00

        BigDecimal totalValue = productRepository.getTotalValue();
        assertEquals(0, BigDecimal.valueOf(65.00).compareTo(totalValue));
    }

    @Test
    void testGetTotalValueByGroupId() {
        ProductGroup newGroup = productGroupRepository.createProductGroup(new ProductGroup(0, "Another Group", ""));
        productRepository.createProduct(new Product(0, groupId, "P1", "", "", 10, BigDecimal.valueOf(1.50))); // 15.00
        productRepository.createProduct(new Product(0, newGroup.id(), "P2", "", "", 5, BigDecimal.valueOf(10.00))); // 50.00
        
        BigDecimal groupValue = productRepository.getTotalValueByGroupId(groupId);
        assertEquals(0, BigDecimal.valueOf(15.00).compareTo(groupValue));
    }
} 