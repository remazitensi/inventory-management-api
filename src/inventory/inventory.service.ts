import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateInventoryDto } from '@inventory/dto/create-inventory.dto';
import { QueryInventoryDto } from '@inventory/dto/query-inventory.dto';
import {
  Inventory,
  InventoryTransactionType,
} from '@inventory/entities/inventory.entity';
import { InventoryRepository } from '@inventory/inventory.repository';

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private inventoryRepository: InventoryRepository,
  ) {}

  async createTransaction(
    createInventoryDto: CreateInventoryDto,
  ): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 출고의 경우 재고 확인
      if (createInventoryDto.transactionType === InventoryTransactionType.OUT) {
        const currentBalance =
          await this.inventoryRepository.getInventoryBalance(
            createInventoryDto.productCode,
            createInventoryDto.lotNumber,
            createInventoryDto.expirationDate
              ? new Date(createInventoryDto.expirationDate)
              : undefined,
          );

        if (currentBalance < createInventoryDto.quantity) {
          throw new BadRequestException(
            `재고가 부족합니다. 현재 재고: ${currentBalance}, 요청 수량: ${createInventoryDto.quantity}`,
          );
        }
      }

      // 재고 거래 생성
      const inventory = new Inventory();
      inventory.productCode = createInventoryDto.productCode;
      inventory.transactionQuantity = createInventoryDto.quantity;
      inventory.transactionType = createInventoryDto.transactionType;
      inventory.expirationDate = createInventoryDto.expirationDate
        ? new Date(createInventoryDto.expirationDate)
        : null;
      inventory.lotNumber = createInventoryDto.lotNumber || null;
      inventory.notes = createInventoryDto.notes || null;

      // 현재 재고 수량 계산 및 설정
      const newBalance = await this.inventoryRepository.getInventoryBalance(
        createInventoryDto.productCode,
        createInventoryDto.lotNumber,
        inventory.expirationDate,
      );

      if (createInventoryDto.transactionType === InventoryTransactionType.IN) {
        inventory.quantity = newBalance + createInventoryDto.quantity;
      } else {
        inventory.quantity = newBalance - createInventoryDto.quantity;
      }

      const savedInventory = await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();
      return savedInventory;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryDto: QueryInventoryDto) {
    return await this.inventoryRepository.findWithPagination(queryDto);
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new NotFoundException(`재고 정보를 찾을 수 없습니다. ID: ${id}`);
    }
    return inventory;
  }

  async getInventoryBalance(
    productCode: string,
    lotNumber?: string,
    expirationDate?: string,
  ) {
    const expDate = expirationDate ? new Date(expirationDate) : undefined;
    const balance = await this.inventoryRepository.getInventoryBalance(
      productCode,
      lotNumber,
      expDate,
    );

    return {
      productCode,
      lotNumber: lotNumber || null,
      expirationDate: expDate || null,
      currentQuantity: balance,
    };
  }

  async getInventoryBalances(productCode: string) {
    const balances =
      await this.inventoryRepository.getInventoryBalances(productCode);

    return {
      productCode,
      balances: balances.map((balance) => ({
        lotNumber: balance.lotNumber,
        expirationDate: balance.expirationDate,
        currentQuantity: balance.totalQuantity,
      })),
      totalQuantity: balances.reduce(
        (sum, balance) => sum + balance.totalQuantity,
        0,
      ),
    };
  }

  async getExpiringSoon(days: number = 30) {
    const expiringItems = await this.inventoryRepository.findExpiringSoon(days);

    return {
      threshold: days,
      items: expiringItems.map((item) => ({
        productCode: item.productCode,
        lotNumber: item.lotNumber,
        expirationDate: item.expirationDate,
        currentQuantity: item.totalQuantity,
        daysUntilExpiration: item.expirationDate
          ? Math.ceil(
              (item.expirationDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null,
      })),
    };
  }

  async adjustInventory(
    productCode: string,
    adjustQuantity: number,
    lotNumber?: string,
    expirationDate?: string,
    notes?: string,
  ): Promise<Inventory> {
    if (adjustQuantity === 0) {
      throw new BadRequestException('조정 수량이 0입니다.');
    }

    const transactionType =
      adjustQuantity > 0
        ? InventoryTransactionType.IN
        : InventoryTransactionType.OUT;

    const createDto: CreateInventoryDto = {
      productCode,
      quantity: Math.abs(adjustQuantity),
      transactionType,
      expirationDate,
      lotNumber,
      notes:
        notes || `재고 조정: ${adjustQuantity > 0 ? '+' : ''}${adjustQuantity}`,
    };

    return await this.createTransaction(createDto);
  }
}
