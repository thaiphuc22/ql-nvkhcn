package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Component;

/** Safe condition evaluator; never executes user supplied code. */
@Component
public class ActionBusinessConditionEvaluator {
    private final ObjectMapper json;
    private final ApprovalConditionEngine trees;

    public ActionBusinessConditionEvaluator(ObjectMapper json, ApprovalConditionEngine trees) {
        this.json = json;
        this.trees = trees;
    }

    public boolean evaluate(String expression, Map<String, Object> context) {
        if (expression == null || expression.isBlank()) return true;
        String value = expression.trim();
        try {
            if (value.startsWith("{")) return trees.evaluate(json.readTree(value), flatten(context));
        } catch (Exception invalid) {
            throw new IllegalArgumentException("Business condition khong hop le.", invalid);
        }
        for (String clause : value.split("(?i)\\s+AND\\s+")) if (!clause(clause.trim(), context)) return false;
        return true;
    }

    private boolean clause(String clause, Map<String, Object> context) {
        var in = java.util.regex.Pattern.compile("^([A-Za-z0-9_.]+)\\s+in\\s+([A-Za-z0-9_.]+)$").matcher(clause);
        if (in.matches()) {
            Object needle = resolve(context, in.group(1));
            Object haystack = resolve(context, in.group(2));
            if (haystack instanceof Collection<?> values) return needle instanceof Collection<?> needles
                    ? needles.stream().anyMatch(values::contains) : values.contains(needle);
            return false;
        }
        var eq = java.util.regex.Pattern.compile("^([A-Za-z0-9_.]+)\\s*(?:=|==)\\s*(.+)$").matcher(clause);
        if (!eq.matches()) throw new IllegalArgumentException("Unsupported business condition: " + clause);
        Object actual = resolve(context, eq.group(1));
        String literal = eq.group(2).trim().replaceAll("^[\"']|[\"']$", "");
        Object expected = "true".equalsIgnoreCase(literal) ? true : "false".equalsIgnoreCase(literal) ? false : literal;
        return Objects.equals(actual, expected) || Objects.equals(String.valueOf(actual), String.valueOf(expected));
    }

    @SuppressWarnings("unchecked")
    private static Object resolve(Map<String, Object> context, String path) {
        Object current = context;
        for (String part : path.split("\\.")) {
            if (!(current instanceof Map<?, ?> map)) return null;
            current = ((Map<String, Object>) map).get(part);
        }
        return current;
    }

    private static Map<String, Object> flatten(Map<String, Object> source) {
        var result = new java.util.LinkedHashMap<String, Object>();
        flatten("", source, result);
        return result;
    }

    @SuppressWarnings("unchecked")
    private static void flatten(String prefix, Map<String, Object> source, Map<String, Object> target) {
        source.forEach((key, value) -> {
            String path = prefix.isEmpty() ? key : prefix + "." + key;
            target.put(path, value);
            if (value instanceof Map<?, ?> nested) flatten(path, (Map<String, Object>) nested, target);
        });
    }
}
