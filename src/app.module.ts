import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from '@config/database.config';
import { UserModule } from '@user/user.module';
import { ProductModule } from '@products/product.module';
import { InventoryModule } from '@inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    ProductModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
