import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonItemSliding } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var window;

@Component({
  selector: 'app-signoff',
  templateUrl: './signoff.page.html',
  styleUrls: ['./signoff.page.scss'],
})
export class SignoffPage implements OnInit {

	data: any = {};
	user: any = {};
	requestList: any = [];

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Trainee Signoff page');
      } else {
        if(this.ga) {
          this.ga.trackView('Trainee Signoff page');
        }
      }
    } catch(e) {
      console.log(e)
    }

    this.data = {
        date: new Date().toISOString().substr(0, 10),
        note: ''
    };

    this.user = JSON.parse(localStorage.getItem("currentTutorItem"));

    this.loadUserData()
    this.loadRequestList()
  }

  loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

  async loadRequestList() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_request_list_by_user.php?user_id=" + this.user.user_id;
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss()
        if(resp.error == true) {
          console.log("there is an error while get request list");
          return ;
        }

        let status = "In Progress";
        let requestList = [];
        resp.data.forEach(item => {
          let flag = true;
          for(let i=0;i<requestList.length; i++) {
            if(item.status == requestList[i].status && item.status == status) {
              flag = false;
              break;
            }
          }
          if(flag) {
            requestList.push(item)
          }
        })

        this.requestList = requestList;

    }, (err) => {
        loading.dismiss()
        console.log("there is an error while get request list");
    });
  }

  goSignoffSummary(item) {
  	console.log(item)
  	localStorage.setItem('currentSignoffItem', JSON.stringify(item))
  	this.router.navigateByUrl('/signoff-summary');
  }

  createNew() {
    let flag = true;
    this.requestList.forEach(item => {
      if(item.status == "In Progress") {
        flag = false;
      }
    })

    if(flag) {
      this.router.navigateByUrl('/new-signoff');
    } else {
      this.global.displayAlert("New request reviews cannot be created if there is already one In-Progress");
    }
  }

}
