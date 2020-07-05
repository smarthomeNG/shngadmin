import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemConfiguration2Component } from './item-configuration.component';

describe('ItemConfigurationComponent', () => {
  let component: ItemConfiguration2Component;
  let fixture: ComponentFixture<ItemConfiguration2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemConfiguration2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemConfiguration2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
