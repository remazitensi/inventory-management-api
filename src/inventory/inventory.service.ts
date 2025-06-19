import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { Inventory } from './entities/inventory.entity';
import { InventoryBalance } from '@inventory/entities/inventoryBalance.entitiy';
import { Product } from '@products/entities/product.entity';

import { CreateInventoryDto } from '@inventory/dto/create-inventory.dto';
import { InventoryBalanceQueryDto } from '@inventory/dto/inventory-query.dto';
import { PaginatedInventoryBalanceResponseDto } from '@inventory/dto/paginated-inventory.response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,

    @InjectRepository(InventoryBalance)
    private readonly inventoryBalanceRepo: Repository<InventoryBalance>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /** 재고 입출고 처리 */
  @Transactional()
  async createTransaction(createDto: CreateInventoryDto): Promise<Inventory> {
    const { productCode, quantity, lotNumber, expirationDate, type } =
      createDto;

    if (quantity <= 0) {
      throw new BadRequestException('수량은 0보다 커야 합니다.');
    }

    const product = await this.productRepository.findOne({
      where: { code: productCode },
    });

    if (!product) {
      throw new BadRequestException('해당 제품을 찾을 수 없습니다.');
    }

    let balance = await this.inventoryBalanceRepo.findOne({
      where: {
        productCode,
        lotNumber: lotNumber ?? null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    if (!balance && type === 'OUT') {
      throw new BadRequestException('출고할 재고가 존재하지 않습니다.');
    }

    if (!balance) {
      balance = this.inventoryBalanceRepo.create({
        productCode,
        lotNumber: lotNumber ?? null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        quantity: 0,
      });
    }

    if (type === 'IN') {
      balance.quantity += quantity;
    } else if (type === 'OUT') {
      if (balance.quantity < quantity) {
        throw new BadRequestException('재고가 부족합니다.');
      }
      balance.quantity -= quantity;
    }

    await this.inventoryBalanceRepo.save(balance);

    const transaction = this.inventoryRepo.create({
      productId: product.id,
      lotNumber,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      transactionType: type,
      transactionQuantity: quantity,
    });

    return await this.inventoryRepo.save(transaction);
  }

  /** 보유 재고 페이징 조회 */
  async findAllWithPagination(
    query: InventoryBalanceQueryDto,
  ): Promise<PaginatedInventoryBalanceResponseDto> {
    const {
      productCode,
      lotNumber,
      expirationDateFrom,
      expirationDateTo,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};
    if (productCode) where.productCode = productCode;
    if (lotNumber) where.lotNumber = lotNumber;

    if (expirationDateFrom && expirationDateTo) {
      where.expirationDate = Between(
        new Date(expirationDateFrom),
        new Date(expirationDateTo),
      );
    } else if (expirationDateFrom) {
      where.expirationDate = MoreThanOrEqual(new Date(expirationDateFrom));
    } else if (expirationDateTo) {
      where.expirationDate = LessThanOrEqual(new Date(expirationDateTo));
    }

    const [items, total] = await this.inventoryBalanceRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** 특정 재고 거래 조회 */
  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOneBy({ id });
    if (!inventory) {
      throw new NotFoundException('재고 거래를 찾을 수 없습니다.');
    }
    return inventory;
  }

  /** 특정 제품의 재고 상태(잔량) 조회 - 필터 포함 */
  async getInventoryBalance(
    productCode: string,
    lotNumber?: string,
    expirationDateFrom?: string,
    expirationDateTo?: string,
  ): Promise<InventoryBalance[]> {
    const where: any = { productCode };
    if (lotNumber) where.lotNumber = lotNumber;

    if (expirationDateFrom && expirationDateTo) {
      where.expirationDate = Between(
        new Date(expirationDateFrom),
        new Date(expirationDateTo),
      );
    } else if (expirationDateFrom) {
      where.expirationDate = MoreThanOrEqual(new Date(expirationDateFrom));
    } else if (expirationDateTo) {
      where.expirationDate = LessThanOrEqual(new Date(expirationDateTo));
    }

    return this.inventoryBalanceRepo.find({
      where,
      order: { expirationDate: 'ASC' },
    });
  }

  /** 특정 제품의 전체 재고 상태 조회 (모든 로트/유통기한) */
  async getInventoryBalances(productCode: string): Promise<InventoryBalance[]> {
    return this.inventoryBalanceRepo.find({
      where: { productCode },
      order: { expirationDate: 'ASC' },
    });
  }

  /** 유통기한 임박 재고 조회 */
  async getExpiringSoon(days = 30): Promise<InventoryBalance[]> {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + days);

    return this.inventoryBalanceRepo.find({
      where: {
        expirationDate: Between(now, targetDate),
        quantity: MoreThanOrEqual(1),
      },
      order: { expirationDate: 'ASC' },
    });
  }
}
