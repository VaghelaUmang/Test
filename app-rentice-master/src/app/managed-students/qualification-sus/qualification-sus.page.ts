import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qualification-sus',
  templateUrl: './qualification-sus.page.html',
  styleUrls: ['./qualification-sus.page.scss'],
})
export class QualificationSusPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openUrl(url) {
  	window.open(url,  '_blank');
  }
}
