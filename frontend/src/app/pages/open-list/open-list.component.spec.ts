import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenListComponent } from './open-list.component';

describe('OpenListComponent', () => {
  let component: OpenListComponent;
  let fixture: ComponentFixture<OpenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
