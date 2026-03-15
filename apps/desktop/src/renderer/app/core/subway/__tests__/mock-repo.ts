import { Injectable } from "@angular/core";

@Injectable()
export class MockRepo {
  hasRepository = false;
  commits = [];
  repoChange = { subscribe: () => {} };

  constructor(
    private loading: any,
    private toastr: any,
    private status: any,
    private promptIj: any,
    private cred: any,
    private route: any,
    private commitChange: any,
    private hotkeys: any,
    private ngZone: any
  ) {}
}
