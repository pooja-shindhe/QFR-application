import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid, BidResponse } from '../models/bid.model';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = 'http://localhost:3000/api/bid';

  constructor(private http: HttpClient) {}

  createBid(bid: Bid): Observable<BidResponse> {
    return this.http.post<BidResponse>(this.apiUrl, bid);
  }

  getBidsByRFQ(rfqId: string): Observable<BidResponse> {
    return this.http.get<BidResponse>(`${this.apiUrl}/rfq/${rfqId}`);
  }

  getMyBids(): Observable<BidResponse> {
    return this.http.get<BidResponse>(`${this.apiUrl}/my-bids`);
  }

  getBidById(id: string): Observable<BidResponse> {
    return this.http.get<BidResponse>(`${this.apiUrl}/${id}`);
  }

  updateBid(id: string, bid: Partial<Bid>): Observable<BidResponse> {
    return this.http.put<BidResponse>(`${this.apiUrl}/${id}`, bid);
  }

  updateBidStatus(id: string, status: string): Observable<BidResponse> {
    return this.http.patch<BidResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  withdrawBid(id: string): Observable<BidResponse> {
    return this.http.patch<BidResponse>(`${this.apiUrl}/${id}/withdraw`, {});
  }
}