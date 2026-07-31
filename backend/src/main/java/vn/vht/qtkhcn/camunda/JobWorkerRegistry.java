package vn.vht.qtkhcn.camunda;

import io.camunda.client.annotation.JobWorker;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.TreeSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.ClassUtils;

/**
 * Những {@code zeebe:taskDefinition type} mà backend này THỰC SỰ có worker lắng nghe.
 *
 * <p>Lý do tồn tại: quyết định 2026-07-28 của user là cho deploy BPMN có service task mà không chặn.
 * Hệ quả đã nêu rõ — hồ sơ sẽ TREO tại service task không có worker, đúng lớp bug RD02.02 {@code Check}
 * ngày 2026-07-20. Không chặn được thì ít nhất phải NHÌN THẤY: màn đối soát quy trình đọc danh sách
 * này để chỉ ra service task nào sẽ treo, trước khi có hồ sơ chạy vào.
 *
 * <p>Quét bằng phản chiếu trên bean definition (đúng cách Spring MVC tự dò {@code @RequestMapping}),
 * KHÔNG hardcode danh sách job type: hardcode thì mỗi worker mới thêm vào là một lần quên cập nhật,
 * và màn đối soát sẽ báo "thiếu worker" cho worker đang chạy tốt.
 *
 * <p>Quét trễ (lần gọi đầu tiên) thay vì trong constructor: bean này được các service nghiệp vụ inject,
 * nên nếu quét ngay lúc dựng thì thứ tự khởi tạo bean quyết định kết quả quét.
 */
@Component
public class JobWorkerRegistry {
    private static final Logger log = LoggerFactory.getLogger(JobWorkerRegistry.class);

    private final ApplicationContext context;
    private volatile Set<String> types;

    public JobWorkerRegistry(ApplicationContext context) {
        this.context = context;
    }

    /** Job type khai báo tường minh ở {@code @JobWorker(type = "...")}, đã sắp xếp. */
    public Set<String> registeredTypes() {
        Set<String> snapshot = types;
        if (snapshot == null) {
            synchronized (this) {
                if (types == null) types = scan();
                snapshot = types;
            }
        }
        return snapshot;
    }

    public boolean hasWorker(String jobType) {
        return jobType != null && !jobType.isBlank() && registeredTypes().contains(jobType.trim());
    }

    private Set<String> scan() {
        Set<String> found = new TreeSet<>();
        for (String beanName : context.getBeanDefinitionNames()) {
            Class<?> beanType;
            try {
                // allowFactoryBeanInit=false: chỉ hỏi kiểu, không ép khởi tạo FactoryBean chỉ để quét.
                beanType = context.getType(beanName, false);
            } catch (RuntimeException notResolvable) {
                continue;
            }
            if (beanType == null) continue;
            for (Method method : ClassUtils.getUserClass(beanType).getMethods()) {
                JobWorker annotation = AnnotatedElementUtils.findMergedAnnotation(method, JobWorker.class);
                // type rỗng nghĩa là Camunda tự suy job type từ tên method. Dự án này luôn khai báo
                // tường minh, nên coi trường hợp rỗng là "không biết chắc" và bỏ qua thay vì đoán —
                // đoán sai sẽ làm màn đối soát báo xanh cho một service task thực ra sẽ treo.
                if (annotation != null && !annotation.type().isBlank()) found.add(annotation.type().trim());
            }
        }
        log.info("Job worker đang lắng nghe: {}", found);
        // unmodifiableSet trên TreeSet chứ không Set.copyOf: giữ thứ tự sắp xếp để danh sách hiện ra
        // màn đối soát/log luôn ổn định, dễ so sánh giữa hai lần chạy.
        return java.util.Collections.unmodifiableSet(found);
    }
}
