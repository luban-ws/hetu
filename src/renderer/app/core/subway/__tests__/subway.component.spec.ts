import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SubwayComponent } from "../subway.component";
import { SubwayStationsComponent } from "../../subway-stations/subway-stations.component";
import { RepoService } from "../../services/repo.service";
import { MockRepo } from "./mock-repo";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { describe } from "vitest";

describe("SubwayComponent", () => {
  let component: SubwayComponent;
  let fixture: ComponentFixture<SubwayComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [SubwayComponent, SubwayStationsComponent],
      providers: [
        {
          provide: RepoService,
          useValue: {
            hasRepository: false,
            commits: [],
            repoChange: { subscribe: () => {} },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubwayComponent, {
        set: {
          template: "<div>Test</div>",
          styleUrls: [],
        },
      })
      .overrideComponent(SubwayStationsComponent, {
        set: {
          template: "<div>Test</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
