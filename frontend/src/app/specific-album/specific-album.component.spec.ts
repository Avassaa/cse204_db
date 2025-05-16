import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificAlbumComponent } from './specific-album.component';

describe('SpecificAlbumComponent', () => {
  let component: SpecificAlbumComponent;
  let fixture: ComponentFixture<SpecificAlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecificAlbumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecificAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
