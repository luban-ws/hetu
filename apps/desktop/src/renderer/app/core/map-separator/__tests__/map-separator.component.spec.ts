import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MapSeparatorComponent } from "../map-separator.component";
import { beforeEach, describe, expect, it } from "vitest";

describe("MapSeparatorComponent", () => {
  let component: MapSeparatorComponent;
  let fixture: ComponentFixture<MapSeparatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapSeparatorComponent],
    })
      .overrideComponent(MapSeparatorComponent, {
        set: {
          template: "<div>Test Template</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSeparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
