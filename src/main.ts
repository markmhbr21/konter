import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the web app can communicate with it
  app.enableCors();

  // Bind to 0.0.0.0 so physical devices on the same network can access it
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

// Trigger restart
