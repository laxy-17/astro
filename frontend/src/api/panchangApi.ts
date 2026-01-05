import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // Match your backend port

// Re-using types if possible, or defining new ones specific to the Complete response
export interface TimeRange {
    start: string;
    end: string;
}

export interface TithiDetail {
    name: string;
    paksha: string;
    start_time: string;
    end_time: string;
    moon_phase: number;
}

export interface NakshatraDetail {
    name: string;
    name_tamil?: string;
    start_time: string;
    end_time: string;
    lord: string;
    pada: number;
}

export interface KaranaDetail {
    name: string;
    start_time: string;
    end_time: string;
}

export interface YogaDetail {
    name: string;
    start_time: string;
    end_time: string;
}

export interface GowriPeriod {
    name: string;
    start_time: string;
    end_time: string;
    is_auspicious: boolean;
}

export interface GowriPanchangam {
    day_periods: GowriPeriod[];
    night_periods: GowriPeriod[];
}

export interface VaaraSoolai {
    direction: string;
    remedy: string;
}

export interface TamilYogam {
    name: string;
    timing: string;
}

export interface LunarMonthYear {
    amanta: string;
    purnimanta: string;
    vikram_year: string;
    shaka_year: string;
    saka_national: string;
}

export interface AuspiciousYoga {
    name: string;
    timing: string;
    description: string;
}

export interface CompletePanchangResponse {
    date: string;
    location: string;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    ayanam: string;
    drik_ritu: string;
    tamil_year: string;
    tamil_month: string;
    tamil_date: number;
    naal: string;
    pirai: string;
    tithi: TithiDetail[];
    nakshatra: NakshatraDetail[];
    karana: KaranaDetail[];
    yoga: YogaDetail[];
    vaaram: string;
    rahu_kaalam: TimeRange;
    yamagandam: TimeRange;
    gulikai: TimeRange;
    dur_muhurtham: TimeRange[];
    varjyam: TimeRange[];
    abhijit_muhurtham: TimeRange;
    amrita_kaalam: TimeRange;
    brahma_muhurtham: TimeRange;
    anandadi_yogam: TamilYogam[];
    vaara_soolai: VaaraSoolai;
    soorya_rasi: string;
    chandra_rasi: string;
    lunar_month_year: LunarMonthYear;
    tamil_yogam: TamilYogam[];
    auspicious_yogas: AuspiciousYoga[];
    chandrashtamam: string[];
    agnivasa: string;
    chandra_vasa: string;
    rahukala_vasa: string;
    gowri_panchangam: GowriPanchangam;
}

export const fetchCompletePanchang = async (
    date: string,
    latitude: number,
    longitude: number,
    locationName: string,
    timezoneStr: string
): Promise<CompletePanchangResponse> => {
    const response = await axios.get(`${API_BASE}/api/panchang/complete`, {
        params: {
            date_str: date,
            latitude,
            longitude,
            location_name: locationName,
            timezone_str: timezoneStr
        }
    });
    return response.data;
};
