import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow your Next.js frontend to hit the API
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://video-three-sepia.vercel.app/', 
      process.env.FRONTEND_URL // Add this for flexibility
    ].filter(Boolean), // Remove undefined values
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