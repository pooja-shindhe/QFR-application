import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RfqService } from '../../services/rfq.service';
import { RFQ } from '../../models/rfq.model';

@Component({
  selector: 'app-open-rfq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-rfq.component.html',
  styleUrl: './open-rfq.component.css'
})
export class OpenRfqComponent implements OnInit {
  rfqs: RFQ[] = [];
  loading = true;
  error = '';
  selectedCategory = '';

  constructor(private rfqService: RfqService, private router: Router) {}

  ngOnInit(): void {
    this.loadOpenRFQs();
  }

  loadOpenRFQs(): void {
    this.loading = true;
    this.rfqService.getOpenRFQs().subscribe({
      next: (response: any) => {
        this.rfqs = response.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load open RFQs';
        this.loading = false;
      }
    });
  }

  viewRFQDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/rfqs', id]);
    }
  }

  getDaysRemaining(endDate: Date): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
