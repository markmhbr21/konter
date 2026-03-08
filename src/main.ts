import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktifkan CORS agar Frontend (React/Vue/Lainnya) bisa akses API ini
  app.enableCors();

  // Aktifkan validasi global untuk DTO
  app.useGlobalPipes(new ValidationPipe());

  // Railway akan memberikan PORT secara otomatis melalui process.env.PORT
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();