// Configuration utility for backend URLs
export const getBackendUrl = (): string => {
  // Check for environment variable first
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  
  // Fallback to default development URL
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }
  
  // Fallback for production (you can change this to your production URL)
  return 'http://localhost:8080';
};

// Helper function to build track URLs
export const buildTrackUrl = (trackUrl: string): string => {
  return `${getBackendUrl()}/tracks/${trackUrl}`;
};

// Helper function to build image URLs
export const buildImageUrl = (imageUrl: string): string => {
  return `${getBackendUrl()}/images/${imageUrl}`;
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${getBackendUrl()}/api/v1/${endpoint}`;
};
