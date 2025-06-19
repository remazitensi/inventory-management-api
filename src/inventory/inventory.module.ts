import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryService } from './inventory.service';
import {
  InventoryController,
  InventoryBalanceController,
} from './inventory.controller';
import { Inventory } from '@inventory/entities/inventory.entity';
import { InventoryBalance } from './entities/inventoryBalance.entitiy';
import { Product } from '@products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryBalance, Product])],
  providers: [InventoryService],
  controllers: [InventoryController, InventoryBalanceController],
  exports: [InventoryService],
})
export class InventoryModule {}
