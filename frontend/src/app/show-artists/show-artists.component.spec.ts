import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowArtistsComponent } from './show-artists.component';

describe('ShowArtistsComponent', () => {
  let component: ShowArtistsComponent;
  let fixture: ComponentFixture<ShowArtistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowArtistsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowArtistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
