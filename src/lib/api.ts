// API helper that routes to the correct backend based on environment
// - In Lovable preview: Uses Supabase edge functions
// - On Vercel: Uses /api routes

import { supabase } from "@/integrations/supabase/client";

const isLovablePreview = window.location.hostname.includes('lovableproject.com') || 
                          window.location.hostname.includes('lovable.app');

export async function apiCall<T = any>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  // Clean params
  const cleanParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = String(value);
    }
  });

  if (isLovablePreview) {
    // Map API endpoints to Supabase edge functions
    const functionMap: Record<string, string> = {
      '/api/flights/airports': 'search-airports',
      '/api/flights/cities': 'search-cities',
      '/api/flights/offers': 'search-flights',
      '/api/flights/destinations': 'search-flight-destinations',
      '/api/hotels': 'search-hotels',
      '/api/deals/flights': 'featured-flights',
      '/api/deals/hotels': 'featured-hotels',
    };

    const functionName = functionMap[endpoint];
    if (!functionName) {
      throw new Error(`Unknown API endpoint: ${endpoint}`);
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: cleanParams,
    });

    if (error) {
      throw new Error(error.message || 'API call failed');
    }

    return data as T;
  } else {
    // Vercel: Use /api routes
    const url = new URL(endpoint, window.location.origin);
    Object.entries(cleanParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    const text = await response.text();

    if (!response.ok) {
      let errorMessage = 'API call failed';
      try {
        const errJson = JSON.parse(text);
        errorMessage = errJson.error || errJson.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('Invalid JSON response');
    }
  }
}
