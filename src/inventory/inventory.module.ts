import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from '@inventory/inventory.controller';
import { InventoryService } from '@inventory/inventory.service';
import { InventoryRepository } from '@inventory/inventory.repository';
import { Inventory } from '@inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
