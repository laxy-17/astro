import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface BirthDetails {
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
  latitude: number;
  longitude: number;
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
}

export interface ChartResponse {
  ascendant: number;
  ascendant_sign: string;
  planets: PlanetPosition[];
  houses: House[];
  dashas: Dasha[];
}

export const calculateChart = async (details: BirthDetails): Promise<ChartResponse> => {
  try {
    const response = await axios.post<ChartResponse>(`${API_BASE}/chart`, {
      date: details.date,
      time: details.time,
      latitude: details.latitude,
      longitude: details.longitude,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to calculate chart');
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};
