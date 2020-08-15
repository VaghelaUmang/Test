import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import { GlobalProvider } from '../services/global-provider';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var window;
declare var ga;

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

	user: any = {};
	hostURL: string = "";
	mainCatList: any = [];
	subCategoryList: any = [];
	allSubCatList: any = [];
	mainCategory: any;
  isOnline: boolean = true;
  bListView: boolean = false;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private storage: Storage,
              private webview: WebView,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  goSearch() {
    this.router.navigateByUrl("/search");
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Main Category Page');
      } else {
          this.ga.trackView('Main Category Page');
      }
    } catch (e) {
      console.log(e)
    }

    console.log("==main category===");
    this.isOnline = navigator.onLine;
    console.log(this.isOnline);
    this.mainCatList = this.global.allMaincategoryList;
    if(this.mainCatList.length < 1) {
      this.storage.get('maincategory').then((maincategory) => {
        if(maincategory !== null && maincategory !== undefined && maincategory !== "") {
            try {
                this.global.allMaincategoryList = JSON.parse(maincategory);
            } catch(e) {
                this.global.allMaincategoryList = [];
            }
            this.mainCatList = this.global.allMaincategoryList;
        }
    });
    }
    if(window.cordova && window.cordova.file) {
      this.hostURL = window.cordova.file.externalDataDirectory;
      if(this.platform.is('android') == true) {
          this.hostURL = window.cordova.file.externalDataDirectory;  
      } else {
          this.hostURL = window.cordova.file.dataDirectory;
      }
    }

    console.log(this.global.listByFaculty);
    if(this.global.listByFaculty == null) {
      try {
        let data = JSON.parse(window.localStorage.getItem("listByFaculty"));
        if(data && data.length > 0)
          this.bListView = data[0].list == 1 ? true : false;
      } catch(e) {
        console.log(e)
      }
    }
    try {
      if(this.global.listByFaculty.length > 0) {
        this.bListView = this.global.listByFaculty[0].list == 1 ? true : false;
      }
    } catch (e) {
      console.log(e)
    }
  }

  quickAdd() {
    console.log(this.global.allStudentLogList);
    let lastEntry: any = {};
    if(this.global.allStudentLogList.length > 0) {
      lastEntry = this.global.allStudentLogList[0];
      this.global.lastEntry = lastEntry;
    }

    if(lastEntry.main_category == null || lastEntry.main_category == undefined) {
      return ;
    }

    localStorage.setItem("lastEntry", JSON.stringify(lastEntry));

    let mainCatName, subCatName;
    this.global.allMaincategoryList.forEach(item => {
      if(parseInt(item.cat) == parseInt(lastEntry.main_category)) {
        mainCatName = item.name;
      }
    })

    let subCatInfo;
    this.global.allSubcategoryList.forEach(item => {
      if(parseInt(item.list_id) == parseInt(lastEntry.sub_category)) {
        subCatName = item.name;
        subCatInfo = item;
      }
    })

    localStorage.setItem("mainCategoryIdx", lastEntry.main_category);
    localStorage.setItem("mainCategoryName", mainCatName);
    localStorage.setItem("subCategoryIdx", lastEntry.sub_category);
    localStorage.setItem("subCategoryName", subCatName);
    localStorage.setItem("subCatInfo", JSON.stringify(subCatInfo));
    this.router.navigateByUrl("/activity");
  }

  clickCategory(item) {
    localStorage.setItem("mainCategoryIdx", item.cat);
    localStorage.setItem("mainCategoryName", item.name);
    this.router.navigateByUrl('/sub');
  }
}
