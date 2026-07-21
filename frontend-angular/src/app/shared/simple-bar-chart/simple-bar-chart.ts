import { Component, computed, input } from '@angular/core';

export interface BarChartItem {
  label: string;
  value: number;
  /** Màu riêng cho cột/thanh này (vd. tô theo trạng thái). Mặc định dùng `color()`. */
  color?: string;
}

interface RenderBar extends BarChartItem {
  /** % chiều dài thanh so với giá trị lớn nhất trong tập (0..100). */
  pct: number;
  fill: string;
}

/**
 * Biểu đồ cột đơn giản (1 chuỗi dữ liệu) dựng bằng CSS — không phụ thuộc thư viện
 * chart. Đối chiếu các BarChart (recharts) trong webapp/src/pages/Dashboard.tsx.
 * `orientation="vertical"` = cột dựng đứng (value trên đỉnh); `"horizontal"` = thanh
 * ngang (value ở cuối thanh, nhãn bên trái).
 */
@Component({
  selector: 'app-simple-bar-chart',
  standalone: true,
  templateUrl: './simple-bar-chart.html',
  styleUrl: './simple-bar-chart.scss',
})
export class SimpleBarChartComponent {
  readonly data = input.required<BarChartItem[]>();
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Màu mặc định khi item không tự khai `color`. */
  readonly color = input('#1677ff');
  /** Hậu tố hiển thị sau giá trị (vd. "ngày"). */
  readonly valueSuffix = input('');
  /** Chiều cao vùng vẽ cho biểu đồ dựng đứng (px). */
  readonly height = input(240);
  /** Xoay nhãn trục dưới (biểu đồ dựng đứng) khi nhãn dài. */
  readonly rotateLabels = input(false);

  readonly maxValue = computed(() => Math.max(...this.data().map((d) => d.value), 1));

  readonly bars = computed<RenderBar[]>(() => {
    const max = this.maxValue();
    return this.data().map((d) => ({
      ...d,
      pct: max > 0 ? Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0) : 0,
      fill: d.color ?? this.color(),
    }));
  });

  formatValue(v: number): string {
    const rounded = Number.isInteger(v) ? v : Math.round(v * 10) / 10;
    return this.valueSuffix() ? `${rounded}${this.valueSuffix()}` : `${rounded}`;
  }
}
