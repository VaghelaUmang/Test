import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.page.html',
  styleUrls: ['./discounts.page.scss'],
})
export class DiscountsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openUrl(url) {
  	window.open(url,  '_blank', 'location=yes');
  }
  
}
