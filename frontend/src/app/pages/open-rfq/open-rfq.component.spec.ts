import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenRfqComponent } from './open-rfq.component';

describe('OpenRfqComponent', () => {
  let component: OpenRfqComponent;
  let fixture: ComponentFixture<OpenRfqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenRfqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenRfqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
