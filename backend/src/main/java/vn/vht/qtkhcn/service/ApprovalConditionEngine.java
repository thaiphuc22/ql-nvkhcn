package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.Iterator;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ApprovalConditionEngine {
    private static final int MAX_DEPTH = 12;
    private static final int MAX_NODES = 250;

    public void validate(JsonNode root) {
        int[] count = {0};
        validateNode(root, 0, count, true);
    }

    public boolean evaluate(JsonNode root, Map<String, Object> context) {
        validate(root);
        return evaluateNode(root, context);
    }

    private void validateNode(JsonNode node, int depth, int[] count, boolean root) {
        if (node == null || !node.isObject()) {
            throw new IllegalArgumentException("Mỗi node điều kiện phải là một JSON object.");
        }
        if (depth > MAX_DEPTH || ++count[0] > MAX_NODES) {
            throw new IllegalArgumentException("Cây điều kiện vượt giới hạn 12 tầng hoặc 250 node.");
        }
        String kind = text(node, "kind");
        if ("group".equals(kind)) {
            String logic = text(node, "logic");
            if (!"AND".equals(logic) && !"OR".equals(logic)) {
                throw new IllegalArgumentException("Nhóm điều kiện chỉ chấp nhận logic AND hoặc OR.");
            }
            JsonNode items = node.get("items");
            if (items == null || !items.isArray()) {
                throw new IllegalArgumentException("Nhóm điều kiện phải có mảng items.");
            }
            for (JsonNode item : items) {
                validateNode(item, depth + 1, count, false);
            }
            return;
        }
        if (root || !"condition".equals(kind)) {
            throw new IllegalArgumentException(root
                    ? "Node gốc của conditions phải là group."
                    : "kind chỉ chấp nhận group hoặc condition.");
        }
        if (text(node, "field").isBlank()) {
            throw new IllegalArgumentException("Điều kiện phải có field.");
        }
        String operator = text(node, "operator");
        if (!java.util.Set.of("eq", "neq", "gt", "gte", "lt", "lte", "between", "in",
                "contains", "exists", "notExists").contains(operator)) {
            throw new IllegalArgumentException("Toán tử điều kiện không được hỗ trợ: " + operator);
        }
        if (!operator.equals("exists") && !operator.equals("notExists") && !node.has("value")) {
            throw new IllegalArgumentException("Toán tử " + operator + " cần value.");
        }
        if (operator.equals("between") && !node.has("valueTo")) {
            throw new IllegalArgumentException("Toán tử between cần valueTo.");
        }
    }

    private boolean evaluateNode(JsonNode node, Map<String, Object> context) {
        if ("group".equals(node.path("kind").asText())) {
            JsonNode items = node.path("items");
            if (items.isEmpty()) {
                return true;
            }
            if ("AND".equals(node.path("logic").asText())) {
                for (JsonNode item : items) {
                    if (!evaluateNode(item, context)) return false;
                }
                return true;
            }
            for (JsonNode item : items) {
                if (evaluateNode(item, context)) return true;
            }
            return false;
        }

        String field = node.path("field").asText();
        String operator = node.path("operator").asText();
        Object actual = context.get(field);
        if ("exists".equals(operator)) return actual != null;
        if ("notExists".equals(operator)) return actual == null;
        if (actual == null) return false;

        JsonNode value = node.get("value");
        return switch (operator) {
            case "eq" -> equal(actual, value);
            case "neq" -> !equal(actual, value);
            case "gt" -> compare(actual, value, comparison -> comparison > 0);
            case "gte" -> compare(actual, value, comparison -> comparison >= 0);
            case "lt" -> compare(actual, value, comparison -> comparison < 0);
            case "lte" -> compare(actual, value, comparison -> comparison <= 0);
            case "between" -> compare(actual, value, comparison -> comparison >= 0)
                    && compare(actual, node.get("valueTo"), comparison -> comparison <= 0);
            case "in" -> in(actual, value);
            case "contains" -> contains(actual, value);
            default -> false;
        };
    }

    private static boolean equal(Object actual, JsonNode expected) {
        BigDecimal left = number(actual);
        BigDecimal right = number(expected);
        if (left != null && right != null) return left.compareTo(right) == 0;
        if (actual instanceof Boolean bool && expected.isBoolean()) return bool == expected.asBoolean();
        return String.valueOf(actual).equals(expected.isTextual() ? expected.textValue() : expected.asText());
    }

    private static boolean compare(Object actual, JsonNode expected,
            java.util.function.IntPredicate predicate) {
        BigDecimal left = number(actual);
        BigDecimal right = number(expected);
        return left != null && right != null && predicate.test(left.compareTo(right));
    }

    private static boolean in(Object actual, JsonNode expected) {
        if (!expected.isArray()) return equal(actual, expected);
        for (JsonNode item : expected) {
            if (equal(actual, item)) return true;
        }
        return false;
    }

    private static boolean contains(Object actual, JsonNode expected) {
        if (actual instanceof Iterable<?> iterable) {
            for (Object item : iterable) if (equal(item, expected)) return true;
            return false;
        }
        if (actual.getClass().isArray()) {
            int length = java.lang.reflect.Array.getLength(actual);
            for (int i = 0; i < length; i++) {
                if (equal(java.lang.reflect.Array.get(actual, i), expected)) return true;
            }
            return false;
        }
        String needle = expected.isTextual() ? expected.textValue() : expected.asText();
        return String.valueOf(actual).contains(needle);
    }

    private static BigDecimal number(Object value) {
        try {
            if (value instanceof Number number) return new BigDecimal(number.toString());
            if (value instanceof String string && !string.isBlank()) return new BigDecimal(string);
            if (value instanceof JsonNode node && node.isNumber()) return node.decimalValue();
            if (value instanceof JsonNode node && node.isTextual() && !node.textValue().isBlank()) {
                return new BigDecimal(node.textValue());
            }
        } catch (NumberFormatException ignored) {
            // A non-numeric value simply cannot satisfy a numeric operator.
        }
        return null;
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() ? value.textValue() : "";
    }
}
