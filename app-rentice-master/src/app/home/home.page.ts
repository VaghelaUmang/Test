import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ImagesProvider } from '../services/images.images';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { TranslateService } from '@ngx-translate/core';

import {
  File
} from '@ionic-native/file/ngx';

import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';

import { GlobalProvider } from '../services/global-provider';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var ga;
declare var window;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

	data: any = {};
	user: any = {};
	mainCnt: any = 0;
	subCnt: any = 0;
	maincategoryList: any = [];
	addressList: any = [];
	activityList: any = [];
	subcategoryList: any = [];
	mainCatImageList: any = [];
	subCatImageList: any = [];
  timesheetList: any = [];
  loading: any;

	constructor(private platform: Platform,
              private translate: TranslateService,
							public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private transfer: FileTransfer,
              public file: File,
              private webview: WebView,
              private _IMAGES   : ImagesProvider,
              private ga: GoogleAnalytics,
  						public global: GlobalProvider,
              private storage: Storage) { 
        this.global.allActivityList = [];
        this.global.allSubcategoryList = [];
        this.global.allMaincategoryList = [];
  }

	ionViewWillEnter() {
        this.platform.ready().then(() => {
          try {
            if(!window.device)
                ga('send', 'pageview', 'Home Page');
            else {
                this.ga.trackView('Home Page');
            }
          } catch(e) {
            console.log(e)
          }
        });
        
				this.user = JSON.parse(localStorage.getItem("user"));

        if(this.user == null || this.user == undefined) {
          this.router.navigateByUrl("/");
          return ;
        }

        this.global.registerToken();
        this.mainCnt = 0;
        this.subCnt = 0;

        this.getListByFaculty();

        if(this.global.allMaincategoryList.length < 1) {
          this.getAllMainCategory();
        }

        if(this.global.allSubcategoryList.length < 1) {
          this.getAllSubCategory();
        }

        if(this.global.allAddressList.length < 1) {
          this.getAllAddress();
        }

        if(this.global.defaultAddressList.length < 1) {
          this.getDefaultAddress();
        }

        if(this.global.bossAddressList.length < 1) {
          this.getBossAddress();
        }

        if(this.global.allActivityList.length < 1) {
          this.getAllActivites();
        }

        if(this.global.allSubcategoryList.length < 1) {
          this.getAllStudentLog();
        }

        if(this.global.allTimesheetList.length < 1) {
          this.getAllTimesheet();
        }

        if(this.global.allQualList.length < 1) {
          this.getAllQualList();
        }

        this.global.bDownloadMain = false;
        this.global.bDownloadSub = false;

        if(localStorage.getItem('bDownloadMain') == '1') {
          this.global.bDownloadMain = true;
        }

        if(localStorage.getItem('bDownloadSub') == '1' || localStorage.getItem('bDownloadSub') == '1') {
          this.global.bDownloadSub = true;
        }

        if(this.global.bDownloadMain == false || this.global.bDownloadSub == false) {
          this.alertController.create({
			      header: this.translate.instant('Alert'),
			      message: this.translate.instant('Do you want to download all content?'),
			      buttons: [{
			          text: this.translate.instant('Cancel'),
			          role: 'cancel',
			          cssClass: 'secondary',
			          handler: (blah) => {
			            console.log('Confirm Cancel: blah');
			          }
			        }, {
			          text: this.translate.instant('OK'),
			          handler: () => {
			            this.getAllAddress();
		              this.getAllActivites();
                  this.getAllStudentLog();
                  this.getAllTimesheet();
		              this.downloadMainCatContent();
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
        } 
  }

  async getListByFaculty() {
      var url = "https://artisanideas.co.nz/api/app-rentice/get_list_by_faculty.php?faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              return ;
          }
          this.global.listByFaculty = resp.list;
          var data = JSON.stringify(this.global.listByFaculty);
          window.localStorage.setItem("listByFaculty", data);
      }, (err) => {
          console.log("There is an error when get list by faculty")
      });
  }

  async getAllMainCategory() {
      var url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory_by_provider_10.php?provider=" + this.user.provider + "&faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              return ;
          }
          this.maincategoryList = resp.category;

          var now: any = new Date();
          window.localStorage.setItem("mainCategoryDate", now.getTime());
          var data = JSON.stringify(this.maincategoryList);
          window.localStorage.setItem("maincategory", data);
          this.storage.set('mainCategoryDate', now.getTime());
          this.storage.set('maincategory', data);

          this.global.allMaincategoryList = this.maincategoryList;
      }, (err) => {
      });
  }

  async getAllAddress() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.user.user_id;
      this.http.get(url).subscribe((resp: any) => {
          let now: any = new Date();
          window.localStorage.setItem("addressDate", now.getTime());
          let data = JSON.stringify(resp.data);

          this.storage.set('addressDate', now.getTime());
          this.storage.set('address', data);
          this.global.allAddressList = resp.data;
      }, (err) => {
          //this.global.displayAlert("There is an error when get address.");
      });
  }

  async getDefaultAddress() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=0";
      this.http.get(url).subscribe((resp: any) => {
          let now: any = new Date();
          window.localStorage.setItem("defaultAddressDate", now.getTime());
          let data = JSON.stringify(resp.data);

          this.storage.set('defaultAddressDate', now.getTime());
          this.storage.set('defaultAddress', data);
          this.global.defaultAddressList = resp.data;
      }, (err) => {
          //this.global.displayAlert("There is an error when get address.");
      });
  }

  async getBossAddress() {
    if(this.user.boss && this.user.boss.length > 0) {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.user.boss;
      this.http.get(url).subscribe((resp: any) => {
          let now: any = new Date();
          window.localStorage.setItem("bossAddressDate", now.getTime());
          let data = JSON.stringify(resp.data);

          this.storage.set('bossAddressDate', now.getTime());
          this.storage.set('bossAddress', data);
          this.global.bossAddressList = resp.data;
      }, (err) => {
          //this.global.displayAlert("There is an error when get address.");
      });
    }
  }

  async getAllActivites() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_allactivities.php?faculty=" + this.user.faculty;
      this.activityList = [];
      this.http.get(url).subscribe((resp: any) => {
          let activityList = resp.data;
          let now: any = new Date();
          window.localStorage.setItem("activityDate", now.getTime());
          let data = JSON.stringify(activityList);

          this.storage.set('activityDate', now.getTime());
          this.storage.set('allactivity', data);

          this.global.allActivityList = activityList;
      }, function () {
          this.global.displayAlert("There is an error when get activities.");
      });
  }

  async getAllStudentLog() {    
      let url = "https://www.artisanideas.co.nz/api/app-rentice/search_inventory_by_student.php?student=" + this.user.user_id;
      this.http.get(url).subscribe((resp: any) => {
          //console.log(resp.data);
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get studeng log.");
              return ;
          }
          let now: any = new Date();
          resp.data.forEach(item => {
            item.name = this.user.user_firstname + " " + this.user.user_lastname;
          });
          console.log(resp.data);
          window.localStorage.setItem("allStudentLogDate", now.getTime());
          let data = JSON.stringify(resp.data);
          this.storage.set('allStudentLogList', data);

          this.global.allStudentLogList = resp.data;
      }, (err) => {
          this.global.displayAlert("There is an error when get studeng log.");
      });
  }

  async getAllTimesheet() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_timesheet_by_student.php?student=" + this.user.user_id;
      this.http.get(url).subscribe((resp: any) => {
          //console.log(resp.data);
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get timesheet.");
              return ;
          }
          
          this.global.allTimesheetList = resp.data; 
          let now : any = new Date();
          this.storage.set("allTimesheetDate", now.getTime());
          let data = JSON.stringify(resp.data);
          this.storage.set("allTimesheetList", data);
      }, (err) => {
          this.global.displayAlert("There is an error when get timesheet.");
      });
  }

  getAllQualList() {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_qual.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get courseList");
          return ;
        }

        this.global.allQualList = resp.data; 
        let now : any = new Date();
        this.storage.set("allQualListDate", now.getTime());
        let data = JSON.stringify(resp.data);
        this.storage.set("allQualList", data);
    }, (err) => {
        console.log("there is an error while get AllQualList");
    });
  }

  async downloadMainCatContent() {
      //var url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory.php?faculty=" + $rootScope.user.faculty;
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory_by_provider_10.php?provider="+this.user.provider+"&faculty=" + this.user.faculty;
      this.loading = await this.loadingController.create({
	      message: this.translate.instant('Downloading Main category images...'),
	    });
	    await this.loading.present();
      this.http.get(url).subscribe((resp: any) => {
          //console.log(resp.category);
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get content.");
              return ;
          }
          this.maincategoryList = resp.category;

          let now: any = new Date();
          window.localStorage.setItem("mainCategoryDate", now.getTime());
          let data = JSON.stringify(this.maincategoryList);
          window.localStorage.setItem("maincategory", data);

          this.global.allMaincategoryList = this.maincategoryList;

          this.processDownloadMainCat(this.maincategoryList[0].main_image);
      }, function () {
          this.loading.dismiss();
          this.global.displayAlert("There is an error when get content.");
      });
  }

  async processDownloadMainCat(url) {
    const uri = encodeURI('https://artisanideas.co.nz/itab/page109/page110/styled-4/' + url);
    let fileURL = url;

    if(this.global.isCordova) {
	    if(this.platform.is('android') == true) {
          fileURL = this.file.externalDataDirectory + url;  
      } else {
          fileURL = this.file.dataDirectory + url;
          //fileURL = this.file.syncedDataDirectory + url;
      }

	    const fileTransfer: FileTransferObject = this.transfer.create();
	    fileTransfer.download(uri, fileURL).then((entry) => {
		    //console.log('download complete: ' + entry.toURL());
        this.maincategoryList[this.mainCnt].cordova_image = this.webview.convertFileSrc(entry.toURL());
        this.mainCnt++;

	      if(this.mainCnt >= this.maincategoryList.length) {
          if(this.loading) {
            this.loading.dismiss();
          }
	        window.localStorage.setItem('bDownloadMain', '1');

          let now: any = new Date();
          localStorage.setItem("mainCategoryDate", now.getTime());
          let data = JSON.stringify(this.maincategoryList);
          this.storage.set('mainCategoryDate', now.getTime());
          this.storage.set('maincategory', data);

	        this.global.bDownloadMain = true;
	        this.downloadSubCatContent();
	        return ;
	      }
	      var _url = this.maincategoryList[this.mainCnt].main_image
	      this.processDownloadMainCat(_url);
		  }, (error) => {
		    // handle error
        this.maincategoryList[this.mainCnt].cordova_image = null;
		    this.mainCnt++;
	      if(this.mainCnt >= this.maincategoryList.length) {
          if(this.loading) {
            this.loading.dismiss();
          }
	        window.localStorage.setItem('bDownloadMain', '1');
	        this.global.bDownloadMain = true;
          let now: any = new Date();
          localStorage.setItem("mainCategoryDate", now.getTime());
          let data = JSON.stringify(this.maincategoryList);
          this.storage.set('mainCategoryDate', now.getTime());
          this.storage.set('maincategory', data);
	        this.downloadSubCatContent();
	        return ;
	      }
	      var _url = this.maincategoryList[this.mainCnt].main_image
	      this.processDownloadMainCat(_url);
		  });
    } else {

    	//Works on browser version
    	this.global.toDataURL(uri, (dataUrl) => {
       	//console.log(dataUrl);
       	this.mainCatImageList.push(dataUrl);
        this.maincategoryList[this.mainCnt].local_image = dataUrl;
        this.mainCnt++;
	      if(this.mainCnt >= this.maincategoryList.length) {
          if(this.loading) {
            this.loading.dismiss();
          }
          let now: any = new Date();
          localStorage.setItem("mainCategoryDate", now.getTime());
          let data = JSON.stringify(this.maincategoryList);
          this.storage.set('mainCategoryDate', now.getTime());
          this.storage.set('maincategory', data);

	      	//localStorage.setItem("mainCatImageList", JSON.stringify(this.mainCatImageList));
	        localStorage.setItem('bDownloadMain', '1');
	        this.global.bDownloadMain = true;
	        this.downloadSubCatContent();
	        return ;
	      }
	      let _url = this.maincategoryList[this.mainCnt].main_image
	      this.processDownloadMainCat(_url);
      });
    }
  }

  async getAllSubCategory() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_by_faculty.php?faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          //console.log(resp.category);
          if(resp.error === true) {
              this.global.displayAlert("There is an error when get category.");
              return ;
          }
          this.subcategoryList = resp.category;

          let now: any = new Date();
          window.localStorage.setItem("allSubCategoryDate", now.getTime());
          let data = JSON.stringify(this.subcategoryList);
          this.storage.set('allSubCategoryDate', now.getTime());
          this.storage.set('allSubCategory', data);
          this.global.allSubcategoryList = this.subcategoryList;
      }, function () {
          this.loading.dismiss();
          this.global.displayAlert("There is an error when get category.");
      });
  }

  async downloadSubCatContent() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_by_faculty.php?faculty=" + this.user.faculty;
      this.loading = await this.loadingController.create({
	      message: this.translate.instant('Downloading subcategory images...'),
	    });
	    this.loading.present();
      this.http.get(url).subscribe((resp: any) => {
          //console.log(resp.category);
          if(resp.error === true) {
              this.global.displayAlert("There is an error when get content.");
              return ;
          }
          this.subcategoryList = resp.category;

          let now: any = new Date();
          window.localStorage.setItem("allSubCategoryDate", now.getTime());
          let data = JSON.stringify(this.subcategoryList);
          this.storage.set('allSubCategoryDate', now.getTime());
          this.storage.set('allSubCategory', data);

          this.global.allSubcategoryList = this.subcategoryList;
          this.processDownloadSubCat(this.subcategoryList[0].sub_image);
      }, function () {
          this.loading.dismiss();
          this.global.displayAlert("There is an error when get content.");
      });
  }

  async processDownloadSubCat(url) {
   
    const uri = encodeURI('https://artisanideas.co.nz/itab/page109/page112/styled-3/' + url);
    var fileURL = url;

    if(this.global.isCordova) {
      if(this.platform.is('android') == true) {
          fileURL = this.file.externalDataDirectory + url;  
      } else {
          fileURL = this.file.dataDirectory + url;
          //fileURL = this.file.syncedDataDirectory + url;
      }

    	const fileTransfer: FileTransferObject = this.transfer.create();
	    fileTransfer.download(uri, fileURL).then((entry) => {
	      //console.log("download complete: " + entry.toURL());
        this.subcategoryList[this.subCnt].cordova_image = this.webview.convertFileSrc(entry.toURL());
	      this.subCnt++;
        if(this.subCnt >= this.subcategoryList.length) {
          if(this.loading) {
            this.loading.dismiss();
          }
          this.global.bDownloadSub = true;
          window.localStorage.setItem('bDownloadSub', '1');
          let now: any = new Date();
          window.localStorage.setItem("allSubCategoryDate", now.getTime());
          let data = JSON.stringify(this.subcategoryList);
          this.storage.set('allSubCategoryDate', now.getTime());
          this.storage.set('allSubCategory', data);
          return ;
        }
        var _url = this.subcategoryList[this.subCnt].sub_image
        this.processDownloadSubCat(_url);
		  }, (error) => {
		    // handle error
        this.subcategoryList[this.subCnt].cordova_image = null;
		    this.subCnt++;
        if(this.subCnt >= this.subcategoryList.length) {
          if(this.loading) {
            this.loading.dismiss();
          }
          this.global.bDownloadSub = true;
          window.localStorage.setItem('bDownloadSub', '1');
          let now: any = new Date();
          window.localStorage.setItem("allSubCategoryDate", now.getTime());
          let data = JSON.stringify(this.subcategoryList);
          this.storage.set('allSubCategoryDate', now.getTime());
          this.storage.set('allSubCategory', data);
          return ;
        }
        var _url = this.subcategoryList[this.subCnt].sub_image
        this.processDownloadSubCat(_url);
		  });
    } else {

			//Works on browser version
    	this.global.toDataURL(uri, (dataUrl) => {
       	//console.log(dataUrl);
       	this.subcategoryList[this.subCnt].local_image = dataUrl;
       	this.subCatImageList.push(dataUrl);
        this.subCnt++;
	      if(this.subCnt >= this.subcategoryList.length) {
          if(this.loading) {
            this.loading.dismiss();
          }

          let now: any = new Date();
          window.localStorage.setItem("allSubCategoryDate", now.getTime());
          let data = JSON.stringify(this.subcategoryList);
          this.storage.set('allSubCategoryDate', now.getTime());
          this.storage.set('allSubCategory', data);

	      	//localStorage.setItem("subCatImageList", JSON.stringify(this.subCatImageList));
	        window.localStorage.setItem('bDownloadSub', '1');
	        this.global.bDownloadSub = true;
	        return ;
	      }
	      let _url = this.subcategoryList[this.subCnt].sub_image;
	      this.processDownloadSubCat(_url);
      });
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

    this.global.allSubcategoryList.forEach(item => {
      if(parseInt(item.list_id) == parseInt(lastEntry.sub_category)) {
        subCatName = item.name;
      }
    })

    localStorage.setItem("mainCategoryIdx", lastEntry.main_category);
    localStorage.setItem("mainCategoryName", mainCatName);
    localStorage.setItem("subCategoryIdx", lastEntry.sub_category);
    localStorage.setItem("subCategoryName", subCatName);

    this.router.navigateByUrl("/activity");
  }

}
