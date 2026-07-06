<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>3PL Integration Hub | Command &amp; Control</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;900&amp;family=JetBrains+Mono:wght@500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary": "#ffffff",
                    "inverse-primary": "#abc7ff",
                    "on-primary-fixed": "#001b3f",
                    "on-primary-fixed-variant": "#24467c",
                    "primary-container": "#002d62",
                    "on-tertiary-container": "#d4815d",
                    "surface-variant": "#e2e2e5",
                    "surface": "#f9f9fc",
                    "on-surface-variant": "#43474f",
                    "on-secondary-fixed-variant": "#2e4b57",
                    "on-tertiary-fixed-variant": "#743417",
                    "inverse-on-surface": "#f0f0f3",
                    "surface-container-highest": "#e2e2e5",
                    "tertiary": "#330e00",
                    "inverse-surface": "#2f3133",
                    "on-primary-container": "#7796d1",
                    "on-secondary-container": "#4a6774",
                    "surface-dim": "#dadadc",
                    "secondary": "#466270",
                    "on-tertiary-fixed": "#360f00",
                    "on-surface": "#1a1c1e",
                    "surface-container-high": "#e8e8ea",
                    "primary": "#00193c",
                    "brand-red": "#EE0033",
                    "tertiary-fixed-dim": "#ffb597",
                    "tertiary-container": "#541d02",
                    "secondary-container": "#c6e4f4",
                    "surface-container-low": "#f3f3f6",
                    "primary-fixed-dim": "#abc7ff",
                    "on-error-container": "#93000a",
                    "on-background": "#1a1c1e",
                    "on-primary": "#ffffff",
                    "outline": "#747781",
                    "error": "#ba1a1a",
                    "background": "#f9f9fc",
                    "on-secondary": "#ffffff",
                    "surface-container-lowest": "#ffffff",
                    "outline-variant": "#c4c6d1",
                    "secondary-fixed-dim": "#adcbda",
                    "surface-container": "#eeeef0",
                    "primary-fixed": "#d7e2ff",
                    "error-container": "#ffdad6",
                    "surface-bright": "#f9f9fc",
                    "on-secondary-fixed": "#001f2a",
                    "secondary-fixed": "#c9e7f7",
                    "tertiary-fixed": "#ffdbcd",
                    "surface-tint": "#3e5e95",
                    "on-error": "#ffffff"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "gutter": "16px",
                    "xs": "4px",
                    "xl": "32px",
                    "md": "16px",
                    "base": "4px",
                    "lg": "24px",
                    "sm": "8px",
                    "margin": "24px"
            },
            "fontFamily": {
                    "headline-sm": ["Public Sans"],
                    "headline-lg": ["Public Sans"],
                    "body-lg": ["Public Sans"],
                    "label-technical": ["JetBrains Mono"],
                    "headline-md": ["Public Sans"],
                    "body-md": ["Public Sans"]
            },
            "fontSize": {
                    "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                    "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-technical": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
                    "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #c4c6d1;
            border-radius: 10px;
        }
        .bento-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bento-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .status-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen">
<!-- Side Navigation Bar -->
<aside class="h-screen w-64 fixed left-0 top-0 flex flex-col bg-primary dark:bg-primary-container border-r border-outline dark:border-outline-variant z-50 shadow-lg dark:shadow-none">
<div class="bg-brand-red text-on-error font-headline-sm text-headline-sm px-4 py-6 w-full text-center font-black">
            STRATCOM
        </div>
<div class="p-4 flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant overflow-hidden">
<img class="w-full h-full object-cover" data-alt="A professional military insignia badge, circular with sharp geometric eagles and silver metallic textures on a deep navy background. The lighting is dramatic and cinematic, highlighting the intricate 3D details of the emblem." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDNsyXGRSOE_-roirdQbUSwJGbuFFZyJIdGSO_kIJ0ueTM7I67R2x2Y0aKDT85w8Z_kgBaNwYIvU6xF_wwDt5TTIXaTvtjkvr4nkLW-_Lhwew1wsqgU4b9mxLThwqUGAZKeICimWf7JFtshASZqPRqwqZQlVQvF1jFSGYwy8ZDsoaTHA6TX8K14J5ytiOhuau9sGiazSvqA4K_BBlBnDgmT7aKZNlj_9Uo3aYMYL9gDjh7fjplm3my"/>
</div>
<div>
<p class="font-label-technical text-label-technical text-on-primary opacity-90 uppercase">Enterprise Mgmt</p>
<p class="font-body-md text-body-md text-on-primary font-bold">Unit Commander</p>
</div>
</div>
<nav class="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
<!-- Mission Overview -->
<a class="text-on-primary-fixed-variant hover:text-on-primary px-4 py-3 flex items-center gap-3 hover:bg-primary-fixed-dim/10 transition-all cursor-pointer" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-technical text-label-technical">Mission Overview</span>
</a>
<!-- Process Control (Active) -->
<a class="bg-primary-container text-on-primary-container border-l-4 border-brand-red px-4 py-3 flex items-center gap-3 transition-all" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">account_tree</span>
<span class="font-label-technical text-label-technical">Process Control</span>
</a>
<!-- Personnel -->
<a class="text-on-primary-fixed-variant hover:text-on-primary px-4 py-3 flex items-center gap-3 hover:bg-primary-fixed-dim/10 transition-all cursor-pointer" href="#">
<span class="material-symbols-outlined">groups</span>
<span class="font-label-technical text-label-technical">Personnel</span>
</a>
<!-- Intelligence -->
<a class="text-on-primary-fixed-variant hover:text-on-primary px-4 py-3 flex items-center gap-3 hover:bg-primary-fixed-dim/10 transition-all cursor-pointer" href="#">
<span class="material-symbols-outlined">psychology</span>
<span class="font-label-technical text-label-technical">Intelligence</span>
</a>
<!-- Archive -->
<a class="text-on-primary-fixed-variant hover:text-on-primary px-4 py-3 flex items-center gap-3 hover:bg-primary-fixed-dim/10 transition-all cursor-pointer" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-label-technical text-label-technical">Archive</span>
</a>
</nav>
<div class="p-4 border-t border-outline/20">
<div class="bg-surface-container-highest/10 rounded-lg p-3 mb-4">
<p class="font-label-technical text-label-technical text-on-primary/60 mb-1">System Status</p>
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500 status-pulse"></div>
<p class="font-label-technical text-label-technical text-on-primary">Operational: Active</p>
</div>
</div>
<button class="w-full text-on-primary-fixed-variant hover:text-on-primary px-4 py-2 flex items-center gap-3 hover:bg-primary-fixed-dim/10 transition-all">
<span class="material-symbols-outlined">logout</span>
<span class="font-label-technical text-label-technical uppercase">Log Out</span>
</button>
</div>
</aside>
<!-- Main Content Area -->
<main class="ml-64 min-h-screen flex flex-col">
<!-- Top App Bar -->
<header class="w-full h-16 sticky top-0 z-40 flex items-center justify-between px-6 bg-surface dark:bg-surface-dim border-b border-outline-variant shadow-sm transition-colors">
<div class="flex items-center gap-4 flex-1">
<div class="relative max-w-md w-full">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="w-full bg-surface-container-low border border-outline-variant rounded-full py-1.5 pl-10 pr-4 focus:ring-2 focus:ring-brand-red focus:border-transparent font-body-md transition-all outline-none" placeholder="Search systems or partners..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button class="font-label-technical text-label-technical text-primary hover:text-brand-red transition-colors cursor-pointer px-3 py-1">Help Center</button>
<div class="flex items-center gap-2 border-l border-outline-variant pl-4">
<button class="p-2 hover:bg-surface-container-highest rounded-full transition-colors relative">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full"></span>
</button>
<button class="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">settings</span>
</button>
<div class="w-8 h-8 rounded-full bg-primary overflow-hidden ml-2 cursor-pointer border border-outline-variant">
<img class="w-full h-full object-cover" data-alt="A clean, professional headshot of a female logistics director in her late 30s, wearing business formal attire. The portrait is high-definition, with soft studio lighting and a neutral grey background, embodying corporate authority and precision." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzLN6TUUqFmIF_-aYHKNuhu5QrfiSocBZ55LN2N_GqSIxSq1lOzs91lgvJOvI2d8yPKIkoaW2mwcxS2vGRsqgwebTD3svUEwPuy3w8QKu9d8Jwn0wshMjzJ6FPdqqOL-1MISKoNxZU8LqM0yIgjKcbPXPxtIBME7vGbiFGcX-GUYVbwDhJrOorn2DSx8pXj-tXtwR65pKfGXeLpCfBziYlfcboRNom_WTxAQ3qcTeDV8lZLvvX5Lep"/>
</div>
</div>
</div>
</header>
<!-- Page Header -->
<section class="p-8">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
<div>
<h1 class="font-headline-lg text-headline-lg text-primary tracking-tight">3PL Integration Hub</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Monitor and manage third-party logistics connectivity. Securely configure API keys, webhooks, and synchronization schedules across global carriers.</p>
</div>
<div class="flex gap-3">
<button class="bg-surface-container-highest text-primary font-label-technical text-label-technical px-6 py-2.5 border border-outline-variant flex items-center gap-2 hover:bg-surface-container-high transition-all active:scale-95">
<span class="material-symbols-outlined">download</span>
                        EXPORT REPORT
                    </button>
<button class="bg-brand-red text-white font-label-technical text-label-technical px-6 py-2.5 flex items-center gap-2 hover:brightness-110 shadow-md transition-all active:scale-95">
<span class="material-symbols-outlined">add</span>
                        ADD PROVIDER
                    </button>
</div>
</div>
<!-- Stats/Summary Bar (Bento style) -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
<div class="bg-white p-4 border-l-4 border-brand-red shadow-sm">
<p class="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">Active Partners</p>
<p class="font-headline-md text-headline-md text-primary">12 / 14</p>
</div>
<div class="bg-white p-4 border-l-4 border-primary shadow-sm">
<p class="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">Global Health</p>
<p class="font-headline-md text-headline-md text-primary">98.4%</p>
</div>
<div class="bg-white p-4 border-l-4 border-secondary shadow-sm">
<p class="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">Pending Sync</p>
<p class="font-headline-md text-headline-md text-primary">0</p>
</div>
<div class="bg-white p-4 border-l-4 border-outline shadow-sm">
<p class="font-label-technical text-label-technical text-on-surface-variant uppercase mb-1">System Load</p>
<div class="flex items-center gap-2 h-8">
<div class="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
<div class="bg-brand-red h-full w-[42%]"></div>
</div>
<span class="font-label-technical text-label-technical">42%</span>
</div>
</div>
</div>
<!-- Partners Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<!-- DHL Card -->
<div class="bento-card bg-white border border-outline-variant p-5 flex flex-col">
<div class="flex items-start justify-between mb-6">
<div class="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-lg">
<span class="material-symbols-outlined text-primary text-3xl">local_shipping</span>
</div>
<span class="bg-brand-red text-white font-label-technical text-[10px] px-2 py-1 rounded uppercase font-bold">Active</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-primary mb-1">DHL Express</h3>
<p class="font-label-technical text-label-technical text-on-surface-variant mb-4">International Logistics</p>
<div class="space-y-3 mb-6 flex-1">
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">Last Sync</span>
<span class="text-primary font-medium">14:02:45 Today</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">API Key</span>
<span class="text-primary font-medium">•••• •••• 4A21</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">End Point</span>
<span class="text-primary font-medium">Global/EU-1</span>
</div>
</div>
<div class="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant">
<button class="bg-white border border-brand-red text-brand-red font-label-technical text-label-technical py-2 hover:bg-brand-red/5 transition-all">SYNC NOW</button>
<button class="bg-brand-red text-white font-label-technical text-label-technical py-2 hover:brightness-110 transition-all shadow-sm">CONFIGURE</button>
</div>
</div>
<!-- FedEx Card -->
<div class="bento-card bg-white border border-outline-variant p-5 flex flex-col">
<div class="flex items-start justify-between mb-6">
<div class="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
<span class="material-symbols-outlined text-primary text-3xl">flight</span>
</div>
<span class="bg-brand-red text-white font-label-technical text-[10px] px-2 py-1 rounded uppercase font-bold">Active</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-primary mb-1">FedEx Corp</h3>
<p class="font-label-technical text-label-technical text-on-surface-variant mb-4">North America Hub</p>
<div class="space-y-3 mb-6 flex-1">
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">Last Sync</span>
<span class="text-primary font-medium">13:45:12 Today</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">API Key</span>
<span class="text-primary font-medium">•••• •••• FE2X</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">End Point</span>
<span class="text-primary font-medium">US-West/Primary</span>
</div>
</div>
<div class="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant">
<button class="bg-white border border-brand-red text-brand-red font-label-technical text-label-technical py-2 hover:bg-brand-red/5 transition-all">SYNC NOW</button>
<button class="bg-brand-red text-white font-label-technical text-label-technical py-2 hover:brightness-110 transition-all shadow-sm">CONFIGURE</button>
</div>
</div>
<!-- Viettel Post Card -->
<div class="bento-card bg-white border border-outline-variant p-5 flex flex-col">
<div class="flex items-start justify-between mb-6">
<div class="w-12 h-12 flex items-center justify-center bg-red-100 rounded-lg">
<span class="material-symbols-outlined text-primary text-3xl">package_2</span>
</div>
<span class="bg-surface-container-highest text-on-surface-variant font-label-technical text-[10px] px-2 py-1 rounded uppercase font-bold">Maintenance</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-primary mb-1">Viettel Post</h3>
<p class="font-label-technical text-label-technical text-on-surface-variant mb-4">SEA Regional Partner</p>
<div class="space-y-3 mb-6 flex-1">
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">Last Sync</span>
<span class="text-primary font-medium">04:00:00 Today</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">API Key</span>
<span class="text-primary font-medium">•••• •••• VT99</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">End Point</span>
<span class="text-primary font-medium">VN-Hanoi/Main</span>
</div>
</div>
<div class="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant">
<button class="bg-white border border-outline text-outline font-label-technical text-label-technical py-2 opacity-50 cursor-not-allowed">SYNC NOW</button>
<button class="bg-brand-red text-white font-label-technical text-label-technical py-2 hover:brightness-110 transition-all shadow-sm">CONFIGURE</button>
</div>
</div>
<!-- GHTK Card -->
<div class="bento-card bg-white border border-outline-variant p-5 flex flex-col">
<div class="flex items-start justify-between mb-6">
<div class="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg">
<span class="material-symbols-outlined text-primary text-3xl">electric_moped</span>
</div>
<span class="bg-error text-white font-label-technical text-[10px] px-2 py-1 rounded uppercase font-bold">Disconnected</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-primary mb-1">GHTK</h3>
<p class="font-label-technical text-label-technical text-on-surface-variant mb-4">Last-Mile Carrier</p>
<div class="space-y-3 mb-6 flex-1">
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">Last Sync</span>
<span class="text-error font-bold italic">Connection Failed</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">API Key</span>
<span class="text-primary font-medium">•••• •••• TK01</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">End Point</span>
<span class="text-primary font-medium">VN-HCM/Gateway</span>
</div>
</div>
<div class="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant">
<button class="bg-white border border-brand-red text-brand-red font-label-technical text-label-technical py-2 hover:bg-brand-red/5 transition-all">RETRY SYNC</button>
<button class="bg-brand-red text-white font-label-technical text-label-technical py-2 hover:brightness-110 transition-all shadow-sm">RECONNECT</button>
</div>
</div>
<!-- J&T Express Card -->
<div class="bento-card bg-white border border-outline-variant p-5 flex flex-col">
<div class="flex items-start justify-between mb-6">
<div class="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg">
<span class="material-symbols-outlined text-primary text-3xl">inventory</span>
</div>
<span class="bg-brand-red text-white font-label-technical text-[10px] px-2 py-1 rounded uppercase font-bold">Active</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-primary mb-1">J&amp;T Express</h3>
<p class="font-label-technical text-label-technical text-on-surface-variant mb-4">Multi-Market Logistics</p>
<div class="space-y-3 mb-6 flex-1">
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">Last Sync</span>
<span class="text-primary font-medium">09:12:33 Today</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">API Key</span>
<span class="text-primary font-medium">•••• •••• JT44</span>
</div>
<div class="flex justify-between items-center text-label-technical">
<span class="text-on-surface-variant">End Point</span>
<span class="text-primary font-medium">Global/API-v2</span>
</div>
</div>
<div class="grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant">
<button class="bg-white border border-brand-red text-brand-red font-label-technical text-label-technical py-2 hover:bg-brand-red/5 transition-all">SYNC NOW</button>
<button class="bg-brand-red text-white font-label-technical text-label-technical py-2 hover:brightness-110 transition-all shadow-sm">CONFIGURE</button>
</div>
</div>
<!-- Placeholder / Add More Card -->
<div class="border-2 border-dashed border-outline-variant p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-all">
<span class="material-symbols-outlined text-4xl text-outline-variant mb-4">add_circle</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface-variant mb-1">Add Integration</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Expand your logistics network with new 3PL partners.</p>
</div>
</div>
</section>
<!-- System Logs / Activity Overlay (Bottom section) -->
<section class="mt-auto p-8 border-t border-outline-variant bg-white">
<div class="flex items-center justify-between mb-4">
<h2 class="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
<span class="material-symbols-outlined">receipt_long</span>
                    Recent Integration Activity
                </h2>
<button class="text-brand-red font-label-technical text-label-technical hover:underline uppercase tracking-wider">View Full System Log</button>
</div>
<div class="overflow-hidden border border-outline-variant">
<table class="w-full text-left font-body-md">
<thead class="bg-surface-container-high border-b border-outline-variant">
<tr>
<th class="px-6 py-3 font-label-technical text-label-technical text-on-surface-variant uppercase">Timestamp</th>
<th class="px-6 py-3 font-label-technical text-label-technical text-on-surface-variant uppercase">Partner</th>
<th class="px-6 py-3 font-label-technical text-label-technical text-on-surface-variant uppercase">Event Type</th>
<th class="px-6 py-3 font-label-technical text-label-technical text-on-surface-variant uppercase">Status</th>
<th class="px-6 py-3 font-label-technical text-label-technical text-on-surface-variant uppercase text-right">Duration</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-3 font-label-technical text-label-technical">2023-10-27 14:02:45</td>
<td class="px-6 py-3 font-bold text-primary">DHL Express</td>
<td class="px-6 py-3">Periodic Manifest Sync</td>
<td class="px-6 py-3">
<span class="flex items-center gap-1.5 text-green-700">
<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">check_circle</span>
                                    Success
                                </span>
</td>
<td class="px-6 py-3 text-right">1.2s</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-3 font-label-technical text-label-technical">2023-10-27 13:58:20</td>
<td class="px-6 py-3 font-bold text-primary">GHTK</td>
<td class="px-6 py-3">Webhook Authentication</td>
<td class="px-6 py-3">
<span class="flex items-center gap-1.5 text-error font-bold">
<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">error</span>
                                    Failed (401)
                                </span>
</td>
<td class="px-6 py-3 text-right">0.4s</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-3 font-label-technical text-label-technical">2023-10-27 13:45:12</td>
<td class="px-6 py-3 font-bold text-primary">FedEx Corp</td>
<td class="px-6 py-3">Rate Table Update</td>
<td class="px-6 py-3">
<span class="flex items-center gap-1.5 text-green-700">
<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">check_circle</span>
                                    Success
                                </span>
</td>
<td class="px-6 py-3 text-right">4.8s</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
<!-- Contextual FAB for quick adding partner -->
<button class="fixed bottom-8 right-8 w-14 h-14 bg-brand-red text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
<span class="material-symbols-outlined text-3xl">add</span>
</button>
<script>
        // Micro-interactions and animations
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.bento-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 * index);
            });

            // Button active state simulation
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mousedown', () => {
                    btn.classList.add('opacity-80');
                });
                btn.addEventListener('mouseup', () => {
                    btn.classList.remove('opacity-80');
                });
            });
        });
    </script>
</body></html>