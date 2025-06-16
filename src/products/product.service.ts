import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '@products/dto/product.dto';
import { Product } from '@products/entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const exists = await this.productRepository.findOne({
      where: { code: dto.code },
    });

    if (exists) {
      throw new ConflictException('제품 코드가 이미 존재합니다.');
    }

    const product = this.productRepository.create({
      ...dto,
      unit: dto.unit ?? '개',
      isActive: true,
    });

    return await this.productRepository.save(product);
  }

  async findAllProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async getActiveProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isActive: true },
    });
  }

  async findProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }

    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findProductById(id);

    if (dto.code && dto.code !== product.code) {
      const exists = await this.productRepository.findOne({
        where: { code: dto.code },
      });

      if (exists) {
        throw new ConflictException('제품 코드가 이미 존재합니다.');
      }
    }

    Object.assign(product, dto);
    product.updatedAt = new Date();

    return await this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.findProductById(id);
    product.isActive = false;
    product.updatedAt = new Date();
    await this.productRepository.save(product);
  }
}
