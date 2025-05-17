'use server';

import { cookies } from 'next/headers';

export const tokenProvider = async () => {
  const authToken = cookies().get('__session')?.value;
  
  if (!authToken) throw new Error('User is not authenticated');
  
  const response = await fetch('http://localhost:3001/auth/token', {
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
