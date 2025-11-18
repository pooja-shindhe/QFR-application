export interface RFQ {
  _id?: string;
  rfqNumber?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedBudget?: number;
  deliveryLocation: string;
  deliveryDate: Date;
  startDate?: Date;
  endDate: Date;
  status?: 'open' | 'closed' | 'awarded' | 'cancelled';
  customerId?: string;
  customerName?: string;
  attachments?: string[];
  specifications?: { [key: string]: string };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RFQResponse {
  success: boolean;
  message?: string;
  data?: RFQ | RFQ[];
  count?: number;
}
