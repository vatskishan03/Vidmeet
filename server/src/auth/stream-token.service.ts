import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamClient } from '@stream-io/node-sdk';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class StreamTokenService {
  private streamClient: StreamClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('streamApiKey');
    const apiSecret = this.configService.get<string>('streamApiSecret');
    
    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials are missing');
    }
    
    this.streamClient = new StreamClient(apiKey, apiSecret);
  }

  async generateToken(userId: string): Promise<string> {
    // Validate user exists in Clerk
    try {
      await clerkClient.users.getUser(userId);
    } catch (error) {
      throw new Error('User not authenticated');
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    
    return this.streamClient.createToken(userId, expirationTime, issuedAt);
  }
}