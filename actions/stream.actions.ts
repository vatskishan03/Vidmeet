'use server';

import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/constants';

export const tokenProvider = async () => {
  const authToken = cookies().get('__session')?.value;
  
  if (!authToken) throw new Error('User is not authenticated');
  
  const response = await fetch(`${BACKEND_URL}/auth/token`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get Stream token');
  }
  
  const data = await response.json();
  return data.token;
};
