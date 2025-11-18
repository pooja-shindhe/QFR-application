export interface Bid {
  _id?: string;
  bidNumber?: string;
  rfqId: string;
  vendorId?: string;
  vendorName?: string;
  vendorCompany?: string;
  quotedPrice: number;
  deliveryTime: number;
  deliveryTimeUnit: 'days' | 'weeks' | 'months';
  validityPeriod?: number;
  comments?: string;
  specifications?: { [key: string]: string };
  status?: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt?: Date;
  updatedAt?: Date;
}

export interface BidResponse {
  success: boolean;
  message?: string;
  data?: Bid | Bid[];
  count?: number;
}
