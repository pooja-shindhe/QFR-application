import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqService } from '../../services/rfq.service';
import { BidService } from '../../services/bid.service';
import { AuthService } from '../../services/auth.service';
import { RFQ } from '../../models/rfq.model';

@Component({
  selector: 'app-rfqs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rfqs.component.html',
  styleUrl: './rfqs.component.css'
})
export class RfqsComponent implements OnInit {
  rfq: RFQ | null = null;
  bidForm: FormGroup;
  loading = true;
  submitting = false;
  error = '';
  success = '';
  showBidForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rfqService: RfqService,
    private bidService: BidService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.bidForm = this.fb.group({
      quotedPrice: ['', [Validators.required, Validators.min(1)]],
      deliveryTime: ['', [Validators.required, Validators.min(1)]],
      deliveryTimeUnit: ['days', Validators.required],
      validityPeriod: [30, Validators.required],
      comments: ['']
    });
  }

  ngOnInit(): void {
    const rfqId = this.route.snapshot.paramMap.get('id');
    if (rfqId) {
      this.loadRFQDetails(rfqId);
    }
  }

  loadRFQDetails(id: string): void {
    this.loading = true;
    this.rfqService.getRFQById(id).subscribe({
      next: (response: any) => {
        this.rfq = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load RFQ details';
        this.loading = false;
      }
    });
  }

  toggleBidForm(): void {
    this.showBidForm = !this.showBidForm;
    if (!this.showBidForm) {
      this.bidForm.reset({ deliveryTimeUnit: 'days', validityPeriod: 30 });
      this.success = '';
      this.error = '';
    }
  }

  submitBid(): void {
    if (this.bidForm.invalid || !this.rfq?._id) {
      return;
    }

    this.submitting = true;
    this.error = '';

    const bidData = {
      ...this.bidForm.value,
      rfqId: this.rfq._id
    };

    this.bidService.createBid(bidData).subscribe({
      next: (response) => {
        this.success = 'Bid submitted successfully!';
        this.submitting = false;
        this.bidForm.reset({ deliveryTimeUnit: 'days', validityPeriod: 30 });
        setTimeout(() => {
          this.router.navigate(['/my-bids']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit bid';
        this.submitting = false;
      }
    });
  }

  viewBids(): void {
    if (this.rfq?._id) {
      this.router.navigate(['/compare-quotes', this.rfq._id]);
    }
  }

  getDaysRemaining(): number {
    if (!this.rfq?.endDate) return 0;
    const today = new Date();
    const end = new Date(this.rfq.endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
