import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BidService } from '../../services/bid.service';
import { Bid } from '../../models/bid.model';

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bids.component.html',
  styleUrl: './my-bids.component.css'
})
export class MyBidsComponent implements OnInit {
  bids: any[] = [];
  loading = true;
  error = '';

  constructor(private bidService: BidService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyBids();
  }

  loadMyBids(): void {
    this.loading = true;
    this.bidService.getMyBids().subscribe({
      next: (response: any) => {
        this.bids = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bids';
        this.loading = false;
      }
    });
  }

  withdrawBid(id: string | undefined, event: Event): void {
    event.stopPropagation();
    if (id && confirm('Are you sure you want to withdraw this bid?')) {
      this.bidService.withdrawBid(id).subscribe({
        next: () => {
          this.loadMyBids();
        },
        error: (err) => {
          alert('Failed to withdraw bid');
        }
      });
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'submitted': return 'bg-info';
      case 'under_review': return 'bg-warning';
      case 'accepted': return 'bg-success';
      case 'rejected': return 'bg-danger';
      case 'withdrawn': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  viewRFQ(rfqId: string): void {
    this.router.navigate(['/rfqs', rfqId]);
  }
}