import axios from 'axios';

const API_BASE = 'http://localhost:8001'; // Hardcoded for local reliable dev

// Create axios instance with configuration
const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 second timeout for chart calculations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

// Type Definitions
export interface BirthDetails {
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
  latitude: number;  // -90 to 90
  longitude: number; // -180 to 180
  ayanamsa_mode?: string; // e.g. 'LAHIRI', 'SAYANA'
  location_city?: string;
  location_state?: string;
  location_country?: string;
  location_timezone?: string;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  house: number;
  sign: string;
  nakshatra: string;
  nakshatra_lord: string;
  d9_sign?: string;
  d10_sign?: string;
}

export interface House {
  number: number;
  sign: string;
  ascendant_degree?: number;
}

export interface Dasha {
  lord: string;
  balance_years?: number;
  full_duration?: number;
  duration?: number;
  start_date?: string;
  end_date?: string;
}

export interface TithiData {
  name: string;
  number: number;
  paksha: string;
  completion: number;
}

export interface NakshatraData {
  name: string;
  number: number;
  pada: number;
  lord: string;
  completion: number;
}

export interface YogaData {
  name: string;
  number: number;
}

export interface KaranaData {
  name: string;
  number: number;
}

export interface SpecialTime {
  name: string;
  start_time: string;
  end_time: string;
  quality: string;
  description: string;
  start_dt?: string;
  end_dt?: string;
}

export interface Panchanga {
  tithi: TithiData;
  vara: string;
  nakshatra: NakshatraData;
  yoga: YogaData;
  karana: KaranaData;
}

export interface VargaPosition {
  planet: string;
  sign: string;
  house: number;
}

export interface VargaChart {
  name: string;
  planets: VargaPosition[];
  ascendant_sign: string;
}

export interface ChartResponse {
  ascendant: number;
  ascendant_sign: string;
  planets: PlanetPosition[];
  houses: House[];
  dashas: Dasha[];
  panchanga?: Panchanga;
  strengths?: Record<string, number>;
  divisional_charts?: Record<string, VargaChart>;
  special_times?: SpecialTime[];
  ayanamsa?: number;
}

export interface SavedChart {
  id: number;
  name: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  ayanamsa_mode: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  location_timezone?: string;
  created_at: string;
}

/**
 * Calculate birth chart from birth details
 * @param details - Birth date, time, and location
 * @returns Complete birth chart data
 * @throws Error with user-friendly message
 */
export const calculateChart = async (details: BirthDetails): Promise<ChartResponse> => {
  try {
    // Validate input before sending
    if (!details.date) {
      throw new Error('Birth date is required');
    }
    if (details.latitude < -90 || details.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (details.longitude < -180 || details.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const response = await axiosInstance.post<ChartResponse>('/chart', {
      date: details.date,
      time: details.time,
      latitude: details.latitude,
      longitude: details.longitude,
      ayanamsa_mode: details.ayanamsa_mode || 'LAHIRI',
    });

    if (!response.data) {
      throw new Error('Empty response from server');
    }

    console.log('✅ Chart calculated successfully');
    return response.data;
  } catch (error: any) {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'Request timeout - the server is taking too long to respond. Please try again.'
      );
    }

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const detail = error.response.data?.detail;

      if (status === 422) {
        throw new Error(`Invalid input: ${detail || 'Please check your birth details'}`);
      }
      if (status === 500) {
        throw new Error(
          `Server error: ${detail || 'Internal server error. Please try again later.'}`
        );
      }
      if (status === 404) {
        throw new Error('API endpoint not found. Backend may not be running.');
      }

      throw new Error(detail || `Server error (${status})`);
    }

    if (error.request) {
      // Request made but no response
      throw new Error(
        'No response from server. Please check that the backend is running at ' +
        API_BASE
      );
    }

    // Other errors
    throw new Error(error.message || 'Failed to calculate chart');
  }
};

export const getDailyInsight = async (signId: number, date: string): Promise<{ prediction: string }> => {
  const response = await axiosInstance.get<{ prediction: string }>(`/insights/daily`, {
    params: { sign_id: signId, date }
  });
  return response.data;
};

export interface TransitPlanet {
  name: string;
  sign: string;
  degree: number;
  nakshatra: string;
  retrograde: boolean;
}

export const getTransits = async (): Promise<TransitPlanet[]> => {
  const response = await axiosInstance.get<TransitPlanet[]>('/api/transits/current');
  return response.data;
};

export const getDoshaReport = async (details: BirthDetails): Promise<any> => {
  const response = await axiosInstance.post<any>('/insights/dosha', {
    date: details.date,
    time: details.time,
    latitude: details.latitude,
    longitude: details.longitude,
    ayanamsa_mode: details.ayanamsa_mode || 'LAHIRI',
  });
  return response.data;
};

/**
 * Check if backend API is healthy and reachable
 * @returns true if backend is healthy, false otherwise
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get('/health', {
      timeout: 5000, // Short timeout for health check
    });
    console.log('✅ Backend health check passed');
    return response.status === 200;
  } catch (error) {
    console.warn('⚠️ Backend health check failed:', error);
    return false;
  }
};

/**
 * Get API base URL (for debugging)
 */
export const getApiUrl = (): string => {
  return API_BASE;
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Chart Library API
export const saveChart = async (name: string, details: BirthDetails): Promise<any> => {
  const response = await axiosInstance.post('/charts/save', { name, details });
  return response.data;
};

export const listCharts = async (): Promise<SavedChart[]> => {
  const response = await axiosInstance.get<SavedChart[]>('/charts');
  return response.data;
};

export const deleteChart = async (id: number): Promise<any> => {
  const response = await axiosInstance.delete(`/charts/${id}`);
  return response.data;
};

// Daily Mentor Types
export interface DailyEnergy {
  score: number;
  label: string;
  color: 'Green' | 'Amber' | 'Red';
  auspiciousness: string;
  vibe: string;
  breakdown: {
    panchanga: number;
    moon: number;
    dasha: number;
    vara: number;
  };
}

export interface SpecialTime {
  name: string;
  start_time: string;
  end_time: string;
  quality: string;
  description: string;
}

export interface Hora {
  start_time: string;
  end_time: string;
  ruler: string;
  quality: string;
  duration_minutes: number;
}

export interface DailyMentorResponse {
  date: string;
  energy: DailyEnergy;
  theme: string;
  hora_timeline: Hora[];
  special_times: SpecialTime[];
  panchanga_summary: {
    tithi: string;
    nakshatra: string;
    vara: string;
    yoga?: string;
    karana?: string;
  };
}

export const getDailyMentor = async (details: BirthDetails, date: string): Promise<DailyMentorResponse> => {
  // Use POST to send complex birth details body + Query for current date
  const response = await axiosInstance.post<DailyMentorResponse>('/daily/mentor', details, {
    params: { current_date: date }
  });
  return response.data;
};

export interface CoreInsights {
  personal: string;
  career: string;
  relationships: string;
  dos_donts: string;
}

export const generateCoreInsights = async (details: BirthDetails): Promise<CoreInsights> => {
  const response = await axiosInstance.post<{ insights: CoreInsights }>('/insights/generate', {
    date: details.date,
    time: details.time,
    latitude: details.latitude,
    longitude: details.longitude,
    ayanamsa_mode: details.ayanamsa_mode || 'LAHIRI',
  });
  return response.data.insights;
};
