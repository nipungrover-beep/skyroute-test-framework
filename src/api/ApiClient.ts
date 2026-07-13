import { APIRequestContext } from '@playwright/test';

/**
 * Thin wrapper around the SkyRoute REST endpoints discovered during
 * exploration. Centralizing paths here means a route change only needs
 * updating in one place.
 */
export class ApiClient {
  constructor(private request: APIRequestContext) {}

  airports(query: string) {
    return this.request.get('/api/airports', { params: { q: query } });
  }

  flights(params: {
    from: string;
    to: string;
    date: string; // YYYY-MM-DD
    passengers: number;
    travelClass: 'ECONOMY' | 'BUSINESS';
  }) {
    return this.request.get('/api/flights', { params });
  }

  fares(flightId: string | number, travelClass: 'ECONOMY' | 'BUSINESS') {
    return this.request.get(`/api/flights/${flightId}/fares`, { params: { travelClass } });
  }

  seatmap(flightId: string | number, travelClass: 'ECONOMY' | 'BUSINESS') {
    return this.request.get(`/api/flights/${flightId}/seatmap`, { params: { travelClass } });
  }

  confirm(
    flightId: string | number,
    params: { travelClass: 'ECONOMY' | 'BUSINESS'; passengers: number; fareId: string; seatId: string }
  ) {
    return this.request.get(`/api/flights/${flightId}/confirm`, { params });
  }

  login(loginId: string, password: string) {
    return this.request.post('/api/auth/login', { data: { loginId, password } });
  }
}
