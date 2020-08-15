import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qualification-us',
  templateUrl: './qualification-us.page.html',
  styleUrls: ['./qualification-us.page.scss'],
})
export class QualificationUsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openUrl(url) {
  	window.open(url,  '_blank');
  }
}
