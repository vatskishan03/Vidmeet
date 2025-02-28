// providers/StreamClientProvider.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@auth0/nextjs-auth0/client';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading || !user) return;
    
    try {
     
      const client = new StreamVideoClient({
        apiKey: API_KEY,
        user: {
          id: user.sub!, 
          name: user.name || user.email || 'Anonymous User',
          image: user.picture || undefined,
        },
        tokenProvider: async () => {
          try {
            const response = await fetch('http://localhost:4000/api/stream/token', {
              headers: {
                Authorization: `Bearer ${user.sub}`,
              },
              credentials: 'include',
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch token: ${response.status}`);
            }
            
            const data = await response.json();
            return data.token;
          } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
          }
        },
      });

      setVideoClient(client);

      // Cleanup function
      return () => {
        client.disconnectUser();
        setVideoClient(null);
      };
    } catch (error) {
      console.error('Error initializing Stream client:', error);
    }
  }, [user, isLoading]);

  if (isLoading || !videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;