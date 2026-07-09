<!DOCTYPE html>

<html class="light" lang="vi"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>MILITARY ECOSYSTEM - HQ COMMAND</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .sidebar-active {
            font-variation-settings: 'FILL' 1;
        }
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #e2dfde;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #936e6c;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "secondary-fixed-dim": "#c8c6c5",
                        "tertiary-fixed": "#94fa85",
                        "secondary-fixed": "#e5e2e1",
                        "tertiary": "#006e0d",
                        "error-container": "#ffdad6",
                        "surface-container-highest": "#e3e2e2",
                        "on-primary-container": "#150001",
                        "on-tertiary-fixed": "#002201",
                        "surface-variant": "#e3e2e2",
                        "primary": "#bf0027",
                        "inverse-surface": "#303031",
                        "error": "#ba1a1a",
                        "on-tertiary-container": "#000700",
                        "surface-container-high": "#e9e8e7",
                        "surface-container": "#efeded",
                        "primary-fixed": "#ffdad8",
                        "surface": "#fbf9f9",
                        "outline": "#936e6c",
                        "on-tertiary-fixed-variant": "#005307",
                        "on-tertiary": "#ffffff",
                        "on-primary": "#ffffff",
                        "surface-tint": "#bf0027",
                        "inverse-primary": "#ffb3b0",
                        "tertiary-container": "#238923",
                        "surface-dim": "#dbdad9",
                        "on-primary-fixed-variant": "#92001b",
                        "surface-container-lowest": "#ffffff",
                        "surface-bright": "#fbf9f9",
                        "on-secondary-container": "#636262",
                        "inverse-on-surface": "#f2f0f0",
                        "outline-variant": "#e8bcba",
                        "on-primary-fixed": "#410007",
                        "surface-container-low": "#f5f3f3",
                        "primary-container": "#ee0033",
                        "secondary-container": "#e2dfde",
                        "primary-fixed-dim": "#ffb3b0",
                        "on-error-container": "#93000a",
                        "on-surface-variant": "#5e3f3e",
                        "on-secondary-fixed-variant": "#474746",
                        "on-secondary": "#ffffff",
                        "on-secondary-fixed": "#1b1b1b",
                        "on-surface": "#1b1c1c",
                        "tertiary-fixed-dim": "#79dd6c",
                        "on-error": "#ffffff",
                        "background": "#fbf9f9",
                        "secondary": "#5f5e5e",
                        "on-background": "#1b1c1c"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "sidebar-width": "240px",
                        "md": "1.5rem",
                        "xs": "0.5rem",
                        "sm": "1rem",
                        "lg": "2rem",
                        "xl": "3rem",
                        "base": "4px",
                        "gutter": "1rem"
                    },
                    "fontFamily": {
                        "headline-xl": ["Inter"],
                        "body-lg": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "small": ["Inter"],
                        "body-md": ["Inter"]
                    },
                    "fontSize": {
                        "headline-xl": ["48px", {"lineHeight": "60px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                        "label-md": ["14px", {"lineHeight": "20px", "fontWeight": "600"}],
                        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
                        "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "700"}],
                        "small": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
                        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden text-on-primary" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyognMT2mA56KuMruwl0Nu2QMaLRtsnZm99jpstroPOIfAKJg0v9J84mCypvf2bRCmtgTwd_uU4PTFMNFItY3d2XS73bkiKqacqYmHnYY4YVbvPYqrmQX6msQTf7isL6RFXGcmZ_YJEXuBWrwGlO6mRqBjqbAHaHuM5L-Y6mpcYmAiCqJoAaRnOHE4XEDiibJm4YqP1x4pgehEKScNmeDA8OFJPfW95E3PwExCvEdDbUj1Hy6wJpW-'); background-size: cover; background-attachment: fixed; background-position: center;">
<!-- SideNavBar (Authority: JSON) -->
<!-- Main Content Canvas -->
<main class="flex flex-col min-h-screen max-w-7xl mx-auto w-full">
<!-- TopNavBar (Authority: JSON) -->
<header class="flex justify-between items-center px-lg h-16 w-full z-50 bg-surface/10 backdrop-blur-md border-b border-outline-variant/20 sticky top-0">
<div class="flex items-center gap-md">
<span class="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight">MILITARY ECOSYSTEM</span>
</div>
<div class="flex items-center gap-sm">
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-secondary">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-secondary">
<span class="material-symbols-outlined">help</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed hover:shadow-md transition-all">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
<!-- Dashboard Content -->
<div class="p-lg flex-1">
<!-- Hero Header Section -->
<section class="mb-lg">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
<div>
<h2 class="font-headline-lg text-headline-lg mb-xs text-on-primary text-white">Trung tâm Điều hành Hệ sinh thái</h2>
<p class="font-body-md text-body-md text-secondary max-w-2xl text-secondary-fixed-dim">Chào mừng trở lại, Chỉ huy. Hệ thống đang hoạt động ở mức ổn định 99.8%. Vui lòng chọn một phân hệ bên dưới để bắt đầu tác vụ chuyên môn.</p>
</div>
<div class="flex items-center gap-xs text-tertiary font-label-md">
<span class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
</span>
<span>Môi trường: Sản xuất (Mainnet)</span>
</div>
</div>
<!-- Bento Quick Stats -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-sm mb-lg">
<div class="backdrop-blur-md border border-outline-variant/30 p-md rounded-lg shadow-sm hover:border-primary/50 transition-colors bg-surface-container-high/40">
<div class="text-label-md font-label-md uppercase tracking-wider mb-xs text-white">Tổng nhân sự</div>
<div class="font-headline-md text-headline-md text-white">12,482</div>
<div class="text-tertiary text-small flex items-center mt-xs"><span class="material-symbols-outlined text-sm mr-1">trending_up</span> +1.2% từ tháng trước</div>
</div>
<div class="backdrop-blur-md border border-outline-variant/30 p-md rounded-lg shadow-sm hover:border-primary/50 transition-colors bg-surface-container-high/40">
<div class="text-label-md font-label-md uppercase tracking-wider mb-xs text-white">Hiệu suất học viện</div>
<div class="font-headline-md text-headline-md text-white">94.5%</div>
<div class="w-full bg-surface-container rounded-full h-1.5 mt-md">
<div class="bg-tertiary h-1.5 rounded-full" style="width: 94%"></div>
</div>
</div>
<div class="backdrop-blur-md border border-outline-variant/30 p-md rounded-lg shadow-sm hover:border-primary/50 transition-colors bg-surface-container-high/40">
<div class="text-label-md font-label-md uppercase tracking-wider mb-xs text-white">Hậu cần khả dụng</div>
<div class="font-headline-md text-headline-md text-white">88%</div>
<div class="text-error text-small flex items-center mt-xs"><span class="material-symbols-outlined text-sm mr-1">warning</span> Cần tái cấp tại Kho 04</div>
</div>
<div class="backdrop-blur-md border border-outline-variant/30 p-md rounded-lg shadow-sm hover:border-primary/50 transition-colors bg-surface-container-high/40">
<div class="text-label-md font-label-md uppercase tracking-wider mb-xs text-white">Tải hệ thống</div>
<div class="font-headline-md text-headline-md text-white">14ms</div>
<div class="text-small mt-xs text-white">Độ trễ phản hồi trung bình</div>
</div>
</div>
</section>
<!-- Application Card Grid (Main Task) -->
<section>
<div class="flex items-center justify-between mb-md">
<h3 class="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">apps</span>
                        Phân hệ Hệ thống
                    </h3>
<div class="flex bg-surface-container rounded-lg p-1">
<button class="px-sm py-1 bg-surface-container-lowest shadow-sm rounded-md font-label-md text-label-md text-on-surface">Lưới</button>
<button class="px-sm py-1 text-secondary font-label-md text-label-md hover:text-on-surface transition-colors">Danh sách</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
<!-- Card 1: Chiến lược & Kế hoạch -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary transition-all duration-300">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-md">
<div class="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl group-hover:bg-primary-fixed transition-colors">
<span class="material-symbols-outlined text-primary text-[32px]">military_tech</span>
</div>
<span class="px-xs py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-small font-label-md rounded uppercase tracking-tighter">Sẵn sàng</span>
</div>
<h4 class="font-headline-md text-headline-md text-on-surface mb-xs">Chiến lược &amp; Kế hoạch</h4>
<p class="font-body-md text-body-md text-secondary leading-relaxed text-secondary-fixed-dim">
                                Quản lý lộ trình chiến lược dài hạn, lập kế hoạch tác chiến kỹ thuật số và mô phỏng kịch bản quốc phòng.
                            </p>
</div>
<div class="bg-surface-container-low p-sm flex items-center justify-between border-t border-outline-variant">
<span class="text-small text-secondary font-medium">Cập nhật: 2 giờ trước</span>
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-md py-1.5 rounded flex items-center gap-xs transition-colors active:scale-95">
                                Truy cập <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
<!-- Card 2: Học viện Quân sự -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary transition-all duration-300">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-md">
<div class="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl group-hover:bg-primary-fixed transition-colors">
<span class="material-symbols-outlined text-primary text-[32px]">school</span>
</div>
<span class="px-xs py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-small font-label-md rounded uppercase tracking-tighter">Sẵn sàng</span>
</div>
<h4 class="font-headline-md text-headline-md text-on-surface mb-xs">Học viện Quân sự</h4>
<p class="font-body-md text-body-md text-secondary leading-relaxed text-secondary-fixed-dim">
                                Nền tảng E-learning chuyên sâu cho quân nhân. Quản lý chứng chỉ, kết quả đào tạo và thư viện tài liệu mật.
                            </p>
</div>
<div class="bg-surface-container-low p-sm flex items-center justify-between border-t border-outline-variant">
<span class="text-small text-secondary font-medium">Học viên active: 1,200</span>
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-md py-1.5 rounded flex items-center gap-xs transition-colors active:scale-95">
                                Truy cập <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
<!-- Card 3: Hậu cần thông minh -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary transition-all duration-300">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-md">
<div class="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl group-hover:bg-primary-fixed transition-colors">
<span class="material-symbols-outlined text-primary text-[32px]">inventory_2</span>
</div>
<span class="px-xs py-0.5 bg-secondary-fixed-dim text-on-secondary-fixed-variant text-small font-label-md rounded uppercase tracking-tighter">Bảo trì</span>
</div>
<h4 class="font-headline-md text-headline-md text-on-surface mb-xs">Hậu cần thông minh</h4>
<p class="font-body-md text-body-md text-secondary leading-relaxed text-secondary-fixed-dim">
                                Hệ thống quản lý kho, cung ứng vật tư tự động và theo dõi lộ trình vận chuyển theo thời gian thực.
                            </p>
</div>
<div class="bg-surface-container-low p-sm flex items-center justify-between border-t border-outline-variant">
<span class="text-small text-error font-medium">Bảo trì định kỳ: 14:00 - 16:00</span>
<button class="bg-secondary-fixed-dim text-on-secondary font-label-md text-label-md px-md py-1.5 rounded cursor-not-allowed">
                                Tạm khóa
                            </button>
</div>
</div>
<!-- Card 4: Quản lý Nhân sự -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary transition-all duration-300">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-md">
<div class="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl group-hover:bg-primary-fixed transition-colors">
<span class="material-symbols-outlined text-primary text-[32px]">groups</span>
</div>
<span class="px-xs py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-small font-label-md rounded uppercase tracking-tighter">Sẵn sàng</span>
</div>
<h4 class="font-headline-md text-headline-md text-on-surface mb-xs">Quản lý Nhân sự</h4>
<p class="font-body-md text-body-md text-secondary leading-relaxed text-secondary-fixed-dim">
                                Cơ sở dữ liệu tập trung về quân hàm, điều động đơn vị và đánh giá năng lực cán bộ định kỳ.
                            </p>
</div>
<div class="bg-surface-container-low p-sm flex items-center justify-between border-t border-outline-variant">
<span class="text-small text-secondary font-medium">Tổng hồ sơ: 450k+</span>
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-md py-1.5 rounded flex items-center gap-xs transition-colors active:scale-95">
                                Truy cập <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
<!-- Card 5: Giám sát Hệ thống -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary transition-all duration-300">
<div class="p-md flex-1">
<div class="flex justify-between items-start mb-md">
<div class="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl group-hover:bg-primary-fixed transition-colors">
<span class="material-symbols-outlined text-primary text-[32px]">monitoring</span>
</div>
<span class="px-xs py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-small font-label-md rounded uppercase tracking-tighter">Ổn định</span>
</div>
<h4 class="font-headline-md text-headline-md text-on-surface mb-xs">Giám sát Hệ thống</h4>
<p class="font-body-md text-body-md text-secondary leading-relaxed text-secondary-fixed-dim">
                                Dashboard giám sát hạ tầng mạng, bảo mật tường lửa và phát hiện các mối đe dọa không gian mạng.
                            </p>
</div>
<div class="bg-surface-container-low p-sm flex items-center justify-between border-t border-outline-variant">
<span class="text-small text-tertiary font-medium">Uptime: 99.98%</span>
<button class="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-md py-1.5 rounded flex items-center gap-xs transition-colors active:scale-95">
                                Truy cập <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
<!-- Placeholder for New App -->
<div class="border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center p-lg group hover:bg-surface-container transition-all cursor-pointer">
<div class="w-12 h-12 rounded-full border-2 border-outline flex items-center justify-center text-outline group-hover:text-primary group-hover:border-primary transition-colors">
<span class="material-symbols-outlined">add</span>
</div>
<p class="mt-sm font-label-md text-label-md text-secondary text-secondary-fixed-dim">Yêu cầu quyền truy cập</p>
<p class="text-small text-secondary/60">Liên hệ quản trị viên</p>
</div>
</div>
</section>
<!-- Bottom Information Panel -->
</div>
<!-- Footer Footer -->
<footer class="mt-auto border-t border-outline-variant p-md flex flex-col md:flex-row justify-between items-center text-secondary text-small">
<p>© 2024 Military Ecosystem Management. Bản quyền thuộc Bộ chỉ huy HQ COMMAND.</p>
<div class="flex gap-md mt-sm md:mt-0">
<a class="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a>
<a class="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a>
<a class="hover:text-primary transition-colors" href="#">Hệ thống Logs</a>
</div>
</footer>
</main>
<!-- Contextual Floating Action (Suppressed on main view, but here for demo if needed) -->
<!-- Suppression logic check: This is a Dashboard (Top level), so FAB is allowed if it fits. 
         Action: Quick Switcher / Add Module -->
<button class="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50 group">
<span class="material-symbols-outlined text-[28px]">speed</span>
<div class="absolute right-full mr-4 bg-inverse-surface text-on-primary-fixed px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Chế độ tác chiến nhanh
        </div>
</button>
<script>
        // Simple micro-interaction for cards
        document.querySelectorAll('.group').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            });
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.material-symbols-outlined');
                // Check if it's the active dashboard icon (stay filled)
                if (icon && !icon.classList.contains('sidebar-active')) {
                    icon.style.fontVariationSettings = "'FILL' 0";
                }
            });
        });

        // Search bar focus effect
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('ring-2', 'ring-primary/20');
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('ring-2', 'ring-primary/20');
        });
    </script>
</body></html>