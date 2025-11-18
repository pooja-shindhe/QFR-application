import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RfqService } from '../../services/rfq.service';
import { RFQ } from '../../models/rfq.model';

@Component({
  selector: 'app-rfq-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.css']
})
export class RfqListComponent implements OnInit {

  rfqs: RFQ[] = [];
  loading = true;
  error = '';

  // Computed counts (fix for NG5002)
  openCount = 0;
  closedCount = 0;
  awardedCount = 0;

  constructor(private rfqService: RfqService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyRFQs();
  }

  loadMyRFQs(): void {
    this.loading = true;
    this.rfqService.getMyRFQs().subscribe({
      next: (response: any) => {
        this.rfqs = response.data || [];
        this.calculateCounts();   // <--- important
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load RFQs';
        this.loading = false;
      }
    });
  }

  calculateCounts() {
    this.openCount = this.rfqs.filter(r => r.status === 'open').length;
    this.closedCount = this.rfqs.filter(r => r.status === 'closed').length;
    this.awardedCount = this.rfqs.filter(r => r.status === 'awarded').length;
  }

  trackById(index: number, rfq: RFQ) {
    return rfq._id;
  }

  viewRFQ(id: string | undefined, event?: Event): void {
    if (event) event.stopPropagation();
    if (id) this.router.navigate(['/rfqs', id]);
  }

  viewBids(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (id) this.router.navigate(['/compare-quotes', id]);
  }

  editRFQ(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (id) {
      this.router.navigate(['/create-rfq'], {
        queryParams: { id, mode: 'edit' }
      });
    }
  }

  deleteRFQ(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (id && confirm('Delete this RFQ?')) {
      this.rfqService.deleteRFQ(id).subscribe(() => {
        this.loadMyRFQs();
      });
    }
  }

  closeRFQ(id: string | undefined, event: Event) {
    event.stopPropagation();
    if (id && confirm('Close this RFQ?')) {
      this.rfqService.closeRFQ(id).subscribe(() => {
        this.loadMyRFQs();
      });
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'open': return 'bg-success';
      case 'closed': return 'bg-secondary';
      case 'awarded': return 'bg-primary';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  isExpired(endDate: Date): boolean {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    return end < now;
  }

  getDaysRemaining(endDate: Date): number {
    const today = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
