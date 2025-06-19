import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@user/(.*)$': '<rootDir>/src/user/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@products/(.*)$': '<rootDir>/src/products/$1',
    '^@inventory/(.*)$': '<rootDir>/src/inventory/$1',
  },
};

export default config;
