import { Output, EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class MockCIIntegration {
  @Output() buildsUpdated = new EventEmitter<any>();
  @Output() enabledChanged = new EventEmitter<boolean>();
  buildResults: any;

  enabled = false;
  constructor() {}

  init() {}
}
