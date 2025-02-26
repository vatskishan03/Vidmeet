'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@auth0/nextjs-auth0/client';
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading || !user) return;
    
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.sub!, // Auth0 uses 'sub' as user ID
        name: user.name || user.email,
        image: user.picture,
      },
      token: async () => {
        const response = await fetch('http://localhost:4000/api/stream/token', {
          headers: {
            Authorization: `Bearer ${user.sub}`,
          },
          credentials: 'include',
        });
        const data = await response.json();
        return data.token;
      },
    });

    setVideoClient(client);
  }, [user, isLoading]);

  if (isLoading || !videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;