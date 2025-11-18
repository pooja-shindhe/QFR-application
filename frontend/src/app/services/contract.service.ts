import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract, ContractResponse } from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = 'http://localhost:3000/api/contract';

  constructor(private http: HttpClient) {}

  createContract(contract: Contract): Observable<ContractResponse> {
    return this.http.post<ContractResponse>(this.apiUrl, contract);
  }

  getAllContracts(): Observable<ContractResponse> {
    return this.http.get<ContractResponse>(this.apiUrl);
  }

  getContractById(id: string): Observable<ContractResponse> {
    return this.http.get<ContractResponse>(`${this.apiUrl}/${id}`);
  }

  updateContract(id: string, contract: Partial<Contract>): Observable<ContractResponse> {
    return this.http.put<ContractResponse>(`${this.apiUrl}/${id}`, contract);
  }

  updateContractStatus(id: string, status: string): Observable<ContractResponse> {
    return this.http.patch<ContractResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteContract(id: string): Observable<ContractResponse> {
    return this.http.delete<ContractResponse>(`${this.apiUrl}/${id}`);
  }
}