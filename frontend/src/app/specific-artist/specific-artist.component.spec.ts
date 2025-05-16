import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificArtistComponent } from './specific-artist.component';

describe('SpecificArtistComponent', () => {
  let component: SpecificArtistComponent;
  let fixture: ComponentFixture<SpecificArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecificArtistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecificArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
