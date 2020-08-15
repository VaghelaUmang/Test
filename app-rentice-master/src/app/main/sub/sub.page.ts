import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var window;
declare var ga;

@Component({
  selector: 'app-sub',
  templateUrl: './sub.page.html',
  styleUrls: ['./sub.page.scss'],
})
export class SubPage implements OnInit {

	user: any = {};
	mainCategory: any;
	subCategoryList: any = [];
	subCategory: any;
	hostURL: string = "";
	allSubcategoryList: any = [];
  isOnline: boolean = true;
  bListView: boolean = false;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Sub Category Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Sub Category Page');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
  	console.log("==sub category===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	this.mainCategory = localStorage.getItem("mainCategoryIdx");
    this.isOnline = navigator.onLine;

  	this.subCategoryList = [];
  	if(window.cordova && window.cordova.file) {
	    this.hostURL = window.cordova.file.externalDataDirectory;

	    if(this.platform.is('android') == true) {
	        this.hostURL = window.cordova.file.externalDataDirectory;  
	    } else {
	        this.hostURL = window.cordova.file.dataDirectory;
	    }
  	}

    if(this.global.bDownloadSub == true) {
        this.allSubcategoryList = this.global.allSubcategoryList;
        for(let i=0;i<this.allSubcategoryList.length;i++) {
          if(this.allSubcategoryList[i].main == this.mainCategory) {
            this.subCategoryList.push(this.allSubcategoryList[i]);
          }
        }
    } else {
      if(this.global.allSubcategoryList.length < 1) {
        this.loadSubCategory();
      } else {
        for(let i=0;i<this.global.allSubcategoryList.length;i++) {
          if(this.global.allSubcategoryList[i].main == this.mainCategory) {
            this.subCategoryList.push(this.global.allSubcategoryList[i]);
          }
        }
      }
    }

    if(this.global.listByFaculty == null) {
      try {
        let data = JSON.parse(window.localStorage.getItem("listByFaculty"));
        if(data && data.length > 0)
          this.bListView = data[0].sublist == 1 ? true : false;
      } catch(e) {
        console.log(e)
      }
    }
    try {
      if(this.global.listByFaculty.length > 0) {
        this.bListView = this.global.listByFaculty[0].sublist == 1 ? true : false;
      }
    } catch (e) {
      console.log(e)
    }
	}

  async loadSubCategory () {
      var url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_by_main.php?main_cat=" + this.mainCategory + "&faculty=" + this.user.faculty;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.subCategoryList = resp.category;
          this.global.currentSubCatList = resp.category;
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("We could not connect to the server, Please turn on network to get subcategory");
      });
  }

  clickCategory(item) {
      this.subCategory = item.list_id;
      localStorage.removeItem("lastEntry");
     	localStorage.setItem("subCategoryIdx", item.list_id);
      localStorage.setItem("subCategoryName", item.name);
      localStorage.setItem("subCatInfo", JSON.stringify(item));
      this.router.navigateByUrl('/activity');
  }
}
