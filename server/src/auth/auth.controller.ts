import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { StreamTokenService } from './stream-token.service';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Controller('auth')
export class AuthController {
  constructor(private streamTokenService: StreamTokenService) {}

  @Get('token')
  async getStreamToken(@Headers('authorization') authHeader: string): Promise<{ token: string }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authentication');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the JWT with Clerk
      const sessionClaims = await clerkClient.verifyToken(token);
      const userId = sessionClaims.sub;
      
      const streamToken = await this.streamTokenService.generateToken(userId);
      return { token: streamToken };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}