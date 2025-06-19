// 1. 트랜잭션 관련 모듈을 Jest로 모킹해서 트랜잭션 데코레이터 무력화
jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      // 데코레이터 무력화: 아무 동작 안 함
    },
  initializeTransactionalContext: jest.fn(),
  getTransactionalContext: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { Repository } from 'typeorm';
import {
  Inventory,
  InventoryTransactionType,
} from './entities/inventory.entity';
import { InventoryBalance } from './entities/inventoryBalance.entitiy';
import { Product } from '@products/entities/product.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryBalanceQueryDto } from '@inventory/dto/inventory-query.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepo: MockRepository<Inventory>;
  let balanceRepo: MockRepository<InventoryBalance>;
  let productRepo: MockRepository<Product>;

  const mockProduct: Product = {
    id: 1,
    code: 'P001',
    name: '테스트 제품',
    unit: '개',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInventoryBalance: InventoryBalance = {
    id: 1,
    productCode: 'P001',
    lotNumber: 'LOT123',
    expirationDate: new Date('2025-12-31'),
    quantity: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const mockInventory: Inventory = {
    id: 1,
    productId: mockProduct.id,
    lotNumber: 'LOT123',
    expirationDate: new Date('2025-12-31'),
    transactionType: InventoryTransactionType.IN,
    transactionQuantity: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: mockProduct,
    quantity: 10,
  };

  beforeEach(async () => {
    const inventoryRepositoryMock: MockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    const balanceRepositoryMock: MockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
    };

    const productRepositoryMock: MockRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: inventoryRepositoryMock,
        },
        {
          provide: getRepositoryToken(InventoryBalance),
          useValue: balanceRepositoryMock,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepo = module.get(getRepositoryToken(Inventory));
    balanceRepo = module.get(getRepositoryToken(InventoryBalance));
    productRepo = module.get(getRepositoryToken(Product));
  });

  describe('createTransaction', () => {
    it('입고 트랜잭션 생성 - 신규 balance 생성 및 저장', async () => {
      const dto = {
        productCode: 'P001',
        quantity: 5,
        lotNumber: 'LOT123',
        expirationDate: '2025-12-31',
        type: 'IN',
      };

      productRepo.findOne!.mockResolvedValue(mockProduct);
      balanceRepo.findOne!.mockResolvedValue(null);
      balanceRepo.create!.mockImplementation((data) => ({
        ...data,
        quantity: 0,
      }));
      balanceRepo.save!.mockImplementation((data) =>
        Promise.resolve({ ...data, quantity: 5 }),
      );

      inventoryRepo.create!.mockImplementation((data) => data);
      inventoryRepo.save!.mockResolvedValue(mockInventory);

      const result = await service.createTransaction(dto as any);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { code: dto.productCode },
      });
      expect(balanceRepo.findOne).toHaveBeenCalled();
      expect(balanceRepo.save).toHaveBeenCalled();
      expect(inventoryRepo.create).toHaveBeenCalled();
      expect(inventoryRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockInventory);
    });

    it('출고 시 재고 부족하면 예외 발생', async () => {
      const dto = {
        productCode: 'P001',
        quantity: 10,
        lotNumber: 'LOT123',
        expirationDate: '2025-12-31',
        type: 'OUT',
      };

      productRepo.findOne!.mockResolvedValue(mockProduct);
      balanceRepo.findOne!.mockResolvedValue({
        ...mockInventoryBalance,
        quantity: 5,
      });

      await expect(service.createTransaction(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('수량이 0이하이면 예외 발생', async () => {
      const dto = {
        productCode: 'P001',
        quantity: 0,
        lotNumber: 'LOT123',
        expirationDate: '2025-12-31',
        type: 'IN',
      };

      await expect(service.createTransaction(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('제품이 없으면 예외 발생', async () => {
      const dto = {
        productCode: 'INVALID',
        quantity: 5,
        lotNumber: 'LOT123',
        expirationDate: '2025-12-31',
        type: 'IN',
      };

      productRepo.findOne!.mockResolvedValue(null);

      await expect(service.createTransaction(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllWithPagination', () => {
    it('보유 재고 페이징 조회 반환', async () => {
      const query: InventoryBalanceQueryDto = {
        productCode: 'P001',
        lotNumber: 'LOT123',
        expirationDateFrom: '2025-01-01',
        expirationDateTo: '2025-12-31',
        page: 1,
        limit: 10,
      };

      balanceRepo.findAndCount!.mockResolvedValue([[mockInventoryBalance], 1]);

      const result = await service.findAllWithPagination(query);

      expect(balanceRepo.findAndCount).toHaveBeenCalled();
      expect(result.items).toEqual([mockInventoryBalance]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('재고 거래 조회 성공', async () => {
      inventoryRepo.findOneBy!.mockResolvedValue(mockInventory);

      const result = await service.findOne(1);

      expect(inventoryRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockInventory);
    });

    it('재고 거래 없으면 NotFoundException 발생', async () => {
      inventoryRepo.findOneBy!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInventoryBalance', () => {
    it('특정 제품 재고 상태 조회 - 필터 포함', async () => {
      balanceRepo.find!.mockResolvedValue([mockInventoryBalance]);

      const result = await service.getInventoryBalance(
        'P001',
        'LOT123',
        '2025-01-01',
        '2025-12-31',
      );

      expect(balanceRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockInventoryBalance]);
    });
  });

  describe('getInventoryBalances', () => {
    it('특정 제품 모든 재고 상태 조회', async () => {
      balanceRepo.find!.mockResolvedValue([mockInventoryBalance]);

      const result = await service.getInventoryBalances('P001');

      expect(balanceRepo.find).toHaveBeenCalledWith({
        where: { productCode: 'P001' },
        order: { expirationDate: 'ASC' },
      });
      expect(result).toEqual([mockInventoryBalance]);
    });
  });

  describe('getExpiringSoon', () => {
    it('유통기한 임박 재고 조회', async () => {
      balanceRepo.find!.mockResolvedValue([mockInventoryBalance]);

      const days = 30;

      const result = await service.getExpiringSoon(days);

      expect(balanceRepo.find).toHaveBeenCalledWith({
        where: {
          expirationDate: expect.any(Object),
          quantity: expect.any(Object),
        },
        order: { expirationDate: 'ASC' },
      });

      expect(result).toEqual([mockInventoryBalance]);
    });
  });
});
