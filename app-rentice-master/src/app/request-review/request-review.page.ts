import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonItemSliding } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { GlobalProvider } from '../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var window;

@Component({
  selector: 'app-request-review',
  templateUrl: './request-review.page.html',
  styleUrls: ['./request-review.page.scss'],
})
export class RequestReviewPage implements OnInit {

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
        window.ga('send', 'pageview', 'Request Review List');
      } else {
        if(this.ga) {
          this.ga.trackView('Request Review List');
        }
      }
    } catch(e) {
      console.log(e)
    }

    this.data = {
        date: new Date().toISOString().substr(0, 10),
        note: ''
    };

    this.user = JSON.parse(localStorage.getItem("user"));

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
    this.requestList = [];
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
        this.cdRef.detectChanges()

    }, (err) => {
        loading.dismiss()
        console.log("there is an error while get request list");
    });
  }

  createNew() {
    let flag = true;
    for(let i=0;i<this.requestList.length;i++) {
      if(this.requestList[i].status == "In Progress") {
        flag = false;
        break;
      }
    }

    if(flag == false) {
      this.global.displayAlert("RequestList_TEXT1");
      return ;
    }

    flag = true;
    for(let i=0;i<this.requestList.length;i++) {
      if(this.requestList[i].status == "Sent") {
        flag = false;
        break;
      }
    }

    if(flag == false) {
      this.global.displayAlert("A new request cannot be created when one has been sent.")
      return ;
    }

    this.router.navigateByUrl('/new-request');
  }

  goRequestViewItem(item) {
  	console.log(item)
  	localStorage.setItem('currentRequestItem', JSON.stringify(item))
  	this.router.navigateByUrl('/request-summary');
  }
}
