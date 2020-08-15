import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signoff-qual',
  templateUrl: './signoff-qual.page.html',
  styleUrls: ['./signoff-qual.page.scss'],
})
export class SignoffQualPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  clearFilter() {

  }

  openUrl(url) {
    window.open(url,  '_blank');
  }
}
