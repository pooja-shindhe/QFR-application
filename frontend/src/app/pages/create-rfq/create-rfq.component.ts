import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RfqService } from '../../services/rfq.service';

@Component({
  selector: 'app-create-rfq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-rfq.component.html',
  styleUrl: './create-rfq.component.css'
})
export class CreateRfqComponent {
  rfqForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  categories = ['Electronics', 'Furniture', 'Software', 'Hardware', 'Services', 'Construction', 'Raw Materials', 'Other'];
  units = ['Piece', 'Kg', 'Liter', 'Box', 'Set', 'Hour', 'Day', 'Unit'];

  constructor(
    private fb: FormBuilder,
    private rfqService: RfqService,
    private router: Router
  ) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    this.rfqForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      estimatedBudget: [''],
      deliveryLocation: ['', Validators.required],
      deliveryDate: [tomorrow.toISOString().split('T')[0], Validators.required],
      endDate: [nextWeek.toISOString().split('T')[0], Validators.required]
    });
  }

  onSubmit(): void {
    if (this.rfqForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.rfqService.createRFQ(this.rfqForm.value).subscribe({
      next: (response) => {
        this.success = 'RFQ created successfully!';
        setTimeout(() => {
          this.router.navigate(['/rfq-list']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create RFQ. Please try again.';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.rfqForm.reset();
    this.error = '';
    this.success = '';
  }
}