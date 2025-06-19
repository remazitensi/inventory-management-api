import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { LoginDto } from 'auth/dto/login.dto';
import { User } from '@user/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  // 테스트용 가짜 유저 데이터
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // 테스트 모듈 생성 및 목 객체 주입
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('회원가입 후 토큰과 유저 정보를 반환한다', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: '1234',
      };
      userService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('test-token');

      const result = await authService.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'test-token',
        user: expect.any(Object),
      });
    });

    it('회원가입 중 에러가 발생하면 ConflictException을 던진다', async () => {
      userService.create.mockRejectedValue(new Error('예상치 못한 에러'));

      await expect(
        authService.register({ email: 'a', password: 'b' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('로그인 후 토큰과 유저 정보를 반환한다', async () => {
      const dto: LoginDto = { email: mockUser.email, password: '1234' };
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await authService.login(dto);

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toBeDefined();
    });

    it('유저가 없으면 UnauthorizedException을 던진다', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'x', password: 'y' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 틀리면 UnauthorizedException을 던진다', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'x', password: 'y' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('이메일과 비밀번호가 맞으면 유저를 반환한다', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      const result = await authService.validateUser(mockUser.email, 'pass');

      expect(result).toEqual(mockUser);
    });

    it('이메일이 없으면 null을 반환한다', async () => {
      userService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser('nope', 'pass');

      expect(result).toBeNull();
    });

    it('비밀번호가 틀리면 null을 반환한다', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      const result = await authService.validateUser(mockUser.email, 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('validateUserById', () => {
    it('유저 ID로 유저를 찾아 반환한다', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await authService.validateUserById(1);

      expect(result).toEqual(mockUser);
    });
  });
});
