import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qualification-comp',
  templateUrl: './qualification-comp.page.html',
  styleUrls: ['./qualification-comp.page.scss'],
})
export class QualificationCompPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openUrl(url) {
  	window.open(url,  '_blank');
  }

}
