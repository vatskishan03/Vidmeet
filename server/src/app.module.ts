import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TranscriptionModule } from './transcription/transcription.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [AuthModule, TranscriptionModule, SummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
