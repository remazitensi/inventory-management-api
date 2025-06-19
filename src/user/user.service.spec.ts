import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from '@user/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Repository 함수들에 대한 Mock 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;

  // 테스트용 가짜 유저 데이터
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Repository 함수들에 대한 jest mock 구현
    const repositoryMock: MockRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useValue: repositoryMock,
        },
      ],
    })
      // @InjectRepository 데코레이터 매핑용
      .overrideProvider('UserRepository')
      .useValue(repositoryMock)
      .compile();

    userService = module.get<UserService>(UserService);
    userRepository = repositoryMock;

    // bcrypt 해시 함수 mock (입력값 앞에 'hashed-' 붙임)
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(async (pass) => `hashed-${pass}`);
    // bcrypt 비교 함수 mock (특정 조건에서 true 리턴)
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(
        async (plain, hashed) => plain === 'valid' && hashed === 'hashed-valid',
      );
  });

  describe('create', () => {
    it('새로운 유저를 생성한다', async () => {
      userRepository.findOneBy!.mockResolvedValue(null); // 기존 유저 없음
      userRepository.create!.mockImplementation((dto) => dto); // create 함수는 입력 그대로 반환
      userRepository.save!.mockResolvedValue(mockUser); // save는 mockUser 반환

      const dto = { email: 'new@test.com', password: 'valid' };
      const result = await userService.create(dto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: dto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: `hashed-${dto.password}`,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('중복 이메일일 경우 ConflictException 예외를 던진다', async () => {
      userRepository.findOneBy!.mockResolvedValue(mockUser); // 기존 유저 존재

      const dto = { email: 'test@example.com', password: 'any' };

      await expect(userService.create(dto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: dto.email,
      });
    });
  });

  describe('findByEmail', () => {
    it('이메일로 유저를 찾으면 반환한다', async () => {
      userRepository.findOneBy!.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('test@example.com');
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('유저가 없으면 null을 반환한다', async () => {
      userRepository.findOneBy!.mockResolvedValue(null);

      const result = await userService.findByEmail('notfound@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('ID로 유저를 찾으면 반환한다', async () => {
      userRepository.findOneBy!.mockResolvedValue(mockUser);

      const result = await userService.findById(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it('유저가 없으면 null을 반환한다', async () => {
      userRepository.findOneBy!.mockResolvedValue(null);

      const result = await userService.findById(99);
      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('비밀번호가 일치하면 true를 반환한다', async () => {
      const result = await userService.validatePassword(
        'valid',
        'hashed-valid',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('valid', 'hashed-valid');
      expect(result).toBe(true);
    });

    it('비밀번호가 일치하지 않으면 false를 반환한다', async () => {
      const result = await userService.validatePassword(
        'invalid',
        'hashed-valid',
      );
      expect(result).toBe(false);
    });
  });
});
