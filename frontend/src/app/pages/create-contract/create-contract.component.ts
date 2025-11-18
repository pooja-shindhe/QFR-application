import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { BidService } from '../../services/bid.service';
import { RfqService } from '../../services/rfq.service';

@Component({
  selector: 'app-create-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-contract.component.html',
  styleUrl: './create-contract.component.css'
})
export class CreateContractComponent implements OnInit {
  contractForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  rfqId = '';
  bidId = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private bidService: BidService,
    private rfqService: RfqService
  ) {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    this.contractForm = this.fb.group({
      contractValue: ['', [Validators.required, Validators.min(1)]],
      startDate: [today.toISOString().split('T')[0], Validators.required],
      endDate: [nextMonth.toISOString().split('T')[0], Validators.required],
      terms: [''],
      paymentTerms: [''],
      deliveryTerms: ['']
    });
  }

  ngOnInit(): void {
    this.rfqId = this.route.snapshot.queryParamMap.get('rfqId') || '';
    this.bidId = this.route.snapshot.queryParamMap.get('bidId') || '';

    if (this.bidId) {
      this.loadBidDetails();
    }
  }

  loadBidDetails(): void {
    this.bidService.getBidById(this.bidId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.contractForm.patchValue({
            contractValue: response.data.quotedPrice
          });
        }
      },
      error: (err) => {
        console.error('Failed to load bid details');
      }
    });
  }

  onSubmit(): void {
    if (this.contractForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const contractData = {
      ...this.contractForm.value,
      rfqId: this.rfqId,
      bidId: this.bidId
    };

    this.contractService.createContract(contractData).subscribe({
      next: (response) => {
        this.success = 'Contract created successfully!';
        setTimeout(() => {
          this.router.navigate(['/rfq-list']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create contract';
        this.loading = false;
      }
    });
  }
}