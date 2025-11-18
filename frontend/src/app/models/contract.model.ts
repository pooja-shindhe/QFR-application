export interface Contract {
  _id?: string;
  contractNumber?: string;
  rfqId: string;
  bidId: string;
  customerId: string;
  vendorId: string;
  contractValue: number;
  startDate: Date;
  endDate: Date;
  terms?: string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
  paymentTerms?: string;
  deliveryTerms?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContractResponse {
  success: boolean;
  message?: string;
  data?: Contract | Contract[];
  count?: number;
}