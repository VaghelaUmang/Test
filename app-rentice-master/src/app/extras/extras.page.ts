import { Component, OnInit } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var window;
declare var ga;

@Component({
  selector: 'app-extras',
  templateUrl: './extras.page.html',
  styleUrls: ['./extras.page.scss'],
})
export class ExtrasPage implements OnInit {

  constructor(private ga: GoogleAnalytics) { }

  ngOnInit() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Extra Page');
      } else {
        this.ga.trackView('Extra Page');
      }
    } catch (e) {
      console.log(e)
    }
  }

  openUrl(url) {
  	window.open(url,  '_blank');
  }
  
}
