// Utility to test backend connectivity
export const testBackendConnection = async (): Promise<{ success: boolean; url: string; error?: string }> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return { success: true, url: backendUrl };
    } else {
      return { 
        success: false, 
        url: backendUrl, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      url: backendUrl, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Log backend configuration for debugging
export const logBackendConfig = (): void => {
  
};
