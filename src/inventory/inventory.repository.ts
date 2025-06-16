import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Inventory,
  InventoryTransactionType,
} from '@inventory/entities/inventory.entity';
import { QueryInventoryDto } from '@inventory/dto/query-inventory.dto';

export interface InventoryBalance {
  productCode: string;
  lotNumber: string | null;
  expirationDate: Date | null;
  totalQuantity: number;
}

@Injectable()
export class InventoryRepository {
  private repository: Repository<Inventory>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Inventory);
  }

  async create(inventory: Partial<Inventory>): Promise<Inventory> {
    const entity = this.repository.create(inventory);
    return await this.repository.save(entity);
  }

  async findById(id: number): Promise<Inventory | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findWithPagination(queryDto: QueryInventoryDto) {
    const queryBuilder = this.repository.createQueryBuilder('inventory');

    // 검색 조건 적용
    if (queryDto.productCode) {
      queryBuilder.andWhere('inventory.productCode LIKE :productCode', {
        productCode: `%${queryDto.productCode}%`,
      });
    }

    if (queryDto.lotNumber) {
      queryBuilder.andWhere('inventory.lotNumber LIKE :lotNumber', {
        lotNumber: `%${queryDto.lotNumber}%`,
      });
    }

    if (queryDto.expirationDateFrom) {
      queryBuilder.andWhere('inventory.expirationDate >= :expirationDateFrom', {
        expirationDateFrom: queryDto.expirationDateFrom,
      });
    }

    if (queryDto.expirationDateTo) {
      queryBuilder.andWhere('inventory.expirationDate <= :expirationDateTo', {
        expirationDateTo: queryDto.expirationDateTo,
      });
    }

    // 정렬
    queryBuilder.orderBy(`inventory.${queryDto.orderBy}`, queryDto.sortOrder);

    // 페이지네이션
    const skip = (queryDto.page - 1) * queryDto.limit;
    queryBuilder.skip(skip).take(queryDto.limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page: queryDto.page,
      limit: queryDto.limit,
      totalPages: Math.ceil(total / queryDto.limit),
    };
  }

  async getInventoryBalance(
    productCode: string,
    lotNumber?: string,
    expirationDate?: Date,
  ): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('inventory');

    queryBuilder
      .select(
        'SUM(CASE WHEN inventory.transactionType = :inType THEN inventory.transactionQuantity ELSE -inventory.transactionQuantity END)',
        'balance',
      )
      .where('inventory.productCode = :productCode', { productCode })
      .setParameter('inType', InventoryTransactionType.IN);

    if (lotNumber) {
      queryBuilder.andWhere('inventory.lotNumber = :lotNumber', { lotNumber });
    }

    if (expirationDate) {
      queryBuilder.andWhere('inventory.expirationDate = :expirationDate', {
        expirationDate,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseInt(result?.balance || '0', 10);
  }

  async getInventoryBalances(productCode: string): Promise<InventoryBalance[]> {
    const queryBuilder = this.repository.createQueryBuilder('inventory');

    const results = await queryBuilder
      .select([
        'inventory.productCode',
        'inventory.lotNumber',
        'inventory.expirationDate',
        'SUM(CASE WHEN inventory.transactionType = :inType THEN inventory.transactionQuantity ELSE -inventory.transactionQuantity END) as totalQuantity',
      ])
      .where('inventory.productCode = :productCode', { productCode })
      .setParameter('inType', InventoryTransactionType.IN)
      .groupBy(
        'inventory.productCode, inventory.lotNumber, inventory.expirationDate',
      )
      .having(
        'SUM(CASE WHEN inventory.transactionType = :inType THEN inventory.transactionQuantity ELSE -inventory.transactionQuantity END) > 0',
      )
      .getRawMany();

    return results.map((result) => ({
      productCode: result.inventory_productCode,
      lotNumber: result.inventory_lotNumber,
      expirationDate: result.inventory_expirationDate,
      totalQuantity: parseInt(result.totalQuantity, 10),
    }));
  }

  async findExpiringSoon(days: number = 30): Promise<InventoryBalance[]> {
    const expirationThreshold = new Date();
    expirationThreshold.setDate(expirationThreshold.getDate() + days);

    const queryBuilder = this.repository.createQueryBuilder('inventory');

    const results = await queryBuilder
      .select([
        'inventory.productCode',
        'inventory.lotNumber',
        'inventory.expirationDate',
        'SUM(CASE WHEN inventory.transactionType = :inType THEN inventory.transactionQuantity ELSE -inventory.transactionQuantity END) as totalQuantity',
      ])
      .where('inventory.expirationDate IS NOT NULL')
      .andWhere('inventory.expirationDate <= :expirationThreshold', {
        expirationThreshold,
      })
      .setParameter('inType', InventoryTransactionType.IN)
      .groupBy(
        'inventory.productCode, inventory.lotNumber, inventory.expirationDate',
      )
      .having(
        'SUM(CASE WHEN inventory.transactionType = :inType THEN inventory.transactionQuantity ELSE -inventory.transactionQuantity END) > 0',
      )
      .orderBy('inventory.expirationDate', 'ASC')
      .getRawMany();

    return results.map((result) => ({
      productCode: result.inventory_productCode,
      lotNumber: result.inventory_lotNumber,
      expirationDate: result.inventory_expirationDate,
      totalQuantity: parseInt(result.totalQuantity, 10),
    }));
  }
}
