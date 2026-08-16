import { CommodityRate, MaterialCategory, HardwareMerchant, Product } from '../types/buyer';

export const COMMODITY_RATES: CommodityRate[] = [
  { id: '1', materialName: 'UltraTech Cement 53G', unit: '50kg Bag', wholesaleRate: 385, prevRate: 395, trend: 'down', changePercent: 2.5, lastUpdated: '10m ago' },
  { id: '2', materialName: 'TMT Steel Rods (Fe550D)', unit: 'Ton', wholesaleRate: 58500, prevRate: 57200, trend: 'up', changePercent: 2.2, lastUpdated: '5m ago' },
  { id: '3', materialName: 'Supreme PVC Pipe 110mm', unit: '6m Length', wholesaleRate: 1240, prevRate: 1240, trend: 'stable', changePercent: 0, lastUpdated: '15m ago' },
  { id: '4', materialName: 'Asian Paints Apex Exterior', unit: '20L Bucket', wholesaleRate: 4650, prevRate: 4800, trend: 'down', changePercent: 3.1, lastUpdated: '30m ago' },
  { id: '5', materialName: 'Finolex Copper Wire 2.5sqmm', unit: '90m Coil', wholesaleRate: 2150, prevRate: 2100, trend: 'up', changePercent: 2.3, lastUpdated: '1h ago' },
];

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  { 
    id: 'cement', 
    title: 'Cement & Aggregates', 
    subtitle: '53 Grade, PPC, M-Sand, Blue Metal', 
    iconName: 'FaBoxesStacked', 
    colorBg: 'bg-[#FF6500]', 
    itemCount: 140, 
    trendingBadge: 'Best Rates', 
    image: '/images/cement_aggregates.png',
    subcategories: ['53 Grade OPC Cement', 'PPC Water Shield Cement', 'Plastering M-Sand', 'P-Sand & Aggregates', 'White Cement & Tile Adhesive'],
    featuredBrands: ['UltraTech', 'ACC Cement', 'Dalmia', 'Ramco', 'Chettinad']
  },
  { 
    id: 'steel', 
    title: 'TMT Steel Rods', 
    subtitle: 'Fe500D, Fe550D, Binding Wire', 
    iconName: 'FaLayerGroup', 
    colorBg: 'bg-[#FF6500]', 
    itemCount: 95, 
    trendingBadge: 'High Demand', 
    image: '/images/tmt_steel_rods.png',
    subcategories: ['Fe550D TMT Rods (8mm-32mm)', 'Fe500D Seismic Grade Rods', 'Gi Binding Wire (18 Gauge)', 'MS Structural Angle & Channels', 'Stirrups & Prefab Ring Sets'],
    featuredBrands: ['Tata Tiscon', 'JSW Neosteel', 'Vizag Steel', 'Kairali Steel', 'Indus TMT']
  },
  { 
    id: 'pvc', 
    title: 'PVC & Plumbing', 
    subtitle: 'CPVC, UPVC, Fittings & Valves', 
    iconName: 'MdOutlineWaterDrop', 
    colorBg: 'bg-[#FF6500]', 
    itemCount: 320, 
    image: '/images/pvc_plumbing_pipes.png',
    subcategories: ['CPVC Hot & Cold Water Pipes', 'SWR Drainage Pipes (110mm)', 'UPVC Pressure Pipes', 'Brass Threaded Elbows & Tees', 'Overhead Water Storage Tanks'],
    featuredBrands: ['Supreme', 'Astral', 'Finolex', 'Ashirvad', 'Prince Pipes']
  },
  { 
    id: 'paints', 
    title: 'Paints & Wall Putty', 
    subtitle: 'Emulsion, Primer, Enamel, Waterproof', 
    iconName: 'FaPaintRoller', 
    colorBg: 'bg-[#FF6500]', 
    itemCount: 210, 
    trendingBadge: 'Monsoon Deal', 
    image: '/images/paints_wall_putty.png',
    subcategories: ['Exterior Weatherproof Emulsion', 'Interior Premium Silk Emulsion', 'Acrylic Wall Putty (40kg)', 'Waterproofing Chemical Coatings', 'Enamel Wood & Metal Paints'],
    featuredBrands: ['Asian Paints', 'Berger Paints', 'Nippon', 'Dulux', 'Birla White']
  },
  { 
    id: 'electricals', 
    title: 'Electrical Wires & Switches', 
    subtitle: 'Flame Retardant, MCB, DB Boxes', 
    iconName: 'MdOutlineElectricalServices', 
    colorBg: 'bg-[#FF6500]', 
    itemCount: 410, 
    image: '/images/electrical_wires_switches.png',
    subcategories: ['FR Multi-Strand Wires (1.5-6sqmm)', 'Modular Switch Plates & Sockets', 'Triple Pole MCB & ELCB Units', 'PVC Conduit Pipes & Junctions', 'LED Concealed Spotlights & Panels'],
    featuredBrands: ['Finolex', 'Havells', 'Legrand', 'Polycab', 'Schneider Electric']
  },
  { 
    id: 'tools', 
    title: 'Power Tools & Hardware', 
    subtitle: 'Drills, Cutters, Fasteners, Safety', 
    iconName: 'FaScrewdriverWrench', 
    colorBg: 'bg-[#FF6500]', 
    itemCount: 180, 
    image: '/images/hardware_power_tools.png',
    subcategories: ['Impact Drill & Rotary Hammer Kits', '4-Inch Angle Grinders & Cutters', 'Stainless Steel Door Hinges & Locks', 'Concrete Anchor Bolts & Screws', 'Safety Helmets & Harness Sets'],
    featuredBrands: ['Bosch', 'DeWalt', 'Stanley', 'Makita', 'Godrej']
  },
];

export const HARDWARE_MERCHANTS: HardwareMerchant[] = [
  {
    id: 'm1',
    name: 'Kakkanad Building Supplies Co.',
    ownerName: 'Rajesh Kumar',
    verified: true,
    rating: 4.9,
    reviewsCount: 342,
    distanceKm: 4.2,
    deliveryEtaMinutes: 45,
    minOrderValue: 2500,
    brands: ['UltraTech', 'Tata Tiscon', 'Supreme', 'Asian Paints'],
    mainCategory: 'cement, steel, pvc',
    address: 'Kakkanad Industrial Zone, Metro Pillar #412',
    isOnline: true,
    avatarUrl: ''
  },
  {
    id: 'm2',
    name: 'Metropolitan Hardware & Steel Hub',
    ownerName: 'George Joseph',
    verified: true,
    rating: 4.8,
    reviewsCount: 219,
    distanceKm: 8.5,
    deliveryEtaMinutes: 60,
    minOrderValue: 5000,
    brands: ['JSW Steel', 'ACC Cement', 'Finolex', 'Havells'],
    mainCategory: 'steel, electricals, cement',
    address: 'Aluva Highway Junction, Ernakulam',
    isOnline: true,
    avatarUrl: ''
  },
  {
    id: 'm3',
    name: 'Prime Structural Materials Pvt Ltd',
    ownerName: 'Abdul Salam',
    verified: true,
    rating: 4.7,
    reviewsCount: 185,
    distanceKm: 14.8,
    deliveryEtaMinutes: 90,
    minOrderValue: 10000,
    brands: ['Dalmia Cement', 'Vizag Steel', 'Berger Paints', 'Astral'],
    mainCategory: 'cement, paints, pvc',
    address: 'Vytila Mobility Hub Ring Road',
    isOnline: true,
    avatarUrl: ''
  },
  {
    id: 'm4',
    name: 'Express Tools & Plumbing Mart',
    ownerName: 'Venkatesh Iyer',
    verified: true,
    rating: 4.9,
    reviewsCount: 410,
    distanceKm: 19.5,
    deliveryEtaMinutes: 120,
    minOrderValue: 1500,
    brands: ['Bosch', 'Stanley', 'Supreme', 'Legrand'],
    mainCategory: 'tools, pvc, electricals',
    address: 'Palarivattom Bypass Junction',
    isOnline: true,
    avatarUrl: ''
  }
];

export const CATALOG_PRODUCTS: Product[] = [
  // CEMENT & AGGREGATES
  {
    id: 'p1',
    title: 'UltraTech Cement 53 Grade',
    category: 'cement',
    brand: 'UltraTech',
    price: 385,
    unit: '50kg Bag',
    moq: 50,
    weightSpec: '50 kg Bag',
    grade: '53 Grade',
    weightKg: 50,
    image: '/images/cement_aggregates.png'
  },
  {
    id: 'p2',
    title: 'ACC Gold Water Shield PPC',
    category: 'cement',
    brand: 'ACC Cement',
    price: 365,
    unit: '50kg Bag',
    moq: 100,
    weightSpec: '50 kg Bag',
    grade: 'PPC (Premium)',
    weightKg: 50,
    image: '/images/cement_aggregates.png'
  },
  {
    id: 'p3',
    title: 'M-Sand (Plastering Quality)',
    category: 'cement',
    brand: 'Local Quarry',
    price: 3200,
    unit: 'Ton',
    moq: 3,
    weightSpec: '1 Ton Load',
    grade: 'Plastering M-Sand',
    weightKg: 1000,
    image: '/images/cement_aggregates.png'
  },

  // STEEL RODS
  {
    id: 'p4',
    title: 'Tata Tiscon TMT Steel Rods 12mm',
    category: 'steel',
    brand: 'Tata Tiscon',
    price: 58500,
    unit: 'Ton',
    moq: 1,
    weightSpec: 'Fe550D High Ductility',
    grade: 'Fe550D',
    gauge: '12mm',
    weightKg: 1000,
    image: '/images/tmt_steel_rods.png'
  },
  {
    id: 'p5',
    title: 'Tata Tiscon TMT Steel Rods 8mm',
    category: 'steel',
    brand: 'Tata Tiscon',
    price: 59500,
    unit: 'Ton',
    moq: 1,
    weightSpec: 'Fe550D Grade',
    grade: 'Fe550D',
    gauge: '8mm',
    weightKg: 1000,
    image: '/images/tmt_steel_rods.png'
  },
  {
    id: 'p6',
    title: 'JSW Neosteel TMT Rods 16mm',
    category: 'steel',
    brand: 'JSW Steel',
    price: 57200,
    unit: 'Ton',
    moq: 2,
    weightSpec: 'Fe500D Premium quality',
    grade: 'Fe500D',
    gauge: '16mm',
    weightKg: 1000,
    image: '/images/tmt_steel_rods.png'
  },

  // PVC & PLUMBING
  {
    id: 'p7',
    title: 'Supreme PVC Pipe 110mm 4kg/cm²',
    category: 'pvc',
    brand: 'Supreme',
    price: 1240,
    unit: '6m Length',
    moq: 10,
    weightSpec: '110mm Outer Dia',
    grade: 'Class 2 (4kg)',
    gauge: '110mm',
    weightKg: 4.5,
    image: '/images/pvc_plumbing_pipes.png'
  },
  {
    id: 'p8',
    title: 'Astral CPVC Pro Pipe 1 Inch',
    category: 'pvc',
    brand: 'Astral',
    price: 850,
    unit: '3m Length',
    moq: 15,
    weightSpec: 'SDR 11 Standard',
    grade: 'CPVC SDR 11',
    gauge: '1 Inch',
    weightKg: 1.2,
    image: '/images/pvc_plumbing_pipes.png'
  },

  // PAINTS
  {
    id: 'p9',
    title: 'Asian Paints Apex Ultima White',
    category: 'paints',
    brand: 'Asian Paints',
    price: 4650,
    unit: '20L Bucket',
    moq: 2,
    weightSpec: 'Premium Exterior Emulsion',
    grade: 'Apex Exterior',
    weightKg: 20,
    image: '/images/paints_wall_putty.png'
  },
  {
    id: 'p10',
    title: 'Berger WeatherCoat Anti-Dust',
    category: 'paints',
    brand: 'Berger Paints',
    price: 4320,
    unit: '20L Bucket',
    moq: 2,
    weightSpec: 'Dust Guard Exterior paint',
    grade: 'WeatherCoat Shield',
    weightKg: 20,
    image: '/images/paints_wall_putty.png'
  },

  // ELECTRICALS
  {
    id: 'p11',
    title: 'Finolex Flame Retardant 2.5sqmm',
    category: 'electricals',
    brand: 'Finolex',
    price: 2150,
    unit: '90m Coil',
    moq: 5,
    weightSpec: 'FR Multi-strand Copper',
    grade: 'Flame Retardant',
    gauge: '2.5 sqmm',
    weightKg: 3.2,
    image: '/images/electrical_wires_switches.png'
  },
  {
    id: 'p12',
    title: 'Havells 3-Pole 32A MCB C-Curve',
    category: 'electricals',
    brand: 'Havells',
    price: 1350,
    unit: 'Piece',
    moq: 10,
    weightSpec: '10kA breaking capacity',
    grade: '32A Triple Pole',
    weightKg: 0.4,
    image: '/images/electrical_wires_switches.png'
  },

  // TOOLS & HARDWARE
  {
    id: 'p13',
    title: 'Bosch GSB 13 RE Impact Drill',
    category: 'tools',
    brand: 'Bosch',
    price: 3650,
    unit: 'Kit',
    moq: 1,
    weightSpec: '600W Smart kit',
    grade: 'Professional',
    weightKg: 2.8,
    image: '/images/hardware_power_tools.png'
  }
];

