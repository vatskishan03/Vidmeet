import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TranscriptionModule } from './transcription/transcription.module';
import { SummaryModule } from './summary/summary.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    AuthModule,
    TranscriptionModule,
    SummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}