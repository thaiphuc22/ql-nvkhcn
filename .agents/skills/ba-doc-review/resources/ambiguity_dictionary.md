# 🔍 Ambiguity Dictionary — Từ mơ hồ cần flag

> Tài liệu nghiệp vụ phải đo lường được. Mọi từ dưới đây xuất hiện
> trong requirement statement (không phải Glossary/Comment) → flag là
> **Major finding** (Clarity violation).

---

## Quy tắc match

- Match từ **độc lập** (whole word), không match substring
- Case-insensitive
- Match cả tiếng Việt và tiếng Anh
- BỎ QUA nếu nằm trong:
  - Section "Glossary"
  - HTML/Markdown comment `<!-- ... -->`
  - Quote/dialogue (`> "..."`)
  - Section "Future / Phase 2 / Out of scope"

---

## 1. Tiếng Việt — Performance/Speed

| Từ | Ví dụ sai | Suggested fix |
|---|---|---|
| **nhanh** | "phản hồi nhanh" | "phản hồi ≤2 giây (p95)" |
| **chậm** | "không bị chậm" | "throughput ≥1000 req/s" |
| **tức thì** | "load tức thì" | "First Contentful Paint ≤1s" |
| **thời gian thực** | "data realtime" | "latency ≤500ms từ source" |
| **mượt mà** | "scroll mượt" | "60fps trên iPhone 12+" |

---

## 2. Tiếng Việt — UX/Quality

| Từ | Ví dụ sai | Suggested fix |
|---|---|---|
| **dễ dùng** | "UI dễ dùng" | "Onboarding completion rate ≥85% trong ≤5 phút" |
| **đơn giản** | "flow đơn giản" | "Hoàn thành task trong ≤3 click" |
| **thuận tiện** | "thuận tiện cho user" | (nêu metric cụ thể: NPS, task time, ...) |
| **thân thiện** | "UI thân thiện" | "WCAG 2.1 AA + NPS ≥8" |
| **trực quan** | "dashboard trực quan" | (nêu chart types + KPI hiển thị) |
| **đẹp** | "UI đẹp" | (link Figma + brand guideline ref) |
| **chuyên nghiệp** | "tài liệu chuyên nghiệp" | (nêu template + quality criteria) |
| **chất lượng** | "code chất lượng" | "Coverage ≥80%, lint pass, complexity ≤10" |
| **tốt** | "performance tốt" | (nêu metric: response time, throughput) |
| **ổn** | "hệ thống ổn" | "Uptime ≥99.9%, MTBF ≥30 ngày" |
| **mạnh mẽ** | "search mạnh mẽ" | "Hỗ trợ filter X, fuzzy match, ≤200ms" |

---

## 3. Tiếng Việt — Scope/Adaptability

| Từ | Ví dụ sai | Suggested fix |
|---|---|---|
| **phù hợp** | "phù hợp với user" | (nêu persona + use case cụ thể) |
| **linh hoạt** | "config linh hoạt" | (liệt kê các config option cụ thể) |
| **đa dạng** | "đa dạng options" | (liệt kê N options) |
| **phong phú** | "feature phong phú" | (liệt kê features) |
| **tối ưu** | "tối ưu performance" | (nêu metric target: ≤Xs, ≥Y req/s) |
| **hiệu quả** | "xử lý hiệu quả" | (nêu throughput hoặc cost metric) |
| **toàn diện** | "report toàn diện" | (liệt kê dimensions/sections) |
| **đầy đủ** | "thông tin đầy đủ" | (liệt kê fields bắt buộc) |
| **phổ biến** | "format phổ biến" | (nêu cụ thể: PDF, Excel xlsx, ...) |

---

## 4. Tiếng Việt — Frequency/Quantity (mơ hồ)

| Từ | Ví dụ sai | Suggested fix |
|---|---|---|
| **nhiều** | "hỗ trợ nhiều browser" | "Hỗ trợ Chrome ≥90, Safari ≥14, Edge ≥90, Firefox ≥88" |
| **ít** | "ít lỗi" | "≤0.1% error rate" |
| **lớn** | "data lớn" | "≥1TB/ngày" hoặc "≥10K records/request" |
| **nhỏ** | "footprint nhỏ" | "Bundle ≤500KB gzipped" |
| **thường xuyên** | "update thường xuyên" | "Hằng ngày 2h sáng" |
| **định kỳ** | "backup định kỳ" | "Hằng tuần Chủ nhật, retain 30 ngày" |
| **một số** | "một số lỗi" | (liệt kê cụ thể từng lỗi) |
| **vài** | "vài user complain" | (nêu số: 5/100 = 5%) |

---

## 5. English equivalents

| Word | Suggested replacement |
|---|---|
| **fast** | Specify response time / throughput |
| **slow** | Specify metric threshold |
| **easy** | Specify completion rate / time |
| **simple** | Specify number of steps |
| **flexible** | List specific options/configs |
| **scalable** | Specify scale numbers (10K → 1M users) |
| **robust** | Specify uptime / error tolerance |
| **user-friendly** | NPS / task success rate |
| **intuitive** | Onboarding metrics |
| **modern** | Specify tech stack / standard |
| **efficient** | Throughput / cost per unit |
| **optimal** | Specific optimization target |
| **various** | List the items |
| **multiple** | Specify number |
| **frequently** | Cron schedule |
| **rarely** | Specific frequency |
| **better** | Better than what? Baseline + target |
| **improved** | Specific improvement metric |
| **enhanced** | What was added/changed |

---

## 6. Modal verbs to verify

| Word | Check |
|---|---|
| **should** | Có phải requirement không? Hay là gợi ý? |
| **could** | MoSCoW Could → có ID + priority? |
| **may** | Optional → có flag rõ? |
| **might** | Quá yếu cho requirement → reword |
| **probably** | Không acceptable trong spec |
| **maybe** | Không acceptable trong spec |

---

## 7. Vague Quantifiers

| Phrase | Issue |
|---|---|
| "as soon as possible" | Khi nào cụ thể? |
| "in real-time" | Latency target? |
| "near-real-time" | ≤Xs? |
| "high availability" | SLA % cụ thể? |
| "secure" | Encryption standard? Auth method? |
| "compliant" | Standard nào (GDPR/PCI/ISO)? |
| "scalable" | From X to Y? |
| "responsive" | Breakpoints? Devices? |

---

## 8. Special cases — KHÔNG flag

Các trường hợp **DÙ có từ mơ hồ** nhưng KHÔNG flag:

1. **Trong Glossary** — định nghĩa term
   ```
   "Power user" — user đăng nhập ≥5 lần/tuần
   ```

2. **Trong Quote/Dialogue** — không phải requirement
   ```
   > Sponsor nói: "Em muốn UX phải dễ dùng hơn đối thủ"
   ```

3. **Trong Out-of-Scope / Future** — không phải in-scope spec
   ```
   ## Out of Scope
   - Phase 2: Tối ưu thêm performance khi có data >1TB
   ```

4. **Adjective cho nội dung doc** — không phải requirement
   ```
   "Tài liệu này mô tả đầy đủ requirement của module..."
   ```

5. **Tham chiếu industry standard**
   ```
   "Tuân thủ chuẩn web modern (ECMAScript 2022+)"
   ```

---

## 9. Workflow

```
For each line in document:
  If line contains word from dictionary:
    If line in Glossary/Comment/Quote/Out-of-scope:
      Skip
    Else:
      Flag as Major finding
      Severity: Major
      Suggested fix: Use replacement from dictionary
      Reference: ambiguity_dictionary.md §<section>
```

---

## 10. Custom Additions

Bạn có thể thêm từ vào dictionary nếu phát hiện ambiguity riêng của domain:

```markdown
## Custom — Domain-specific ambiguity

| Từ | Domain | Suggested fix |
|---|---|---|
| **affordable** | E-commerce | Specify price range |
| **premium** | SaaS | Define tier features |
| ... | ... | ... |
```
