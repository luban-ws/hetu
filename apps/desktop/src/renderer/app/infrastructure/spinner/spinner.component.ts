import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: false
})
export class SpinnerComponent implements OnInit {
  @Input() enabled = false;
  @Input() size = '40';
  @HostBinding('class') class = 'd-flex justify-content-center align-items-center';
  constructor() { }

  ngOnInit() {
  }
}
