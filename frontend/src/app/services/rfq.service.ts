import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RFQ, RFQResponse } from '../models/rfq.model';

@Injectable({
  providedIn: 'root'
})
export class RfqService {
  private apiUrl = 'http://localhost:3000/api/rfq';

  constructor(private http: HttpClient) {}

  createRFQ(rfq: RFQ): Observable<RFQResponse> {
    return this.http.post<RFQResponse>(this.apiUrl, rfq);
  }

  getAllRFQs(status?: string, category?: string): Observable<RFQResponse> {
    let url = this.apiUrl;
    const params: string[] = [];
    
    if (status) params.push(`status=${status}`);
    if (category) params.push(`category=${category}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<RFQResponse>(url);
  }

  getOpenRFQs(): Observable<RFQResponse> {
    return this.http.get<RFQResponse>(`${this.apiUrl}/open`);
  }

  getMyRFQs(): Observable<RFQResponse> {
    return this.http.get<RFQResponse>(`${this.apiUrl}/my-rfqs`);
  }

  getRFQById(id: string): Observable<RFQResponse> {
    return this.http.get<RFQResponse>(`${this.apiUrl}/${id}`);
  }

  updateRFQ(id: string, rfq: Partial<RFQ>): Observable<RFQResponse> {
    return this.http.put<RFQResponse>(`${this.apiUrl}/${id}`, rfq);
  }

  deleteRFQ(id: string): Observable<RFQResponse> {
    return this.http.delete<RFQResponse>(`${this.apiUrl}/${id}`);
  }

  closeRFQ(id: string): Observable<RFQResponse> {
    return this.http.patch<RFQResponse>(`${this.apiUrl}/${id}/close`, {});
  }
}