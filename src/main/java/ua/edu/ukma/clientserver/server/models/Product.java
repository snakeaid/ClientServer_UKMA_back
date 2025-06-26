package ua.edu.ukma.clientserver.server.models;

import java.math.BigDecimal;

public record Product(
    int id,
    int groupId,
    String name,
    String description,
    String manufacturer,
    int quantity,
    BigDecimal price
) {
} 