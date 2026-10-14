import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelModal } from './cancel-modal';

describe('CancelModal', () => {
  let component: CancelModal;
  let fixture: ComponentFixture<CancelModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
