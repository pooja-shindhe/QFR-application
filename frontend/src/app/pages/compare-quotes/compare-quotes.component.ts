import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BidService } from '../../services/bid.service';
import { RfqService } from '../../services/rfq.service';
import { Bid } from '../../models/bid.model';
import { RFQ } from '../../models/rfq.model';

@Component({
  selector: 'app-compare-quotes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compare-quotes.component.html',
  styleUrl: './compare-quotes.component.css'
})
export class CompareQuotesComponent implements OnInit {
  rfq: RFQ | null = null;
  bids: any[] = [];
  loading = true;
  error = '';
  sortBy: 'price' | 'delivery' | 'submitted' = 'price';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bidService: BidService,
    private rfqService: RfqService
  ) {}

  ngOnInit(): void {
    // Get RFQ ID from route parameter (not query param)
    this.route.paramMap.subscribe(params => {
      const rfqId = params.get('rfqId');
      console.log('RFQ ID from route:', rfqId); // Debug log
      
      if (rfqId) {
        this.loadRFQAndBids(rfqId);
      } else {
        this.error = 'No RFQ ID provided';
        this.loading = false;
      }
    });
  }

  loadRFQAndBids(rfqId: string): void {
    this.loading = true;
    this.error = '';
    
    // Load RFQ details first
    this.rfqService.getRFQById(rfqId).subscribe({
      next: (response: any) => {
        this.rfq = response.data;
        console.log('Loaded RFQ:', this.rfq); // Debug log
        
        // Then load bids for this RFQ
        this.loadBids(rfqId);
      },
      error: (err) => {
        console.error('Error loading RFQ:', err); // Debug log
        this.error = err.error?.message || 'Failed to load RFQ details';
        this.loading = false;
      }
    });
  }

  loadBids(rfqId: string): void {
    this.bidService.getBidsByRFQ(rfqId).subscribe({
      next: (response: any) => {
        this.bids = response.data || [];
        console.log('Loaded bids:', this.bids); // Debug log
        this.sortBids();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bids:', err); // Debug log
        // Don't set error here - just show no bids available
        this.bids = [];
        this.loading = false;
      }
    });
  }

  sortBids(): void {
    switch (this.sortBy) {
      case 'price':
        this.bids.sort((a, b) => a.quotedPrice - b.quotedPrice);
        break;
      case 'delivery':
        this.bids.sort((a, b) => {
          const aDays = this.convertToHours(a.deliveryTime, a.deliveryTimeUnit);
          const bDays = this.convertToHours(b.deliveryTime, b.deliveryTimeUnit);
          return aDays - bDays;
        });
        break;
      case 'submitted':
        this.bids.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;
    }
  }

  convertToHours(time: number, unit: string): number {
    switch (unit) {
      case 'days': return time * 24;
      case 'weeks': return time * 24 * 7;
      case 'months': return time * 24 * 30;
      default: return time;
    }
  }

  onSortChange(sort: 'price' | 'delivery' | 'submitted'): void {
    this.sortBy = sort;
    this.sortBids();
  }

  getLowestPrice(): number {
    if (this.bids.length === 0) return 0;
    return Math.min(...this.bids.map(b => b.quotedPrice));
  }

  getAveragePrice(): number {
    if (this.bids.length === 0) return 0;
    const sum = this.bids.reduce((acc, b) => acc + b.quotedPrice, 0);
    return sum / this.bids.length;
  }

  acceptBid(bid: any, event: Event): void {
    event.stopPropagation();
    if (confirm(`Accept bid from ${bid.vendorCompany} for $${bid.quotedPrice.toFixed(2)}?\n\nThis will create a contract and close the RFQ.`)) {
      this.router.navigate(['/create-contract'], {
        queryParams: {
          rfqId: this.rfq?._id,
          bidId: bid._id
        }
      });
    }
  }

  rejectBid(bidId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to reject this bid? This action cannot be undone.')) {
      this.bidService.updateBidStatus(bidId, 'rejected').subscribe({
        next: () => {
          alert('Bid rejected successfully');
          if (this.rfq?._id) {
            this.loadBids(this.rfq._id);
          }
        },
        error: (err) => {
          alert('Failed to reject bid: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }

  reviewBid(bidId: string, event: Event): void {
    event.stopPropagation();
    this.bidService.updateBidStatus(bidId, 'under_review').subscribe({
      next: () => {
        alert('Bid marked as under review');
        if (this.rfq?._id) {
          this.loadBids(this.rfq._id);
        }
      },
      error: (err) => {
        alert('Failed to update bid status: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'submitted': return 'bg-info';
      case 'under_review': return 'bg-warning text-dark';
      case 'accepted': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  viewVendorProfile(vendorId: string): void {
    // Navigate to vendor profile page if implemented
    console.log('View vendor profile:', vendorId);
  }

  exportBidsToCSV(): void {
    if (this.bids.length === 0) return;
    
    const headers = ['Bid Number', 'Vendor Company', 'Vendor Name', 'Quoted Price', 'Delivery Time', 'Status', 'Submitted Date'];
    const rows = this.bids.map(bid => [
      bid.bidNumber,
      bid.vendorCompany,
      bid.vendorName,
      bid.quotedPrice,
      `${bid.deliveryTime} ${bid.deliveryTimeUnit}`,
      bid.status,
      new Date(bid.submittedAt).toLocaleString()
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bids_${this.rfq?.rfqNumber}_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  goBackToRFQList(): void {
    this.router.navigate(['/rfq-list']);
  }

  viewRFQDetails(): void {
    if (this.rfq?._id) {
      this.router.navigate(['/rfqs', this.rfq._id]);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
