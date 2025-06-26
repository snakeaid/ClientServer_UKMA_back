package ua.edu.ukma.clientserver.server.db;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ua.edu.ukma.clientserver.server.models.ProductGroup;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ProductGroupRepositoryTest extends BaseRepositoryTest {

    private ProductGroupRepository productGroupRepository;

    @BeforeEach
    void setupRepos() {
        productGroupRepository = new ProductGroupRepository(dbConnection);
    }

    @Test
    void testCreateAndGetProductGroup() {
        ProductGroup group = new ProductGroup(0, "Groceries", "Food items");
        ProductGroup createdGroup = productGroupRepository.createProductGroup(group);

        assertNotEquals(0, createdGroup.id());
        assertEquals("Groceries", createdGroup.name());

        Optional<ProductGroup> foundGroup = productGroupRepository.getProductGroupById(createdGroup.id());
        assertTrue(foundGroup.isPresent());
        assertEquals("Groceries", foundGroup.get().name());
    }

    @Test
    void testGetAllProductGroups() {
        productGroupRepository.createProductGroup(new ProductGroup(0, "Group1", "Desc1"));
        productGroupRepository.createProductGroup(new ProductGroup(0, "Group2", "Desc2"));

        List<ProductGroup> groups = productGroupRepository.getAllProductGroups();
        assertEquals(2, groups.size());
    }

    @Test
    void testUpdateProductGroup() {
        ProductGroup group = productGroupRepository.createProductGroup(new ProductGroup(0, "Original Name", "Original Desc"));
        ProductGroup updatedGroup = new ProductGroup(group.id(), "New Name", "New Desc");

        productGroupRepository.updateProductGroup(updatedGroup);

        Optional<ProductGroup> foundGroup = productGroupRepository.getProductGroupById(group.id());
        assertTrue(foundGroup.isPresent());
        assertEquals("New Name", foundGroup.get().name());
        assertEquals("New Desc", foundGroup.get().description());
    }

    @Test
    void testDeleteProductGroup() {
        ProductGroup group = productGroupRepository.createProductGroup(new ProductGroup(0, "To Be Deleted", ""));
        
        productGroupRepository.deleteProductGroup(group.id());

        Optional<ProductGroup> foundGroup = productGroupRepository.getProductGroupById(group.id());
        assertFalse(foundGroup.isPresent());
    }

    @Test
    void testGetProductGroupByName() {
        productGroupRepository.createProductGroup(new ProductGroup(0, "FindMe", ""));
        
        Optional<ProductGroup> foundGroup = productGroupRepository.getProductGroupByName("FindMe");
        assertTrue(foundGroup.isPresent());

        Optional<ProductGroup> notFoundGroup = productGroupRepository.getProductGroupByName("DoesNotExist");
        assertFalse(notFoundGroup.isPresent());
    }
} 