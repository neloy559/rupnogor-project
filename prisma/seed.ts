import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// ─── Available product images ───
const IMG = {
  sareeRose: '/products/product-saree-rose.png',
  sareeMuslin: '/products/product-saree-muslin.png',
  chiffonSaree: '/products/product-chiffon-saree.png',
  anarkaliSilk: '/products/product-anarkali-silk.png',
  kurtaIvory: '/products/product-kurta-ivory.png',
  kurtaGold: '/products/product-kurta-gold.png',
  pearlChoker: '/products/product-pearl-choker.png',
  leatherBag: '/products/product-leather-bag.png',
  jhumkaSet: '/products/product-jhumka-set.png',
  detailMain: '/products/product-detail-main.png',
};

function calcComparePrice(price: number, minPercent = 20, maxPercent = 40): number {
  const pct = minPercent + Math.random() * (maxPercent - minPercent);
  return Math.round(price * (1 + pct / 100));
}

/** No-op for MongoDB — arrays are stored natively.
 *  Typed so that the spread into Prisma create() includes required fields. */
function prep(p: {
  name: string;
  description: string;
  price: number;
  sku: string;
  images: string[];
  colors: string[];
  colorNames: string[];
  sizes: string[];
  stock: number;
  badge: string | null;
  rating: number;
  reviewCount: number;
}) {
  return p;
}

async function seed() {
  console.log('🌱 Seeding RupNogor database...\n');

  // ═══════════════════════════════════════════════════════
  // 1. CLEAR EXISTING DATA
  // ═══════════════════════════════════════════════════════
  console.log('🗑️  Clearing existing data...');
  await db.review.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.product.deleteMany();
  await db.banner.deleteMany();
  await db.address.deleteMany();
  await db.newsletter.deleteMany();
  await db.user.deleteMany();
  await db.category.deleteMany();
  console.log('✅ Existing data cleared\n');

  // ═══════════════════════════════════════════════════════
  // 2. CREATE USERS
  // ═══════════════════════════════════════════════════════
  console.log('👤 Creating users...');

  const adminPassword = await bcrypt.hash('Admin@2024', 12);
  const admin = await db.user.create({
    data: {
      email: 'admin@rupnogor.com',
      password: adminPassword,
      name: 'RupNogor Admin',
      role: 'admin' as const,
    },
  });
  console.log('   ✅ Admin: admin@rupnogor.com');

  const customerPassword = await bcrypt.hash('Customer@2024', 12);
  const customer = await db.user.create({
    data: {
      email: 'customer@rupnogor.com',
      password: customerPassword,
      name: 'Test Customer',
      phone: '+8801712345678',
      role: 'customer' as const,
    },
  });
  console.log('   ✅ Customer: customer@rupnogor.com\n');

  // ═══════════════════════════════════════════════════════
  // 3. CREATE CATEGORIES
  // ═══════════════════════════════════════════════════════
  console.log('📁 Creating categories...');

  const catSarees = await db.category.create({
    data: { name: 'Sarees', icon: 'ShoppingBasket', color: 'bg-pink-100 text-pink-700', sortOrder: 0 },
  });
  const catJewelry = await db.category.create({
    data: { name: 'Jewelry', icon: 'Gem', color: 'bg-amber-100 text-amber-700', sortOrder: 1 },
  });
  const catFusion = await db.category.create({
    data: { name: 'Fusion Wear', icon: 'Store', color: 'bg-purple-100 text-purple-700', sortOrder: 2 },
  });
  const catBags = await db.category.create({
    data: { name: 'Bags', icon: 'Briefcase', color: 'bg-orange-100 text-orange-700', sortOrder: 3 },
  });
  const catAccessories = await db.category.create({
    data: { name: 'Accessories', icon: 'Star', color: 'bg-rose-100 text-rose-700', sortOrder: 4 },
  });
  console.log('   ✅ 5 categories created\n');

  // ═══════════════════════════════════════════════════════
  // 4. CREATE BANNERS
  // ═══════════════════════════════════════════════════════
  console.log('🖼️  Creating banners...');

  await db.banner.create({
    data: {
      title: 'Elegance in Every Thread',
      link: '/shop?category=sarees',
      image: '/banner-slide-1.png',
      isActive: true,
      isPublic: true,
    },
  });
  await db.banner.create({
    data: {
      title: 'Bold & Beautiful',
      link: '/shop?category=jewelry',
      image: '/banner-slide-2.png',
      isActive: true,
      isPublic: true,
    },
  });
  await db.banner.create({
    data: {
      title: 'Celebrate in Style',
      link: '/shop?badge=sale',
      image: '/banner-slide-3.png',
      isActive: true,
      isPublic: true,
    },
  });
  await db.banner.create({
    data: {
      title: 'Golden Hour Glamour',
      link: '/shop',
      image: '/banner-slide-4.png',
      isActive: true,
      isPublic: true,
    },
  });
  console.log('   ✅ 4 banners created\n');

  // ═══════════════════════════════════════════════════════
  // 5. CREATE PRODUCTS (53 total: 50 active + 3 draft)
  // ═══════════════════════════════════════════════════════
  console.log('🛍️  Creating products...');

  let productCount = 0;

  // ───────────────────────────────────────────────────────
  // 5A. SAREES (15 products)
  // ───────────────────────────────────────────────────────
  const sarees = [
    {
      name: 'Rose-Tinted Muslin Saree',
      description: 'Exquisite handwoven muslin saree with delicate rose-tinted floral motifs. The sheer fabric drapes beautifully, making it perfect for wedding receptions and festive gatherings across Bangladesh.',
      price: 3500,
      sku: 'RN-SAR-001',
      images: [IMG.sareeRose],
      colors: ['#E5A9B4', '#D4A0A0', '#F5E6E0'],
      colorNames: ['Rose Pink', 'Dusty Mauve', 'Blush'],
      sizes: ['Free Size'],
      stock: 18,
      badge: 'Best Seller',
      rating: 4.7,
      reviewCount: 89,
    },
    {
      name: 'Dhakai Jamdani Saree — Traditional Motif',
      description: 'Authentic Dhakai Jamdani handwoven by master weavers of Narayanganj. Features traditional buti and tercha patterns on fine cotton, a true Bangladeshi heritage piece.',
      price: 5500,
      sku: 'RN-SAR-002',
      images: [IMG.sareeMuslin, IMG.sareeRose],
      colors: ['#F5F5DC', '#8B7355'],
      colorNames: ['Natural Cream', 'Tan Border'],
      sizes: ['Free Size'],
      stock: 12,
      badge: 'Best Seller',
      rating: 4.9,
      reviewCount: 142,
    },
    {
      name: 'Silk Chiffon Saree — Embroidered',
      description: 'Luxurious silk chiffon saree adorned with intricate machine embroidery along the border and pallu. Lightweight and elegant, ideal for summer evening events and parties.',
      price: 4200,
      sku: 'RN-SAR-003',
      images: [IMG.chiffonSaree, IMG.sareeRose],
      colors: ['#E5A9B4', '#4A90D9', '#2E8B57'],
      colorNames: ['Rose', 'Sky Blue', 'Emerald'],
      sizes: ['Free Size'],
      stock: 15,
      badge: 'New',
      rating: 4.4,
      reviewCount: 38,
    },
    {
      name: 'Tangail Tant Saree — Cotton',
      description: 'Lightweight cotton Tangail saree with traditional woven borders. Perfect for everyday wear and casual occasions, keeping you comfortable in the Bangladeshi heat.',
      price: 1800,
      sku: 'RN-SAR-004',
      images: [IMG.sareeMuslin],
      colors: ['#FFFFF0', '#FFD700', '#DC143C'],
      colorNames: ['Ivory', 'Golden Border', 'Red Border'],
      sizes: ['Free Size'],
      stock: 30,
      badge: null,
      rating: 4.3,
      reviewCount: 56,
    },
    {
      name: 'Banarasi Silk Saree — Bridal',
      description: 'Opulent Banarasi silk saree with rich zari work and elaborate brocade patterns. A show-stopping choice for brides and bridal attendants at Bangladeshi weddings.',
      price: 7500,
      sku: 'RN-SAR-005',
      images: [IMG.detailMain, IMG.sareeRose],
      colors: ['#800020', '#FFD700', '#228B22'],
      colorNames: ['Maroon', 'Gold', 'Green'],
      sizes: ['Free Size'],
      stock: 8,
      badge: 'New',
      rating: 4.8,
      reviewCount: 64,
    },
    {
      name: 'Katan Silk Saree — Zari Border',
      description: 'Pure Katan silk saree with heavy zari woven border and pallu. The lustrous fabric and traditional designs make it a prized addition to any saree collection.',
      price: 6800,
      sku: 'RN-SAR-006',
      images: [IMG.sareeMuslin, IMG.detailMain],
      colors: ['#800020', '#4B0082', '#006400'],
      colorNames: ['Burgundy', 'Royal Purple', 'Forest Green'],
      sizes: ['Free Size'],
      stock: 10,
      badge: null,
      rating: 4.6,
      reviewCount: 41,
    },
    {
      name: 'Organza Saree — Floral Embroidery',
      description: 'Delicate organza saree with hand-embroidered floral designs across the body. The translucent fabric creates an ethereal look perfect for mehendi ceremonies and daytime events.',
      price: 3200,
      sku: 'RN-SAR-007',
      images: [IMG.chiffonSaree],
      colors: ['#FFB6C1', '#98FB98', '#87CEEB'],
      colorNames: ['Soft Pink', 'Mint Green', 'Baby Blue'],
      sizes: ['Free Size'],
      stock: 22,
      badge: null,
      rating: 4.5,
      reviewCount: 33,
    },
    {
      name: 'Cotton Tant Saree — Bengal Weave',
      description: 'Classic Bengal Tant saree handwoven on traditional looms. Features a crisp cotton texture with contrasting woven border, ideal for daily office wear and Puja celebrations.',
      price: 1500,
      sku: 'RN-SAR-008',
      images: [IMG.sareeMuslin, IMG.sareeRose],
      colors: ['#FFFFFF', '#FF6347', '#4682B4'],
      colorNames: ['White', 'Tomato Red', 'Steel Blue'],
      sizes: ['Free Size'],
      stock: 40,
      badge: 'Sale',
      rating: 4.2,
      reviewCount: 78,
    },
    {
      name: 'Georgette Saree — Printed',
      description: 'Flowing georgette saree with all-over digital print inspired by Bengali nakshi kantha patterns. Modern prints on a traditional silhouette for the contemporary Bangladeshi woman.',
      price: 2800,
      sku: 'RN-SAR-009',
      images: [IMG.chiffonSaree, IMG.sareeMuslin],
      colors: ['#DDA0DD', '#20B2AA', '#F4A460'],
      colorNames: ['Plum', 'Teal', 'Sandy Brown'],
      sizes: ['Free Size'],
      stock: 25,
      badge: null,
      rating: 4.1,
      reviewCount: 22,
    },
    {
      name: 'Baluchari Saree — Mythological Scenes',
      description: 'Traditional Baluchari saree from Bishnupur depicting scenes from the Ramayana and Mahabharata in the pallu. A collector\'s piece showcasing the finest of Bengali weaving artistry.',
      price: 5200,
      sku: 'RN-SAR-010',
      images: [IMG.detailMain, IMG.sareeMuslin, IMG.sareeRose],
      colors: ['#8B0000', '#DAA520', '#556B2F'],
      colorNames: ['Dark Red', 'Goldenrod', 'Olive'],
      sizes: ['Free Size'],
      stock: 6,
      badge: null,
      rating: 4.8,
      reviewCount: 19,
    },
    {
      name: 'Muslin Saree — Golden Thread Border',
      description: 'Recreated Dhaka muslin with golden thread border work. This heritage fabric once graced the courts of Mughal emperors, now revived for the modern connoisseur of fine textiles.',
      price: 4500,
      sku: 'RN-SAR-011',
      images: [IMG.sareeMuslin, IMG.chiffonSaree],
      colors: ['#FAEBD7', '#FFD700', '#FFF8DC'],
      colorNames: ['Antique White', 'Gold Thread', 'Cornsilk'],
      sizes: ['Free Size'],
      stock: 14,
      badge: 'New',
      rating: 4.7,
      reviewCount: 27,
    },
    {
      name: 'Half-Silk Saree — Jamdani Pattern',
      description: 'Beautiful half-silk saree combining the comfort of cotton with the sheen of silk. Features Jamdani-inspired woven patterns, perfect for both formal and semi-formal occasions.',
      price: 3800,
      sku: 'RN-SAR-012',
      images: [IMG.sareeRose, IMG.sareeMuslin],
      colors: ['#E6E6FA', '#B8860B', '#C71585'],
      colorNames: ['Lavender', 'Dark Goldenrod', 'Medium Violet Red'],
      sizes: ['Free Size'],
      stock: 20,
      badge: null,
      rating: 4.4,
      reviewCount: 35,
    },
    {
      name: 'Hand-Painted Katan Silk',
      description: 'Exquisite Katan silk saree with hand-painted floral and paisley designs by Bangladeshi artists. Each piece is unique, combining traditional silk weaving with contemporary art.',
      price: 6200,
      sku: 'RN-SAR-013',
      images: [IMG.detailMain],
      colors: ['#FF1493', '#000080', '#FF4500'],
      colorNames: ['Deep Pink', 'Navy', 'Orange Red'],
      sizes: ['Free Size'],
      stock: 5,
      badge: 'New',
      rating: 4.9,
      reviewCount: 12,
    },
    {
      name: 'Bhagalpuri Silk Saree — Tussar',
      description: 'Natural Tussar silk saree from Bhagalpur with a rich, earthy texture. The golden hue of Tussar silk gives it a distinct elegance suited for cultural programs and formal dinners.',
      price: 3200,
      sku: 'RN-SAR-014',
      images: [IMG.sareeMuslin, IMG.detailMain],
      colors: ['#DAA520', '#8B4513', '#2F4F4F'],
      colorNames: ['Golden Tussar', 'Saddle Brown', 'Dark Slate Gray'],
      sizes: ['Free Size'],
      stock: 16,
      badge: null,
      rating: 4.3,
      reviewCount: 24,
    },
    {
      name: 'Motka Silk Saree — Festive Edition',
      description: 'Rich Motka silk saree designed especially for Eid and Puja celebrations. The heavy silk fabric with elaborate zari pallu creates a grand, festive appearance.',
      price: 4800,
      sku: 'RN-SAR-015',
      images: [IMG.sareeRose, IMG.chiffonSaree, IMG.detailMain],
      colors: ['#DC143C', '#FFD700', '#006400'],
      colorNames: ['Crimson', 'Gold Zari', 'Emerald Green'],
      sizes: ['Free Size'],
      stock: 11,
      badge: 'Best Seller',
      rating: 4.6,
      reviewCount: 67,
    },
  ];

  for (const s of sarees) {
    await db.product.create({
      data: {
        ...prep(s),
        comparePrice: calcComparePrice(s.price),
        categoryId: catSarees.id,
        status: 'active',
      },
    });
    productCount++;
  }
  console.log(`   ✅ ${sarees.length} Sarees created`);

  // ───────────────────────────────────────────────────────
  // 5B. JEWELRY (10 products)
  // ───────────────────────────────────────────────────────
  const jewelry = [
    {
      name: 'Pearl Choker Necklace',
      description: 'Handcrafted pearl choker with gold-plated clasp and delicate chain extender. This timeless piece adds a touch of sophistication to any traditional Bangladeshi outfit.',
      price: 1500,
      sku: 'RN-JWL-001',
      images: [IMG.pearlChoker],
      colors: ['#FFD700', '#C0C0C0'],
      colorNames: ['Gold Plated', 'Silver Plated'],
      sizes: ['One Size'],
      stock: 30,
      badge: 'Best Seller',
      rating: 4.8,
      reviewCount: 124,
    },
    {
      name: 'Gold-Plated Jhumka Set',
      description: 'Traditional Bengali jhumka earrings with intricate filigree work, paired with a matching tikka. The bell-shaped design produces a gentle chime with every movement.',
      price: 2200,
      sku: 'RN-JWL-002',
      images: [IMG.jhumkaSet, IMG.pearlChoker],
      colors: ['#FFD700', '#B8860B'],
      colorNames: ['Gold', 'Antique Gold'],
      sizes: ['One Size'],
      stock: 25,
      badge: null,
      rating: 4.7,
      reviewCount: 96,
    },
    {
      name: 'Kundan Bridal Necklace Set',
      description: 'Magnificent Kundan necklace set with matching earrings and maang tikka. Featuring uncut glass stones set in gold-plated brass, perfect for the Bangladeshi bride.',
      price: 4500,
      sku: 'RN-JWL-003',
      images: [IMG.pearlChoker, IMG.jhumkaSet, IMG.detailMain],
      colors: ['#FFD700', '#FF6347'],
      colorNames: ['Gold', 'Ruby Red'],
      sizes: ['One Size'],
      stock: 8,
      badge: 'New',
      rating: 4.9,
      reviewCount: 45,
    },
    {
      name: 'Temple Jewelry Choker',
      description: 'Inspired by South Indian temple jewelry, this choker features detailed deity motifs in gold-plated metal with emerald and ruby stone accents. A statement piece for special occasions.',
      price: 3800,
      sku: 'RN-JWL-004',
      images: [IMG.pearlChoker, IMG.detailMain],
      colors: ['#FFD700', '#006400', '#DC143C'],
      colorNames: ['Gold', 'Emerald', 'Ruby'],
      sizes: ['One Size'],
      stock: 12,
      badge: null,
      rating: 4.6,
      reviewCount: 38,
    },
    {
      name: 'Silver Oxidized Bangles Set — 6 Pcs',
      description: 'Set of six handcrafted oxidized silver bangles with traditional Bengali filigree and paisley engravings. Stack them together or mix with glass bangles for a boho-chic look.',
      price: 800,
      sku: 'RN-JWL-005',
      images: [IMG.jhumkaSet],
      colors: ['#C0C0C0', '#808080'],
      colorNames: ['Oxidized Silver', 'Dark Silver'],
      sizes: ['2.4 inch', '2.6 inch', '2.8 inch'],
      stock: 45,
      badge: 'Sale',
      rating: 4.3,
      reviewCount: 72,
    },
    {
      name: 'Chandbali Earrings — Pearl Drop',
      description: 'Elegant Chandbali earrings featuring a crescent moon design with cascading pearl drops. The gold-plated base with meenakari enamel work adds a regal touch to any ensemble.',
      price: 1200,
      sku: 'RN-JWL-006',
      images: [IMG.jhumkaSet, IMG.pearlChoker],
      colors: ['#FFD700', '#FFFFF0'],
      colorNames: ['Gold', 'Pearl White'],
      sizes: ['One Size'],
      stock: 28,
      badge: null,
      rating: 4.5,
      reviewCount: 58,
    },
    {
      name: 'Maang Tikka — Gold Plated',
      description: 'Delicate gold-plated maang tikka with central pearl and surrounding crystal stones. The adjustable chain ensures a perfect fit, completing your traditional bridal or festive look.',
      price: 950,
      sku: 'RN-JWL-007',
      images: [IMG.pearlChoker],
      colors: ['#FFD700'],
      colorNames: ['Gold'],
      sizes: ['One Size'],
      stock: 35,
      badge: null,
      rating: 4.4,
      reviewCount: 29,
    },
    {
      name: 'Pearl & Crystal Bracelet',
      description: 'Dainty bracelet alternating between freshwater pearls and sparkling crystals on a gold-plated chain. Perfect for adding a subtle sparkle to both traditional and western outfits.',
      price: 1800,
      sku: 'RN-JWL-008',
      images: [IMG.pearlChoker, IMG.jhumkaSet],
      colors: ['#FFD700', '#E0E0E0'],
      colorNames: ['Gold', 'Crystal'],
      sizes: ['One Size'],
      stock: 20,
      badge: 'New',
      rating: 4.6,
      reviewCount: 31,
    },
    {
      name: 'Antique Gold Neckpiece — Statement',
      description: 'Bold antique gold-finished neckpiece with intricate tribal-inspired motifs. A versatile statement necklace that elevates simple kurtas and sarees alike for a contemporary ethnic look.',
      price: 3200,
      sku: 'RN-JWL-009',
      images: [IMG.pearlChoker, IMG.detailMain, IMG.jhumkaSet],
      colors: ['#B8860B', '#CD853F'],
      colorNames: ['Antique Gold', 'Bronze'],
      sizes: ['One Size'],
      stock: 15,
      badge: null,
      rating: 4.7,
      reviewCount: 42,
    },
    {
      name: 'Cubic Zirconia Diamond Earrings',
      description: 'Stunning CZ diamond-studded earrings in a classic stud design with a halo setting. The brilliant-cut stones catch light beautifully, offering the look of real diamonds at an accessible price.',
      price: 2800,
      sku: 'RN-JWL-010',
      images: [IMG.jhumkaSet, IMG.pearlChoker],
      colors: ['#C0C0C0', '#FFD700'],
      colorNames: ['Silver Setting', 'Gold Setting'],
      sizes: ['One Size'],
      stock: 18,
      badge: null,
      rating: 4.5,
      reviewCount: 36,
    },
  ];

  for (const j of jewelry) {
    await db.product.create({
      data: {
        ...prep(j),
        comparePrice: calcComparePrice(j.price),
        categoryId: catJewelry.id,
        status: 'active',
      },
    });
    productCount++;
  }
  console.log(`   ✅ ${jewelry.length} Jewelry items created`);

  // ───────────────────────────────────────────────────────
  // 5C. FUSION WEAR (10 products)
  // ───────────────────────────────────────────────────────
  const fusionWear = [
    {
      name: 'Ivory Gold Kurta Set',
      description: 'Elegant ivory kurta with intricate gold threadwork and chikankari embroidery. Comes with matching palazzo pants, creating a timeless silhouette for both festive and formal events.',
      price: 2800,
      sku: 'RN-FSN-001',
      images: [IMG.kurtaIvory, IMG.kurtaGold],
      colors: ['#F5F0E8', '#1C1C1C'],
      colorNames: ['Ivory', 'Onyx'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 22,
      badge: 'Best Seller',
      rating: 4.5,
      reviewCount: 86,
    },
    {
      name: 'Silk Anarkali Kurta — Festive',
      description: 'Flowing silk anarkali kurta with intricate zari work on the yoke and hem. The flared silhouette and rich fabric make it a stunning choice for Eid celebrations and weddings.',
      price: 4200,
      sku: 'RN-FSN-002',
      images: [IMG.anarkaliSilk, IMG.detailMain],
      colors: ['#800020', '#4B0082', '#006400'],
      colorNames: ['Burgundy', 'Royal Purple', 'Forest Green'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 14,
      badge: 'New',
      rating: 4.7,
      reviewCount: 53,
    },
    {
      name: 'Cotton Palazzo & Kurta Set',
      description: 'Breathable cotton kurta paired with wide-leg palazzo pants, both featuring complementary block prints. A comfortable yet stylish everyday option for the Bangladeshi summer.',
      price: 1800,
      sku: 'RN-FSN-003',
      images: [IMG.kurtaIvory, IMG.anarkaliSilk],
      colors: ['#87CEEB', '#FFB6C1', '#98FB98'],
      colorNames: ['Sky Blue', 'Soft Pink', 'Mint'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 35,
      badge: null,
      rating: 4.3,
      reviewCount: 67,
    },
    {
      name: 'Chikankari Kurti — Lucknowi Craft',
      description: 'Pure cotton kurti featuring authentic Lucknowi Chikankari embroidery with shadow work. The delicate white-on-white threadwork creates an elegant texture perfect for office wear and casual outings.',
      price: 2200,
      sku: 'RN-FSN-004',
      images: [IMG.kurtaIvory],
      colors: ['#FFFFFF', '#F5F5DC', '#E6E6FA'],
      colorNames: ['White', 'Cream', 'Lavender'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 28,
      badge: null,
      rating: 4.4,
      reviewCount: 49,
    },
    {
      name: 'Embroidered Sherwani — Premium',
      description: 'Premium sherwani with elaborate resham and zardozi embroidery on rich velvet fabric. Tailored for a regal fit, this piece is designed for grooms and wedding attendees at Bangladeshi celebrations.',
      price: 4500,
      sku: 'RN-FSN-005',
      images: [IMG.kurtaGold, IMG.anarkaliSilk, IMG.detailMain],
      colors: ['#1C1C1C', '#800020', '#F5F0E8'],
      colorNames: ['Black', 'Maroon', 'Ivory'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 10,
      badge: null,
      rating: 4.6,
      reviewCount: 31,
    },
    {
      name: 'Linen Kurta Pant Set — Minimalist',
      description: 'Crisp linen kurta with a mandarin collar and straight-cut pants. The minimalist design in natural linen tones is perfect for a refined casual look or a day at the office.',
      price: 1500,
      sku: 'RN-FSN-006',
      images: [IMG.kurtaIvory, IMG.kurtaGold],
      colors: ['#D2B48C', '#F5F5DC', '#808080'],
      colorNames: ['Tan', 'Natural', 'Charcoal'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 40,
      badge: 'Sale',
      rating: 4.2,
      reviewCount: 55,
    },
    {
      name: 'Designer Anarkali — Floor Length',
      description: 'Breathtaking floor-length anarkali in georgette with full embroidery coverage. The multi-layered flared skirt and fitted bodice create a fairy-tale silhouette for grand occasions.',
      price: 3800,
      sku: 'RN-FSN-007',
      images: [IMG.anarkaliSilk, IMG.kurtaIvory, IMG.detailMain],
      colors: ['#E5A9B4', '#D1D4E3', '#F3E5D8'],
      colorNames: ['Dusty Rose', 'Lavender Mist', 'Champagne'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 9,
      badge: 'New',
      rating: 4.8,
      reviewCount: 22,
    },
    {
      name: 'Block Print Kurta — Ajrakh Style',
      description: 'Hand block-printed kurta using traditional Ajrakh techniques with natural dyes. The geometric patterns in deep indigo and rust create a striking visual that celebrates artisanal craft.',
      price: 1200,
      sku: 'RN-FSN-008',
      images: [IMG.kurtaGold, IMG.kurtaIvory],
      colors: ['#191970', '#8B4513', '#F5DEB3'],
      colorNames: ['Indigo', 'Rust', 'Wheat'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 50,
      badge: null,
      rating: 4.1,
      reviewCount: 43,
    },
    {
      name: 'Rayon Palazzo & Top Set — Printed',
      description: 'Soft rayon top with relaxed fit paired with matching printed palazzo pants. The vibrant Bengali-inspired floral print makes this set a cheerful choice for weekend outings and casual get-togethers.',
      price: 1600,
      sku: 'RN-FSN-009',
      images: [IMG.anarkaliSilk, IMG.kurtaIvory],
      colors: ['#FF69B4', '#00CED1', '#FFA500'],
      colorNames: ['Hot Pink', 'Turquoise', 'Tangerine'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 32,
      badge: null,
      rating: 4.0,
      reviewCount: 37,
    },
    {
      name: 'Zari Work Kurta — Celebration Special',
      description: 'Premium kurta featuring all-over zari threadwork with traditional Bangladeshi nakshi patterns. The shimmering gold threads on deep-colored fabric make it perfect for Puja and Eid celebrations.',
      price: 3200,
      sku: 'RN-FSN-010',
      images: [IMG.kurtaGold, IMG.anarkaliSilk],
      colors: ['#1C1C1C', '#000080', '#2F4F4F'],
      colorNames: ['Black', 'Navy Blue', 'Dark Teal'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 18,
      badge: 'Best Seller',
      rating: 4.6,
      reviewCount: 61,
    },
  ];

  for (const f of fusionWear) {
    await db.product.create({
      data: {
        ...prep(f),
        comparePrice: calcComparePrice(f.price),
        categoryId: catFusion.id,
        status: 'active',
      },
    });
    productCount++;
  }
  console.log(`   ✅ ${fusionWear.length} Fusion Wear items created`);

  // ───────────────────────────────────────────────────────
  // 5D. BAGS (8 products)
  // ───────────────────────────────────────────────────────
  const bags = [
    {
      name: 'Genuine Leather Tote Bag',
      description: 'Spacious genuine leather tote bag handcrafted by artisans in Dhaka. Features an interior zip pocket, magnetic snap closure, and reinforced handles. Perfect for daily use and office commutes.',
      price: 2500,
      sku: 'RN-BAG-001',
      images: [IMG.leatherBag, IMG.detailMain],
      colors: ['#8B4513', '#1C1C1C', '#D2B48C'],
      colorNames: ['Tan', 'Black', 'Beige'],
      sizes: ['One Size'],
      stock: 20,
      badge: 'Best Seller',
      rating: 4.5,
      reviewCount: 78,
    },
    {
      name: 'Embroidered Potli Bag — Traditional',
      description: 'Hand-embroidered potli bag with drawstring closure and decorative tassels. Adorned with mirror work and colorful thread embroidery, this bag is the perfect companion for weddings and festive occasions.',
      price: 800,
      sku: 'RN-BAG-002',
      images: [IMG.leatherBag],
      colors: ['#DC143C', '#FFD700', '#006400'],
      colorNames: ['Red', 'Gold', 'Green'],
      sizes: ['One Size'],
      stock: 40,
      badge: null,
      rating: 4.3,
      reviewCount: 45,
    },
    {
      name: 'Jute Clutch — Eco Friendly',
      description: 'Eco-friendly jute clutch with a modern geometric pattern and cotton lining. Features a secure zip closure and an inner pocket. A sustainable fashion choice that supports local Bangladeshi jute artisans.',
      price: 600,
      sku: 'RN-BAG-003',
      images: [IMG.leatherBag, IMG.detailMain],
      colors: ['#D2B48C', '#8B4513', '#F5F5DC'],
      colorNames: ['Natural Jute', 'Brown', 'Cream'],
      sizes: ['One Size'],
      stock: 50,
      badge: 'Sale',
      rating: 4.1,
      reviewCount: 32,
    },
    {
      name: 'Silk Potli — Bridal',
      description: 'Luxurious silk potli bag embellished with zari work, sequins, and bead details. The rich fabric and ornate design make it an ideal bridal accessory to complement wedding sarees.',
      price: 1200,
      sku: 'RN-BAG-004',
      images: [IMG.leatherBag],
      colors: ['#FFD700', '#800020', '#4B0082'],
      colorNames: ['Gold Silk', 'Maroon Silk', 'Purple Silk'],
      sizes: ['One Size'],
      stock: 15,
      badge: 'New',
      rating: 4.6,
      reviewCount: 21,
    },
    {
      name: 'Handloom Messenger Bag',
      description: 'Sturdy handloom cotton messenger bag with adjustable shoulder strap and multiple compartments. Features traditional Bangladeshi woven patterns, combining functionality with cultural heritage.',
      price: 1800,
      sku: 'RN-BAG-005',
      images: [IMG.leatherBag, IMG.detailMain, IMG.kurtaIvory],
      colors: ['#4682B4', '#2E8B57', '#8B4513'],
      colorNames: ['Blue Stripe', 'Green Stripe', 'Brown'],
      sizes: ['One Size'],
      stock: 18,
      badge: null,
      rating: 4.4,
      reviewCount: 27,
    },
    {
      name: 'Embroidered Evening Clutch',
      description: 'Elegant evening clutch with intricate hand-embroidery on velvet fabric. Features a detachable chain strap and kiss-lock closure. The perfect accessory to elevate your evening outfit.',
      price: 1500,
      sku: 'RN-BAG-006',
      images: [IMG.leatherBag, IMG.pearlChoker],
      colors: ['#800020', '#191970', '#1C1C1C'],
      colorNames: ['Wine Velvet', 'Navy Velvet', 'Black Velvet'],
      sizes: ['One Size'],
      stock: 22,
      badge: null,
      rating: 4.5,
      reviewCount: 34,
    },
    {
      name: 'Kantha Stitch Tote — Handcrafted',
      description: 'Large canvas tote bag featuring authentic Kantha stitch embroidery by women artisans in rural Bangladesh. Each bag is one-of-a-kind with unique running stitch patterns in vibrant threads.',
      price: 2200,
      sku: 'RN-BAG-007',
      images: [IMG.leatherBag, IMG.detailMain],
      colors: ['#FF6347', '#4169E1', '#32CD32'],
      colorNames: ['Red Thread', 'Blue Thread', 'Green Thread'],
      sizes: ['One Size'],
      stock: 16,
      badge: 'New',
      rating: 4.7,
      reviewCount: 29,
    },
    {
      name: 'Bamboo Handle Basket Bag',
      description: 'Chic basket bag with a curved bamboo handle and cotton canvas body with hand-painted floral motifs. A trendy summer accessory that pairs beautifully with casual sarees and kurtas.',
      price: 1800,
      sku: 'RN-BAG-008',
      images: [IMG.leatherBag],
      colors: ['#F5DEB3', '#FFB6C1', '#E6E6FA'],
      colorNames: ['Natural', 'Pink Floral', 'Lavender Floral'],
      sizes: ['One Size'],
      stock: 12,
      badge: null,
      rating: 4.3,
      reviewCount: 18,
    },
  ];

  for (const b of bags) {
    await db.product.create({
      data: {
        ...prep(b),
        comparePrice: calcComparePrice(b.price),
        categoryId: catBags.id,
        status: 'active',
      },
    });
    productCount++;
  }
  console.log(`   ✅ ${bags.length} Bags created`);

  // ───────────────────────────────────────────────────────
  // 5E. ACCESSORIES (7 products)
  // ───────────────────────────────────────────────────────
  const accessories = [
    {
      name: 'Pure Silk Stole — Handwoven',
      description: 'Lightweight handwoven silk stole with subtle gradient coloring. Perfect as a dupatta alternative or a stylish wrap for evening events. The smooth silk drapes effortlessly over any outfit.',
      price: 800,
      sku: 'RN-ACC-001',
      images: [IMG.sareeRose, IMG.chiffonSaree],
      colors: ['#E5A9B4', '#DDA0DD', '#87CEEB'],
      colorNames: ['Rose', 'Plum', 'Sky Blue'],
      sizes: ['One Size'],
      stock: 35,
      badge: null,
      rating: 4.2,
      reviewCount: 28,
    },
    {
      name: 'Banarasi Dupatta — Heritage Weave',
      description: 'Luxurious Banarasi dupatta with rich zari border and intricate woven bootis. The fine silk fabric adds a regal touch when paired with simple kurtas or salwar kameez.',
      price: 1200,
      sku: 'RN-ACC-002',
      images: [IMG.sareeMuslin, IMG.sareeRose],
      colors: ['#800020', '#FFD700', '#228B22'],
      colorNames: ['Maroon', 'Gold Border', 'Green Border'],
      sizes: ['One Size'],
      stock: 25,
      badge: 'New',
      rating: 4.5,
      reviewCount: 41,
    },
    {
      name: 'Embroidered Hair Pins Set — 8 Pcs',
      description: 'Set of eight decorative hair pins featuring pearl, crystal, and enamel flower designs. These versatile pins can be used to create elegant updos for weddings, pujas, and festive celebrations.',
      price: 400,
      sku: 'RN-ACC-003',
      images: [IMG.pearlChoker, IMG.jhumkaSet],
      colors: ['#FFD700', '#FFB6C1', '#FFFFFF'],
      colorNames: ['Gold', 'Pink', 'Pearl White'],
      sizes: ['One Size'],
      stock: 50,
      badge: null,
      rating: 4.0,
      reviewCount: 19,
    },
    {
      name: 'Pashmina Shawl — Soft Kashmiri',
      description: 'Ultra-soft Pashmina wool shawl with delicate hand-embroidered borders. Lightweight yet warm, this luxurious shawl is a must-have for winter evenings and air-conditioned venues.',
      price: 2000,
      sku: 'RN-ACC-004',
      images: [IMG.sareeMuslin, IMG.detailMain],
      colors: ['#F5F5DC', '#808080', '#8B0000'],
      colorNames: ['Natural', 'Charcoal', 'Wine Red'],
      sizes: ['One Size'],
      stock: 10,
      badge: null,
      rating: 4.7,
      reviewCount: 35,
    },
    {
      name: 'Kantha Stitch Scarf — Vibrant',
      description: 'Colorful cotton scarf featuring traditional Kantha running stitch embroidery by Bangladeshi artisans. The vibrant thread work on soft cotton makes it a cheerful accessory for any season.',
      price: 650,
      sku: 'RN-ACC-005',
      images: [IMG.sareeRose, IMG.chiffonSaree, IMG.detailMain],
      colors: ['#FF4500', '#1E90FF', '#FFD700'],
      colorNames: ['Orange Red', 'Blue', 'Yellow'],
      sizes: ['One Size'],
      stock: 45,
      badge: 'Sale',
      rating: 4.3,
      reviewCount: 52,
    },
    {
      name: 'Crystal Hair Comb — Bridal',
      description: 'Stunning hair comb adorned with sparkling crystals and faux pearls on a silver-plated base. Designed to hold updos securely while adding dazzling sparkle, perfect for brides and bridesmaids.',
      price: 900,
      sku: 'RN-ACC-006',
      images: [IMG.pearlChoker, IMG.jhumkaSet, IMG.detailMain],
      colors: ['#C0C0C0', '#FFD700'],
      colorNames: ['Silver Crystal', 'Gold Crystal'],
      sizes: ['One Size'],
      stock: 20,
      badge: 'New',
      rating: 4.6,
      reviewCount: 16,
    },
    {
      name: 'Chiffon Dupatta — Printed Floral',
      description: 'Sheer chiffon dupatta with delicate floral print and lace-edged border. The lightweight fabric floats beautifully and adds a graceful finishing touch to any salwar kameez or lehenga ensemble.',
      price: 550,
      sku: 'RN-ACC-007',
      images: [IMG.chiffonSaree, IMG.sareeRose],
      colors: ['#FFB6C1', '#98FB98', '#DDA0DD'],
      colorNames: ['Pink Floral', 'Green Floral', 'Purple Floral'],
      sizes: ['One Size'],
      stock: 38,
      badge: null,
      rating: 4.1,
      reviewCount: 24,
    },
  ];

  for (const a of accessories) {
    await db.product.create({
      data: {
        ...prep(a),
        comparePrice: calcComparePrice(a.price),
        categoryId: catAccessories.id,
        status: 'active',
      },
    });
    productCount++;
  }
  console.log(`   ✅ ${accessories.length} Accessories created`);

  // ───────────────────────────────────────────────────────
  // 5F. DRAFT PRODUCTS (3 products)
  // ───────────────────────────────────────────────────────
  const draftProducts = [
    {
      name: 'Pat Silk Saree — Assam Special',
      description: 'Rare Assamese Pat silk saree with natural golden sheen and traditional motifs. This upcoming collection piece showcases the unique silk heritage of Northeast India.',
      price: 5800,
      sku: 'RN-SAR-016',
      images: [IMG.sareeMuslin],
      colors: ['#DAA520', '#8B4513'],
      colorNames: ['Golden Pat', 'Brown'],
      sizes: ['Free Size'],
      stock: 0,
      badge: null,
      rating: 0,
      reviewCount: 0,
    },
    {
      name: 'Meenakari Jewelry Box Set',
      description: 'Curated jewelry box set featuring Meenakari earrings, bangles, and a ring. Each piece is hand-enameled with vibrant colors inspired by Rajasthani palace art.',
      price: 3500,
      sku: 'RN-JWL-011',
      images: [IMG.jhumkaSet, IMG.pearlChoker],
      colors: ['#006400', '#DC143C', '#4169E1'],
      colorNames: ['Green Enamel', 'Red Enamel', 'Blue Enamel'],
      sizes: ['One Size'],
      stock: 0,
      badge: null,
      rating: 0,
      reviewCount: 0,
    },
    {
      name: 'Organic Cotton Kurta — Dye Free',
      description: 'Pure organic cotton kurta in its natural undyed state. Part of our upcoming sustainable fashion line, this kurta celebrates eco-conscious fashion without compromising on style.',
      price: 1400,
      sku: 'RN-FSN-011',
      images: [IMG.kurtaIvory],
      colors: ['#F5F5DC'],
      colorNames: ['Natural Cotton'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 0,
      badge: null,
      rating: 0,
      reviewCount: 0,
    },
  ];

  for (const d of draftProducts) {
    let catId = catSarees.id;
    if (d.sku.startsWith('RN-JWL')) catId = catJewelry.id;
    else if (d.sku.startsWith('RN-FSN')) catId = catFusion.id;

    await db.product.create({
      data: {
        ...prep(d),
        comparePrice: null,
        categoryId: catId,
        status: 'draft',
      },
    });
    productCount++;
  }
  console.log(`   ✅ ${draftProducts.length} Draft products created`);
  console.log(`   📦 Total products: ${productCount}\n`);

  // ═══════════════════════════════════════════════════════
  // 6. CREATE SAMPLE ADDRESS FOR CUSTOMER
  // ═══════════════════════════════════════════════════════
  console.log('📍 Creating sample address...');

  await db.address.create({
    data: {
      label: 'Home',
      fullName: 'Test Customer',
      phone: '+8801712345678',
      street: 'House 12, Road 5, Dhanmondi',
      apartment: 'Apt 4B',
      city: 'Dhaka',
      postalCode: '1205',
      isDefault: true,
      userId: customer.id,
    },
  });
  console.log('   ✅ Sample address created\n');

  // ═══════════════════════════════════════════════════════
  // 7. CREATE SAMPLE REVIEWS
  // ═══════════════════════════════════════════════════════
  console.log('⭐ Creating sample reviews...');

  const reviewTargets = [
    { sku: 'RN-SAR-001', rating: 5, text: 'Absolutely stunning muslin saree! The rose-tinted color is even more beautiful in person. Received so many compliments at my sister\'s wedding.' },
    { sku: 'RN-SAR-002', rating: 5, text: 'Authentic Jamdani at this price is a steal. The weaving quality is top-notch and the fabric feels like a cloud. Truly a Bangladeshi treasure.' },
    { sku: 'RN-JWL-001', rating: 5, text: 'Elegant pearl choker that looks way more expensive than it is. The gold plating is quality and the pearls have a beautiful luster.' },
    { sku: 'RN-JWL-002', rating: 4, text: 'Beautiful jhumka set with great detailing. The tikka is a lovely addition. Only wish the hooks were a bit sturdier.' },
    { sku: 'RN-FSN-001', rating: 5, text: 'The ivory gold kurta set exceeded my expectations. The chikankari work is impeccable and the fabric is very comfortable for long events.' },
    { sku: 'RN-FSN-002', rating: 5, text: 'This anarkali is a showstopper! The zari work is intricate and the silk fabric has a beautiful drape. Perfect for Eid.' },
    { sku: 'RN-BAG-001', rating: 4, text: 'Great quality leather tote. Spacious enough for my laptop and daily essentials. The leather smell is authentic and the stitching is solid.' },
    { sku: 'RN-BAG-007', rating: 5, text: 'Love the Kantha stitch work on this tote! Each one is truly unique. Supporting local artisans makes it even more special.' },
    { sku: 'RN-ACC-002', rating: 5, text: 'The Banarasi dupatta is gorgeous. The zari border is rich and the silk fabric feels luxurious. Pairs beautifully with simple kurtas.' },
    { sku: 'RN-ACC-006', rating: 4, text: 'The crystal hair comb is sparkly and well-made. Added the perfect touch of glamour to my bridal updo.' },
  ];

  let reviewCount = 0;
  for (const r of reviewTargets) {
    const product = await db.product.findFirst({ where: { sku: r.sku } });
    if (product) {
      await db.review.create({
        data: {
          userId: customer.id,
          productId: product.id,
          rating: r.rating,
          text: r.text,
        },
      });
      reviewCount++;
    }
  }
  console.log(`   ✅ ${reviewCount} reviews created\n`);

  // ═══════════════════════════════════════════════════════
  // 8. CREATE SAMPLE ORDERS
  // ═══════════════════════════════════════════════════════
  console.log('📦 Creating sample orders...');

  const orderProducts = {
    saree: await db.product.findFirst({ where: { sku: 'RN-SAR-001' } }),
    jhumka: await db.product.findFirst({ where: { sku: 'RN-JWL-002' } }),
    kurta: await db.product.findFirst({ where: { sku: 'RN-FSN-001' } }),
    bag: await db.product.findFirst({ where: { sku: 'RN-BAG-001' } }),
    dupatta: await db.product.findFirst({ where: { sku: 'RN-ACC-002' } }),
  };

  const sampleOrders = [
    {
      orderNumber: 'RN-ORD-10001',
      status: 'delivered' as const,
      total: 3500,
      items: [{ productId: orderProducts.saree!.id, name: orderProducts.saree!.name, price: orderProducts.saree!.price, quantity: 1, image: orderProducts.saree!.images[0] }],
    },
    {
      orderNumber: 'RN-ORD-10002',
      status: 'shipped' as const,
      total: 3400,
      items: [
        { productId: orderProducts.jhumka!.id, name: orderProducts.jhumka!.name, price: orderProducts.jhumka!.price, quantity: 1, image: orderProducts.jhumka!.images[0] },
        { productId: orderProducts.dupatta!.id, name: orderProducts.dupatta!.name, price: orderProducts.dupatta!.price, quantity: 1, image: orderProducts.dupatta!.images[0] },
      ],
    },
    {
      orderNumber: 'RN-ORD-10003',
      status: 'processing' as const,
      total: 5300,
      items: [
        { productId: orderProducts.kurta!.id, name: orderProducts.kurta!.name, price: orderProducts.kurta!.price, quantity: 1, image: orderProducts.kurta!.images[0] },
        { productId: orderProducts.bag!.id, name: orderProducts.bag!.name, price: orderProducts.bag!.price, quantity: 1, image: orderProducts.bag!.images[0] },
      ],
    },
    {
      orderNumber: 'RN-ORD-10004',
      status: 'delivered' as const,
      total: 2800,
      items: [{ productId: orderProducts.kurta!.id, name: orderProducts.kurta!.name, price: orderProducts.kurta!.price, quantity: 1, image: orderProducts.kurta!.images[0] }],
    },
  ];

  const addressJson = JSON.stringify({
    fullName: 'Test Customer',
    phone: '+8801712345678',
    street: 'House 12, Road 5, Dhanmondi',
    apartment: 'Apt 4B',
    city: 'Dhaka',
    postalCode: '1205',
  });

  for (const o of sampleOrders) {
    await db.order.create({
      data: {
        orderNumber: o.orderNumber,
        userId: customer.id,
        status: o.status,
        total: o.total,
        address: addressJson,
        orderItems: { create: o.items },
      },
    });
  }
  console.log(`   ✅ ${sampleOrders.length} sample orders created\n`);

  // ═══════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════');
  console.log('🎉 Seed complete!');
  console.log('═══════════════════════════════════════════\n');

  console.log('📋 Summary:');
  console.log(`   Users:       2 (admin + customer)`);
  console.log(`   Categories:  5`);
  console.log(`   Banners:     4`);
  console.log(`   Products:    ${productCount} (50 active + 3 draft)`);
  console.log(`   Reviews:     ${reviewCount}`);
  console.log(`   Orders:      ${sampleOrders.length}`);
  console.log(`   Addresses:   1\n`);

  console.log('🔐 Login credentials:');
  console.log('   Admin:    admin@rupnogor.com / Admin@2024');
  console.log('   Customer: customer@rupnogor.com / Customer@2024');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());