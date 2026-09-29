// Seeds the database with the content from the EGF company profile.
// Safe to run repeatedly: it only creates rows that do not exist yet and
// never overwrites edits made in the admin panel.
//
//   pnpm db:seed
//
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ---------------------------------------------------------------------------
   Data
   --------------------------------------------------------------------------- */

const categories = [
  {
    slug: "flexible-hoses-bellows",
    nameEn: "Flexible Hoses & Bellows",
    nameAr: "الخراطيم المرنة والمنافيخ",
    descriptionEn: "Cooker connection hoses and stainless steel corrugated flexible connectors formed in-house.",
    sortOrder: 1,
  },
  {
    slug: "meter-unions-connectors",
    nameEn: "Gas Meter Unions & Connectors",
    nameAr: "وصلات وموصلات عدادات الغاز",
    descriptionEn: "Brass unions and flexible connectors for domestic and commercial gas meters.",
    sortOrder: 2,
  },
  {
    slug: "house-entry-tees",
    nameEn: "House Entry Tees",
    nameAr: "مشتركات دخول المنازل",
    descriptionEn: "Entry tees for residential natural gas service connections.",
    sortOrder: 3,
  },
  {
    slug: "compression-adaptor-fittings",
    nameEn: "Compression & Adaptor Fittings",
    nameAr: "وصلات الضغط والمحولات",
    descriptionEn: "Brass compression adaptors and threaded adaptor fittings.",
    sortOrder: 4,
  },
  {
    slug: "couplings-nipples",
    nameEn: "Couplings & Hose Nipples",
    nameAr: "الكوبلنجات ونبلات الخراطيم",
    descriptionEn: "Brass couplings and nickel-plated steel hose nipples and couplings.",
    sortOrder: 5,
  },
];

const products = [
  {
    slug: "cooker-flex",
    nameEn: "Cooker-Flex (Flexible Hose)",
    nameAr: "خرطوم بوتاجاز مرن (Cooker-Flex)",
    category: "flexible-hoses-bellows",
    sizes: '1/2"',
    standard: "BS 669-1",
    material: "Flexible hose with brass end fittings",
    shortDescriptionEn: "Flexible cooker connection hose with brass end fittings for domestic gas appliances.",
    descriptionEn:
      'Cooker-Flex is a flexible connection hose for domestic gas cookers and hobs, manufactured to BS 669-1 with brass end fittings.\n\nSupplied in 1/2" size. Every hose is produced on EGF\'s integrated line and inspected before release.',
    imageUrl: "/images/products/cooker-flex.webp",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "house-entry-tee",
    nameEn: "House Entry Tee",
    nameAr: "مشترك دخول منزلي",
    category: "house-entry-tees",
    sizes: '3/4" – 1"',
    standard: "GIS/PL3:2022",
    material: "Brass",
    shortDescriptionEn: 'Brass house entry tee for residential natural gas service connections, in 3/4" and 1".',
    descriptionEn:
      'The house entry tee connects the residential service line to the internal installation at the point of entry. Manufactured in brass to GIS/PL3:2022, in 3/4" and 1" sizes.\n\nMachined on CNC and transfer lines for consistent thread quality and sealing faces.',
    imageUrl: "/images/products/house-entry-tee.webp",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "house-entry-tee-63mm",
    nameEn: "House Entry Tee (63 mm)",
    nameAr: "مشترك دخول منزلي (63 مم)",
    category: "house-entry-tees",
    sizes: "63 mm × 2",
    standard: "GIS/PL3",
    material: "Brass",
    shortDescriptionEn: "Larger-format house entry tee for 63 mm × 2 connections, produced to GIS/PL3.",
    descriptionEn:
      "A larger house entry tee for 63 mm × 2 connections, produced to GIS/PL3.\n\nManufactured on the same integrated production floor as the rest of the range and inspected before release.",
    imageUrl: "/images/products/house-entry-tee-63mm.webp",
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "gas-meter-union-grooved",
    nameEn: "Gas Meter Union, Grooved",
    nameAr: "وصلة عداد غاز مجرّاة",
    category: "meter-unions-connectors",
    sizes: "22 mm (BS 746 nut / end 22)",
    standard: "BS 746:2014",
    material: "Brass",
    shortDescriptionEn: "Grooved gas meter union with BS 746 nut and 22 mm end, manufactured to BS 746:2014.",
    descriptionEn:
      "Brass gas meter union with a grooved 22 mm end and BS 746 nut, manufactured to BS 746:2014 for connecting domestic gas meters.\n\nTight tolerances on the sealing faces are held by CNC machining.",
    imageUrl: "/images/products/gas-meter-union-grooved.webp",
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "gas-meter-union",
    nameEn: "Gas Meter Union",
    nameAr: "وصلة عداد غاز",
    category: "meter-unions-connectors",
    sizes: '3/4" – 1"',
    standard: "BS 746:2014 × BS 21 BSPT male",
    material: "Brass",
    shortDescriptionEn: 'Gas meter union in 3/4" and 1" with BS 21 BSPT male thread, manufactured to BS 746:2014.',
    descriptionEn:
      'Brass gas meter union in 3/4" and 1" sizes, manufactured to BS 746:2014 with a BS 21 BSPT male thread end.\n\nUsed to connect domestic and commercial gas meters to the installation pipework.',
    imageUrl: "/images/products/gas-meter-union.webp",
    featured: true,
    sortOrder: 5,
  },
  {
    slug: "gas-meter-connector",
    nameEn: "Gas Meter Connector",
    nameAr: "موصل عداد غاز",
    category: "meter-unions-connectors",
    sizes: '1/2" – 3/4" – 1" – 2"',
    standard: "BS EN ISO 10380:2012",
    material: "Stainless steel corrugated hose, brass ends",
    shortDescriptionEn: 'Stainless steel corrugated meter connector in 1/2" to 2" sizes, manufactured to BS EN ISO 10380:2012.',
    descriptionEn:
      'Flexible gas meter connector with a stainless steel corrugated hose body and brass end fittings, manufactured to BS EN ISO 10380:2012.\n\nAvailable in 1/2", 3/4", 1" and 2" sizes. The corrugated hose is formed in-house on EGF\'s dedicated line.',
    imageUrl: "/images/products/gas-meter-connector.webp",
    featured: true,
    sortOrder: 6,
  },
  {
    slug: "expansion-bellow",
    nameEn: "Expansion Bellow (Flexible Connector)",
    nameAr: "منفاخ تمدد (وصلة مرنة)",
    category: "flexible-hoses-bellows",
    sizes: '1/2" – 3/4" – 1" – 2"',
    standard: "BS EN ISO 10380:2012",
    material: "Stainless steel corrugated hose",
    shortDescriptionEn: 'Stainless steel expansion bellow flexible connector, 1/2" to 2", manufactured to BS EN ISO 10380:2012.',
    descriptionEn:
      'Expansion bellows absorb movement, vibration and thermal expansion in gas pipework. Formed from stainless steel corrugated hose to a controlled pitch and manufactured to BS EN ISO 10380:2012.\n\nAvailable in 1/2", 3/4", 1" and 2" sizes.',
    imageUrl: "/images/products/expansion-bellow.webp",
    featured: true,
    sortOrder: 7,
  },
  {
    slug: "compression-adaptor-f612",
    nameEn: "Compression Fitting Adaptor F612",
    nameAr: "محول وصلة ضغط F612",
    category: "compression-adaptor-fittings",
    sizes: '1/2"',
    standard: "BS EN 1254-2:2021",
    material: "Brass",
    shortDescriptionEn: 'Brass compression fitting adaptor type F612, 1/2", manufactured to BS EN 1254-2:2021.',
    descriptionEn:
      'Compression fitting adaptor type F612 in 1/2" size for copper tube connections, manufactured in brass to BS EN 1254-2:2021.\n\nPrecision-machined threads and compression seats for leak-tight joints.',
    imageUrl: "/images/products/compression-adaptor-f612.webp",
    featured: true,
    sortOrder: 8,
  },
  {
    slug: "compression-adaptor-f611",
    nameEn: "Compression Fitting Adaptor F611",
    nameAr: "محول وصلة ضغط F611",
    category: "compression-adaptor-fittings",
    sizes: '1/2"',
    standard: "BS EN 1254-2:2021",
    material: "Brass",
    shortDescriptionEn: 'Brass compression fitting adaptor type F611, 1/2", manufactured to BS EN 1254-2:2021.',
    descriptionEn:
      'Compression fitting adaptor type F611 in 1/2" size for copper tube connections, manufactured in brass to BS EN 1254-2:2021.\n\nPrecision-machined threads and compression seats for leak-tight joints.',
    imageUrl: "/images/products/compression-adaptor-f611.webp",
    featured: false,
    sortOrder: 9,
  },
  {
    slug: "adaptor-fitting-ff",
    nameEn: "Adaptor Fitting, F/F",
    nameAr: "وصلة محول أنثى/أنثى",
    category: "compression-adaptor-fittings",
    sizes: '1/2"',
    standard: "BS EN 12165",
    material: "Brass",
    shortDescriptionEn: 'Female-to-female brass adaptor fitting, 1/2", machined from brass to BS EN 12165.',
    descriptionEn:
      'Female/female adaptor fitting in 1/2" size, machined from brass forging stock to BS EN 12165.\n\nUsed to join and adapt threaded gas pipework components.',
    imageUrl: "/images/products/adaptor-fitting-ff.webp",
    featured: false,
    sortOrder: 10,
  },
  {
    slug: "coupling",
    nameEn: "Coupling",
    nameAr: "كوبلنج",
    category: "couplings-nipples",
    sizes: '2"',
    standard: "BS EN 12165",
    material: "Brass CW617N",
    shortDescriptionEn: '2" brass coupling machined from CW617N brass to BS EN 12165.',
    descriptionEn:
      'Brass coupling in 2" size, machined from CW617N brass forging stock to BS EN 12165.\n\nProduced on transfer machines for high-volume, repeatable output.',
    imageUrl: "/images/products/coupling.webp",
    featured: false,
    sortOrder: 11,
  },
  {
    slug: "steel-hose-nipples-couplings",
    nameEn: "Steel Hose Nipples & Couplings (Nickel-Plated)",
    nameAr: "نبلات وكوبلنجات خراطيم صلب (مطلية بالنيكل)",
    category: "couplings-nipples",
    sizes: "Multiple sizes",
    standard: null,
    material: "Nickel-plated steel",
    shortDescriptionEn: "Nickel-plated steel hose nipples and couplings in multiple sizes.",
    descriptionEn:
      "Nickel-plated steel hose nipples and couplings for flexible hose assemblies, available in multiple sizes.\n\nContact us for the current size range and specifications.",
    imageUrl: null,
    featured: false,
    sortOrder: 12,
  },
];

const clients = [
  { nameEn: "TAQA Gas", logoUrl: "/images/clients/taqa-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 1 },
  { nameEn: "Fayum Gas", logoUrl: "/images/clients/fayum-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 2 },
  { nameEn: "Modern Gas", logoUrl: "/images/clients/modern-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 3 },
  { nameEn: "Egypt Gas", logoUrl: "/images/clients/egypt-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 4 },
  { nameEn: "NATGAS", logoUrl: "/images/clients/natgas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 5 },
  { nameEn: "Overseas Gas", logoUrl: "/images/clients/overseas-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 6 },
  { nameEn: "Town Gas", logoUrl: "/images/clients/town-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 7 },
  { nameEn: "SIANKO", nameAr: "صيانكو", logoUrl: "/images/clients/sianko.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 8 },
  { nameEn: "Maya Gas", logoUrl: "/images/clients/maya-gas.webp", type: "DOMESTIC", country: "Egypt", sortOrder: 9 },
  {
    nameEn: "Sharjah Electricity, Water & Gas Authority (SEWA)",
    nameAr: "هيئة كهرباء ومياه وغاز الشارقة",
    logoUrl: "/images/clients/sewa.webp",
    type: "EXPORT",
    country: "United Arab Emirates",
    sortOrder: 10,
  },
];

const facilityPhotos = [
  { titleEn: "Facility entrance", titleAr: "مدخل المصنع", captionEn: "25B, Industrial Zone 4, Badr City, Cairo", imageUrl: "/images/facility/entrance.webp", sortOrder: 1 },
  { titleEn: "Production floor", titleAr: "صالة الإنتاج", captionEn: "Badr Industrial Zone, Cairo", imageUrl: "/images/facility/production-floor.webp", sortOrder: 2 },
  { titleEn: "Raw material stock", titleAr: "مخزون الخامات", imageUrl: "/images/facility/raw-material-stock.webp", sortOrder: 3 },
  { titleEn: "CNC machining", titleAr: "التشغيل على ماكينات CNC", imageUrl: "/images/facility/cnc-machining.webp", sortOrder: 4 },
  { titleEn: "Crimping machine", titleAr: "ماكينة الكبس", imageUrl: "/images/facility/crimping-machine.webp", sortOrder: 5 },
  { titleEn: "Automatic welding machine", titleAr: "ماكينة اللحام الآلي", imageUrl: "/images/facility/automatic-welding-machine.webp", sortOrder: 6 },
  { titleEn: "Finished products", titleAr: "المنتجات النهائية", imageUrl: "/images/facility/finished-products.webp", sortOrder: 7 },
  { titleEn: "Packaging & dispatch", titleAr: "التعبئة والشحن", imageUrl: "/images/facility/packaging-dispatch.webp", sortOrder: 8 },
  { titleEn: "Quality control lab", titleAr: "معمل مراقبة الجودة", imageUrl: "/images/facility/quality-control-lab.webp", sortOrder: 9 },
];

const certifications = [
  {
    nameEn: "ISO 9001:2015",
    nameAr: "ISO 9001:2015",
    issuerEn: "Quality management system",
    issuerAr: "نظام إدارة الجودة",
    descriptionEn: "Certified quality management system, covering production and process control.",
    descriptionAr: "نظام إدارة جودة معتمد يغطي الإنتاج والتحكم في العمليات.",
    imageUrl: "/images/quality/iso-9001.webp",
    sortOrder: 1,
  },
  {
    nameEn: "EOS Certified",
    nameAr: "معتمد من هيئة المواصفات EOS",
    issuerEn: "Egyptian Organization for Standards & Quality",
    issuerAr: "الهيئة المصرية العامة للمواصفات والجودة",
    descriptionEn: "Certified by the Egyptian Organization for Standards & Quality.",
    descriptionAr: "معتمد من الهيئة المصرية العامة للمواصفات والجودة.",
    imageUrl: "/images/quality/eos.webp",
    sortOrder: 2,
  },
  {
    nameEn: "EGAS Registered",
    nameAr: "مسجّل لدى إيجاس",
    issuerEn: "Egyptian Natural Gas Holding Company",
    issuerAr: "الشركة القابضة للغازات الطبيعية (إيجاس)",
    descriptionEn: "Approved-supplier registration with Egypt's Natural Gas Holding Company.",
    descriptionAr: "تسجيل كمورّد معتمد لدى الشركة القابضة للغازات الطبيعية.",
    imageUrl: null,
    sortOrder: 3,
  },
];

const settings = {
  id: 1,
  companyNameEn: "Egypt Gas Fittings",
  companyNameAr: "مصر لوصلات الغاز",
  taglineEn: "Gas fittings & accessories",
  taglineAr: "وصلات وملحقات الغاز",
  phone1: "+20 2 8605 354",
  phone2: "+20 2 8605 414",
  mobile1: "+20 100 622 2181",
  mobile2: "+20 106 654 5852",
  fax: "+20 2 8605 355",
  email: "info@egyptgasfittings.com",
  whatsapp: null,
  addressEn: "25B, Industrial Zone 4, Badr City, Cairo Governorate, Egypt",
  addressAr: "25 ب، المنطقة الصناعية الرابعة، مدينة بدر، محافظة القاهرة، مصر",
  mapEmbedUrl: null,
  foundedYear: 2005,
  unitsProduced: "2,000,000+",
  unitsProducedYear: 2025,
  vatNumber: "208-113-142",
  standards: ["BS 669-1", "BS 746:2014", "BS 21", "BS EN ISO 10380:2012", "BS EN 1254-2:2021", "BS EN 12165", "GIS/PL3:2022"].join("\n"),
  arabicEnabled: false,
  notifyEmail: "info@egyptgasfittings.com",
};

// key, group, label, textEn, multiline
const contentBlocks = [
  ["hero.eyebrow", "hero", "Hero eyebrow line", "Connecting a safer tomorrow", false],
  ["hero.title", "hero", "Hero headline", "Precision fittings for gas connections", false],
  ["hero.subtitle", "hero", "Hero subtitle", "Manufacturing high-quality gas fittings and accessories according to British standards.", true],
  [
    "about.history.1",
    "about",
    "History paragraph 1",
    "Established in 2005, EGF is one of Egypt's leading manufacturers of natural gas fittings and components used in residential gas connections. Located in Badr Industrial Zone, the company has built extensive experience and manufacturing capabilities in the natural gas sector.",
    true,
  ],
  [
    "about.history.2",
    "about",
    "History paragraph 2",
    "EGF works with major gas companies across Egypt and is committed to maintaining high standards of quality, safety, and reliability. Our products are manufactured in accordance with applicable international standards and specifications and undergo rigorous testing and quality control.",
    true,
  ],
  [
    "about.history.3",
    "about",
    "History paragraph 3",
    "The company holds ISO 9001 certification and a number of industry approvals and certifications, reflecting its commitment to quality and continuous improvement. EGF also serves international markets through the export of selected products outside Egypt.",
    true,
  ],
  [
    "about.vision",
    "about",
    "Vision statement",
    "To be the most trusted Egyptian manufacturer of gas fittings and accessories, recognised by distributors, gas companies, and installers across Egypt and the region for products that are safe, precise, and built to last.",
    true,
  ],
  [
    "about.mission",
    "about",
    "Mission statement",
    "We manufacture and export gas fittings and accessories, produced according to British standards and backed by rigorous quality control and continuous investment in modern production technology, supplying Egypt's natural gas distribution companies, and export markets abroad, with fittings they can depend on.",
    true,
  ],
  ["about.chairman.name", "about", "Chairman name", "Eng. Saleh Saeed", false],
  ["about.chairman.title", "about", "Chairman title", "Chairman", false],
  ["about.ceo.name", "about", "CEO name", "Eng. Mohamed Saleh Saeed", false],
  ["about.ceo.title", "about", "CEO title", "CEO", false],
  [
    "capabilities.intro",
    "capabilities",
    "Capabilities introduction",
    "EGF's production floor pairs computer-controlled machining with dedicated welding and hose-forming lines: the precision and repeatability that gas fittings demand. Equipment is treated as an ongoing investment, upgraded to keep pace with quality and export requirements.",
    true,
  ],
  ["capabilities.capacity", "capabilities", "Production capacity statement", "Output exceeds local market demand, with spare capacity for larger and export orders.", true],
  ["capabilities.export", "capabilities", "Export reach statement", "Products exported beyond Egypt, including to the UAE (Sharjah).", true],
  [
    "capabilities.process.intro",
    "capabilities",
    "Manufacturing process introduction",
    "Every fitting we make passes through a single, integrated production floor, from raw material to finished, inspected part, giving EGF full control over quality and lead time at each stage.",
    true,
  ],
  [
    "products.intro",
    "products",
    "Products page introduction",
    "A full range of gas fittings and accessories in brass, stainless steel, and nickel-plated steel, manufactured according to British Standard specifications.",
    true,
  ],
  [
    "quality.intro",
    "quality",
    "Quality page introduction",
    "Quality is built into the production process, not checked in at the end. EGF's certifications and standards compliance are maintained through independent verification and continuous investment in process control.",
    true,
  ],
  ["quality.lab", "quality", "Quality lab description", "A dedicated environment for controlled inspection and performance testing.", true],
  [
    "quality.quote",
    "quality",
    "Quality quote",
    "EGF maintains ongoing contact with scientific and research centers to verify that its products conform to the required standards.",
    true,
  ],
  [
    "clients.intro",
    "clients",
    "Clients page introduction",
    "EGF supplies gas fittings and accessories to Egypt's licensed natural gas distribution companies, and exports to international markets beyond Egypt.",
    true,
  ],
  [
    "clients.tagline",
    "clients",
    "Clients tagline",
    "Trusted distribution and export partners, spanning Egypt's licensed natural gas network and international markets, including the UAE.",
    true,
  ],
  [
    "facility.intro",
    "facility",
    "Facility page introduction",
    "A look inside EGF's facility in the Badr Industrial Zone: from the facility gate and production floor, through raw material and machining, to finishing and packaging for delivery.",
    true,
  ],
  ["contact.intro", "contact", "Contact page introduction", "Talk to our team about products, specifications, distribution supply or export orders.", true],
  ["cta.title", "cta", "Call-to-action headline", "Together for safer homes and stronger communities.", false],
  ["cta.text", "cta", "Call-to-action text", "Thank you for your trust and partnership. Talk to us about your next order.", true],
];

/* ---------------------------------------------------------------------------
   Seeding (create-if-missing only)
   --------------------------------------------------------------------------- */

async function seedAdmin() {
  const count = await prisma.adminUser.count();
  if (count > 0) return;
  const email = (process.env.ADMIN_EMAIL || "admin@egyptgasfittings.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "EGF Administrator";
  await prisma.adminUser.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Created admin user ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD not set, using the default password. Change it in Settings after signing in.");
  }
}

async function seedSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return;
  await prisma.siteSettings.create({ data: settings });
  console.log("Created site settings");
}

async function seedCategories() {
  let created = 0;
  for (const c of categories) {
    const exists = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (exists) continue;
    await prisma.category.create({ data: c });
    created++;
  }
  console.log(`Categories: ${created} created`);
}

async function seedProducts() {
  let created = 0;
  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    const { category, ...data } = p;
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    await prisma.product.create({ data: { ...data, categoryId: cat?.id ?? null, published: true } });
    created++;
  }
  console.log(`Products: ${created} created`);
}

async function seedClients() {
  const count = await prisma.client.count();
  if (count > 0) return console.log("Clients: already present, skipped");
  await prisma.client.createMany({ data: clients.map((c) => ({ ...c, published: true })) });
  console.log(`Clients: ${clients.length} created`);
}

async function seedFacility() {
  const count = await prisma.facilityPhoto.count();
  if (count > 0) return console.log("Facility photos: already present, skipped");
  await prisma.facilityPhoto.createMany({ data: facilityPhotos.map((p) => ({ ...p, published: true })) });
  console.log(`Facility photos: ${facilityPhotos.length} created`);
}

async function seedCertifications() {
  const count = await prisma.certification.count();
  if (count > 0) return console.log("Certifications: already present, skipped");
  await prisma.certification.createMany({ data: certifications.map((c) => ({ ...c, published: true })) });
  console.log(`Certifications: ${certifications.length} created`);
}

async function seedContent() {
  let created = 0;
  for (const [index, [key, group, label, textEn, multiline]] of contentBlocks.entries()) {
    const exists = await prisma.contentBlock.findUnique({ where: { key } });
    if (exists) continue;
    await prisma.contentBlock.create({ data: { key, group, label, textEn, multiline, sortOrder: index } });
    created++;
  }
  console.log(`Content blocks: ${created} created`);
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedCategories();
  await seedProducts();
  await seedClients();
  await seedFacility();
  await seedCertifications();
  await seedContent();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
