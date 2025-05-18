import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { StreamTokenService } from './stream-token.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [StreamTokenService],
  exports: [StreamTokenService],
})
export class AuthModule {}