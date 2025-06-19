import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Repository } from 'typeorm';
import { Product } from '@products/entities/product.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: MockRepository<Product>;

  const mockProduct: Product = {
    id: 1,
    code: 'P001',
    name: '테스트 제품',
    unit: '개',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const repositoryMock: MockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'ProductRepository',
          useValue: repositoryMock,
        },
      ],
    })
      .overrideProvider('ProductRepository')
      .useValue(repositoryMock)
      .compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = repositoryMock;
  });

  describe('createProduct', () => {
    it('새 제품을 생성한다', async () => {
      productRepository.findOne!.mockResolvedValue(null); // 기존 코드 없음
      productRepository.create!.mockImplementation((dto) => dto);
      productRepository.save!.mockResolvedValue(mockProduct);

      const dto = { code: 'P001', name: '테스트 제품', unit: '개' };
      const result = await productService.createProduct(dto);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { code: dto.code },
      });
      expect(productRepository.create).toHaveBeenCalledWith({
        ...dto,
        unit: '개',
        isActive: true,
      });
      expect(productRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('중복된 제품 코드가 있으면 ConflictException을 던진다', async () => {
      productRepository.findOne!.mockResolvedValue(mockProduct);

      const dto = { code: 'P001', name: '새 제품' };

      await expect(productService.createProduct(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { code: dto.code },
      });
    });
  });

  describe('findAllProducts', () => {
    it('모든 제품 목록을 반환한다', async () => {
      productRepository.find!.mockResolvedValue([mockProduct]);

      const result = await productService.findAllProducts();

      expect(productRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getActiveProducts', () => {
    it('활성화된 제품 목록을 반환한다', async () => {
      productRepository.find!.mockResolvedValue([mockProduct]);

      const result = await productService.getActiveProducts();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findProductById', () => {
    it('ID로 제품을 찾으면 반환한다', async () => {
      productRepository.findOne!.mockResolvedValue(mockProduct);

      const result = await productService.findProductById(1);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProduct);
    });

    it('제품이 없으면 NotFoundException을 던진다', async () => {
      productRepository.findOne!.mockResolvedValue(null);

      await expect(productService.findProductById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProduct', () => {
    it('제품 정보를 수정한다', async () => {
      const updateDto = { name: '수정된 제품명', code: 'P002' };

      productRepository
        .findOne!.mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(null);

      productRepository.save!.mockImplementation((product) =>
        Promise.resolve(product),
      );

      const result = await productService.updateProduct(1, updateDto);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { code: updateDto.code },
      });
      expect(result.name).toBe(updateDto.name);
    });

    it('수정 시 코드가 중복되면 ConflictException을 던진다', async () => {
      const updateDto = { code: 'P002' };

      const existingProduct = {
        ...mockProduct,
        id: 1,
        code: 'P001',
      };

      const conflictingProduct = {
        ...mockProduct,
        id: 2,
        code: 'P002',
      };

      productRepository.findOne = jest
        .fn()
        // 첫 번째: ID로 기존 제품 조회
        .mockResolvedValueOnce(existingProduct)
        // 두 번째: 코드로 다른 제품 조회 (중복 발생)
        .mockResolvedValueOnce(conflictingProduct);

      await expect(productService.updateProduct(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('제품을 비활성화 처리한다', async () => {
      productRepository.findOne!.mockResolvedValue(mockProduct);
      productRepository.save!.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await productService.deleteProduct(1);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        }),
      );
    });

    it('제품이 없으면 NotFoundException을 던진다', async () => {
      productRepository.findOne!.mockResolvedValue(null);

      await expect(productService.deleteProduct(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
