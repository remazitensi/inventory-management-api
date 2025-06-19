import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

let isDataSourceAdded = false;

export const TypeOrmOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: Number(configService.get<number>('DB_PORT')),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
  }),
  async dataSourceFactory(options) {
    if (!options) throw new Error('Invalid TypeORM options');

    const dataSource = new DataSource(options);

    if (!isDataSourceAdded) {
      addTransactionalDataSource(dataSource);
      isDataSourceAdded = true;
    }

    return dataSource;
  },
};
