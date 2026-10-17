import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-headphones-01',
    name: 'AeroPulse Wireless Headphones',
    tagline: 'Active Noise Cancelling with 40h Battery Life',
    description: 'Immerse yourself in studio-grade audio fidelity with AeroPulse. Featuring 40mm beryllium drivers, hybrid active noise cancellation, low-latency Bluetooth 5.3, and ultra-plush memory foam earcups for all-day comfort.',
    category: 'Electronics',
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviewsCount: 342,
    stock: 25,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    features: [
      'Hybrid Active Noise Cancellation (up to -38dB)',
      '40-hour total playback with quick USB-C charging',
      'Dual multi-point Bluetooth 5.3 pairing',
      'Built-in ENC quad-microphones for crystal clear calls'
    ],
    specs: {
      'Driver Size': '40mm Dynamic',
      'Battery Life': '40 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3, 3.5mm AUX',
      'Weight': '248g'
    }
  },
  {
    id: 'prod-smartwatch-02',
    name: 'NovaSync AMOLED Smart Watch',
    tagline: 'Precision Health Sensors & 1.95" Ultra Display',
    description: 'Stay ahead of your metrics with NovaSync. Boasting an always-on AMOLED curved display with 1000 nits peak brightness, continuous SpO2 and heart rate tracking, titanium bezel, and water resistance up to 50 meters.',
    category: 'Electronics',
    price: 3999,
    originalPrice: 5499,
    rating: 4.9,
    reviewsCount: 512,
    stock: 18,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    features: [
      '1.95" Always-On HD AMOLED display with sapphire crystal glass',
      'Continuous 24/7 Heart Rate, SpO2, and Sleep Phase monitoring',
      'Over 110 sports modes with auto-detection',
      'IP68 & 5ATM waterproof resistance'
    ],
    specs: {
      'Display': '1.95 inch AMOLED (410x502)',
      'Battery Life': 'Up to 12 Days',
      'Water Resistance': '5 ATM / 50m',
      'Compatibility': 'iOS & Android'
    }
  },
  {
    id: 'prod-keyboard-03',
    name: 'Vortex RGB Mechanical Keyboard',
    tagline: 'Hot-Swappable Gateron Pro Switches & CNC Aluminum',
    description: 'Engineered for coders and gamers who demand tactile perfection. Includes pre-lubed mechanical switches, south-facing per-key RGB backlighting, gasket mount structure with sound-dampening foam, and full Mac/Windows switchability.',
    category: 'Accessories',
    price: 4499,
    originalPrice: 5999,
    rating: 4.7,
    reviewsCount: 189,
    stock: 12,
    badge: 'Editor\'s Choice',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    features: [
      'Hot-swappable 5-pin PCB supports Cherry, Gateron, Kailh',
      'PBT double-shot shine-through keycaps',
      'Multi-layer Poron gasket acoustic dampening',
      'Tri-mode connectivity: 2.4GHz wireless, Bluetooth 5.1, USB-C'
    ],
    specs: {
      'Layout': '75% Compact (84 keys)',
      'Switch Type': 'Gateron Pro Yellow (Linear)',
      'Plate Material': 'Polycarbonate',
      'Weight': '920g'
    }
  },
  {
    id: 'prod-mouse-04',
    name: 'SwiftGlide Wireless Gaming Mouse',
    tagline: 'Ultralight 58g Chassis & 26K DPI Optical Sensor',
    description: 'Experience effortless glide and pinpoint accuracy. SwiftGlide combines a symmetrical lightweight shell with zero smoothing or acceleration, optical micro-switches rated for 90M clicks, and up to 80 hours of high-performance gaming.',
    category: 'Accessories',
    price: 1299,
    originalPrice: 1999,
    rating: 4.6,
    reviewsCount: 220,
    stock: 35,
    badge: 'Top Value',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    features: [
      '58-gram featherweight honeycomb-free design',
      'PAW3395 Optical Sensor with 26,000 DPI and 650 IPS tracking',
      '100% pure virgin-grade PTFE glide skates',
      'Lag-free 1000Hz polling rate wireless receiver'
    ],
    specs: {
      'DPI Range': '100 - 26,000 DPI',
      'Battery Life': '80 Hours (1000Hz)',
      'Switch Life': '90 Million Clicks',
      'Weight': '58g'
    }
  },
  {
    id: 'prod-hub-05',
    name: 'HyperConnect 8-in-1 USB-C Hub',
    tagline: '4K@60Hz HDMI, 100W Power Delivery & Gigabit LAN',
    description: 'Transform a single USB-C port into a complete command center. Features dual USB 3.2 Gen 2 ports, SD/MicroSD UHS-I card readers, 4K@60Hz HDMI output, Gigabit Ethernet, and 100W PD pass-through in an aerospace aluminum body.',
    category: 'Accessories',
    price: 1799,
    originalPrice: 2499,
    rating: 4.5,
    reviewsCount: 164,
    stock: 0, // BUG-03: Out-of-Stock product that can be purchased!
    badge: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    features: [
      'HDMI 2.0 supporting 4K UHD resolution at fluid 60Hz',
      '100W USB-C Power Delivery 3.0 pass-through charging',
      'Gigabit RJ45 Ethernet port (10/100/1000 Mbps)',
      'High-speed 104MB/s dual card reader slots'
    ],
    specs: {
      'Input': 'USB-C 3.2 Gen 2',
      'Video Output': 'HDMI 4K @ 60Hz',
      'Power Input': '100W PD 3.0',
      'Material': 'Space Gray Anodized Aluminum'
    }
  },
  {
    id: 'prod-speaker-06',
    name: 'SoundWave 360 Portable Speaker',
    tagline: 'Spatial Audio, IPX7 Waterproofing & Party Sync',
    description: 'Fill any room or outdoor gathering with crisp 360-degree acoustics and punchy dual passive bass radiators. Rugged IPX7 waterproof rating ensures protection against rain, splashes, and accidental drops.',
    category: 'Electronics',
    price: 2199,
    originalPrice: 2999,
    rating: 4.6,
    reviewsCount: 298,
    stock: 20,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
    features: [
      'Dual 15W full-range drivers with downward passive radiator',
      'IPX7 submersible waterproof and dustproof exterior',
      'TWS pairing to link two speakers for true stereo sound',
      'Built-in microphone for speakerphone functionality'
    ],
    specs: {
      'Output Power': '30W Peak RMS',
      'Battery Capacity': '5200 mAh (16h playback)',
      'Range': 'Up to 20 meters (Bluetooth 5.3)',
      'Waterproof': 'IPX7 Certified'
    }
  },
  {
    id: 'prod-stand-07',
    name: 'ErgoLift Aluminum Laptop Stand',
    tagline: 'Adjustable Dual-Pivot Ergonomics & Heat Dissipation',
    description: 'Elevate your workspace posture and keep your laptop running cool. Precision-machined from sandblasted aluminum alloy with reinforced dual-axis steel hinges capable of holding laptops up to 17 inches firmly at any angle.',
    category: 'Accessories',
    price: 1499,
    originalPrice: 1999,
    rating: 4.8,
    reviewsCount: 410,
    stock: 30,
    badge: 'Ergonomic',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    features: [
      'Dual-axis stepless height and tilt adjustment up to 30cm',
      'Open cutout ventilation prevents thermal throttling',
      'Non-slip silicone pads prevent scratches and slipping',
      'Folds flat for effortless travel and laptop bag storage'
    ],
    specs: {
      'Material': 'Aerospace Grade 6063 Aluminum',
      'Compatibility': '10" to 17.3" Laptops & Tablets',
      'Max Weight Load': '6.0 kg',
      'Folded Height': '4.2 cm'
    }
  },
  {
    id: 'prod-powerbank-08',
    name: 'VoltCore 20000mAh Power Bank',
    tagline: '65W Fast Charge Laptop & Smartphone Companion',
    description: 'High-density lithium polymer battery bank equipped with 65W Power Delivery to charge your MacBook Pro, Dell XPS, iPhone, and Android devices simultaneously at maximum speed. Digital LED display shows remaining percentage.',
    category: 'Lifestyle',
    price: 1899,
    originalPrice: 2799,
    rating: 4.7,
    reviewsCount: 375,
    stock: 22,
    badge: 'Fast Charge',
    image: 'https://images.unsplash.com/photo-1609592426867-eb95a452fc38?w=800&auto=format&fit=crop&q=80',
    features: [
      '65W USB-C PD output charges laptops from 0 to 50% in 35m',
      '20,000mAh capacity provides 4+ full smartphone charges',
      'Triple-port simultaneous output (2x USB-C, 1x USB-A)',
      'Comprehensive 10-point temperature & surge protection'
    ],
    specs: {
      'Capacity': '20,000 mAh (74Wh)',
      'Max Output': '65W USB-C PD',
      'Recharge Time': '2.1 Hours (with 65W wall charger)',
      'Weight': '380g'
    }
  },
  {
    id: 'prod-lightbar-09',
    name: 'AuraBeam Monitor Ambient Light Bar',
    tagline: 'Asymmetric Optical Design with Touch & Wireless Dial',
    description: 'Eliminate screen glare and reduce eye strain with forward-directed asymmetric illumination. Features step-less color temperature tuning (2700K to 6500K) and ambient RGB rear backlighting for deep immersion.',
    category: 'Lifestyle',
    price: 2999,
    originalPrice: 3999,
    rating: 4.9,
    reviewsCount: 142,
    stock: 15,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    features: [
      'Patented asymmetric 45° angle prevents screen reflections',
      'Rear RGB backlight with sync and soothing ambient modes',
      '2.4GHz wireless desktop rotary dial for brightness & hue',
      'Fits curved and flat monitors from 0.5cm to 4.5cm thickness'
    ],
    specs: {
      'Color Temp': '2700K - 6500K Stepless',
      'Color Rendering': 'Ra > 95 High Fidelity',
      'Power Interface': 'USB-C 5V/2A',
      'Length': '46 cm'
    }
  },
  {
    id: 'prod-case-10',
    name: 'TitanMesh MagSafe Minimalist Case',
    tagline: 'Aramid Carbon Fiber Shell with N52 Strong Magnets',
    description: 'Crafted from aerospace-grade 1500D aramid fiber, offering five times the strength of steel at the same weight. Precision cutouts, military-grade drop resistance, and ultra-strong MagSafe alignment.',
    category: 'Lifestyle',
    price: 999,
    originalPrice: 1499,
    rating: 4.4,
    reviewsCount: 96,
    stock: 45,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
    features: [
      '100% Genuine 1500D Aramid Fiber with tactile grip texture',
      'Integrated N52 neodymium magnetic ring with 1.5kg holding force',
      'Raised 1.2mm camera bezel and screen lip protection',
      'Ultra-thin 0.95mm profile with zero bulk'
    ],
    specs: {
      'Material': '1500D Ballistic Aramid Fiber',
      'Thickness': '0.95 mm',
      'Weight': '16.5g',
      'MagSafe': 'Fully Certified Compatible'
    }
  }
];
