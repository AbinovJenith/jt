import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuditModule } from './common/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ProductsModule } from './modules/products/products.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RFQModule } from './modules/rfq/rfq.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditAdminModule } from './modules/audit/audit.module';
import { PortalModule } from './modules/portal/portal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuditModule,   // @Global — AuditService available everywhere
    AuthModule,
    UsersModule,
    CategoriesModule,
    AttributesModule,
    ProductsModule,
    SuppliersModule,
    CustomersModule,
    InventoryModule,
    RFQModule,
    QuotationsModule,
    OrdersModule,
    PurchaseOrdersModule,
    InvoicesModule,
    PaymentsModule,
    ShipmentsModule,
    UploadModule,
    DashboardModule,
    ReportsModule,
    AuditAdminModule,
    PortalModule,
  ],
})
export class AppModule {}
