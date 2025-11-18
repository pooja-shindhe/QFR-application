import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqsComponent } from './rfqs.component';

describe('RfqsComponent', () => {
  let component: RfqsComponent;
  let fixture: ComponentFixture<RfqsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfqsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
