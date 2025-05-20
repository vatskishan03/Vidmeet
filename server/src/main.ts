import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow your Next.js frontend to hit /transcribe
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  });
  
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  
  await app.listen(port);
  console.log(`NestJS backend running on port ${port}`);
}
bootstrap();