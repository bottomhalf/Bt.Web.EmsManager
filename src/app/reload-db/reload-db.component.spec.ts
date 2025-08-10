import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReloadDbComponent } from './reload-db.component';

describe('ReloadDbComponent', () => {
  let component: ReloadDbComponent;
  let fixture: ComponentFixture<ReloadDbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReloadDbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReloadDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
