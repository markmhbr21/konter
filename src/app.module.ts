import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';
import { ProductsModule } from './products/products.module';
import { StocksModule } from './stocks/stocks.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // Menggunakan fallback: Cek variabel Railway dulu, kalau tidak ada pakai variabel lokal
      host: process.env.MYSQLHOST || process.env.DB_HOST, 
      port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
      username: process.env.MYSQLUSER || process.env.DB_USER,
      password: process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Akan otomatis membuat tabel di Railway saat deploy berhasil
    }),
    AuthModule,
    UsersModule,
    BranchesModule,
    ProductsModule,
    StocksModule,
    TransactionsModule,
    ReportsModule,
    SettingsModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}