import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Jothi Traders database...');

  // ── Admin User ─────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jothitraders.com' },
    update: {},
    create: {
      email: 'admin@jothitraders.com',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'Jothi',
      role: 'ADMIN',
    },
  });
  console.log('Admin user:', admin.email);

  // ── Sequence Counters ──────────────────────────────────────────────────────
  for (const name of ['RFQ', 'QUO', 'ORD', 'PO', 'INV']) {
    await prisma.sequenceCounter.upsert({
      where: { name },
      update: {},
      create: { name, current: 0 },
    });
  }

  // ── Warehouse ──────────────────────────────────────────────────────────────
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      code: 'WH-MAIN',
      address: { street: '1 Market Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India' },
    },
  });
  console.log('Warehouse:', warehouse.name);

  // ── Categories ─────────────────────────────────────────────────────────────
  const catElectrical = await prisma.category.upsert({
    where: { slug: 'electrical' },
    update: {},
    create: { name: 'Electrical', slug: 'electrical', description: 'Electrical components and equipment', sortOrder: 1 },
  });

  const catLighting = await prisma.category.upsert({
    where: { slug: 'lighting' },
    update: {},
    create: { name: 'Lighting', slug: 'lighting', parentId: catElectrical.id, sortOrder: 1 },
  });

  const catFood = await prisma.category.upsert({
    where: { slug: 'food' },
    update: {},
    create: { name: 'Food & Beverages', slug: 'food', description: 'Packaged food and beverages', sortOrder: 2 },
  });

  const catChemicals = await prisma.category.upsert({
    where: { slug: 'chemicals' },
    update: {},
    create: { name: 'Chemicals', slug: 'chemicals', description: 'Industrial chemicals', sortOrder: 3 },
  });

  // ── Attribute Groups & Definitions for Lighting ───────────────────────────
  const lightGroup = await prisma.attributeGroup.upsert({
    where: { id: 'ag-lighting' },
    update: {},
    create: {
      id: 'ag-lighting',
      name: 'Technical Specifications',
      categoryId: catLighting.id,
      sortOrder: 1,
    },
  });

  for (const attr of [
    { name: 'Wattage', slug: 'wattage', type: 'NUMBER' as const, unit: 'W', isRequired: true, isFilterable: true },
    { name: 'Colour Temperature', slug: 'colour-temp', type: 'SELECT' as const, options: ['2700K Warm White', '4000K Cool White', '6500K Daylight'], isRequired: true, isFilterable: true },
    { name: 'Base Type', slug: 'base-type', type: 'SELECT' as const, options: ['B22', 'E27', 'E14', 'GU10'], isRequired: true, isFilterable: true },
    { name: 'Lumens', slug: 'lumens', type: 'NUMBER' as const, unit: 'lm', isFilterable: true },
  ]) {
    await prisma.attributeDefinition.upsert({
      where: { groupId_slug: { groupId: lightGroup.id, slug: attr.slug } },
      update: {},
      create: { ...attr, groupId: lightGroup.id },
    });
  }

  // ── Sample Product ─────────────────────────────────────────────────────────
  const ledBulb = await prisma.product.upsert({
    where: { slug: 'led-bulb-9w' },
    update: {},
    create: {
      name: 'LED Bulb 9W',
      slug: 'led-bulb-9w',
      description: 'Energy-efficient LED bulb with long lifespan',
      categoryId: catLighting.id,
    },
  });

  const variant = await prisma.productVariant.upsert({
    where: { sku: 'LED-9W-WW-B22' },
    update: {},
    create: {
      productId: ledBulb.id,
      sku: 'LED-9W-WW-B22',
      name: '9W Warm White B22',
    },
  });

  // Add inventory
  await prisma.inventoryItem.upsert({
    where: { variantId_warehouseId: { variantId: variant.id, warehouseId: warehouse.id } },
    update: {},
    create: {
      variantId: variant.id,
      warehouseId: warehouse.id,
      qtyOnHand: 500,
      reorderLevel: 50,
    },
  });

  // ── Sample Supplier ────────────────────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { email: 'supply@lighttech.in' },
    update: {},
    create: {
      companyName: 'LightTech Industries',
      contactName: 'Raj Kumar',
      email: 'supply@lighttech.in',
      phone: '+91 98765 43210',
      gstNumber: '29AABCT1332L1ZK',
      address: { street: '5 Industrial Area', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', country: 'India' },
    },
  });

  await prisma.supplierProduct.upsert({
    where: { supplierId_variantId: { supplierId: supplier.id, variantId: variant.id } },
    update: {},
    create: {
      supplierId: supplier.id,
      variantId: variant.id,
      basePrice: 45.00,
      minOrderQty: 100,
      leadTimeDays: 7,
    },
  });

  // ── Sample Customer ────────────────────────────────────────────────────────
  await prisma.customer.upsert({
    where: { email: 'purchase@tvsmotors.com' },
    update: {},
    create: {
      companyName: 'TVS Electricals Ltd',
      contactName: 'Priya Sharma',
      email: 'purchase@tvsmotors.com',
      phone: '+91 99887 76655',
      gstNumber: '33AAACT1234F1Z5',
      creditLimit: 500000,
      creditTerms: 30,
      address: { street: '12 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', country: 'India' },
    },
  });

  console.log('Seed complete!');
  console.log('Login: admin@jothitraders.com / Admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
