import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareQuotesComponent } from './compare-quotes.component';

describe('CompareQuotesComponent', () => {
  let component: CompareQuotesComponent;
  let fixture: ComponentFixture<CompareQuotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareQuotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareQuotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
