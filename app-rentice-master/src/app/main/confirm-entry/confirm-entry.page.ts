import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ImagesProvider } from '../../services/images.images';
import { GlobalProvider } from '../../services/global-provider';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { TranslateService } from '@ngx-translate/core';

declare var window;
declare var navigator;
declare var Camera;
declare var ga;

import {
  File
} from '@ionic-native/file/ngx';

import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-confirm-entry',
  templateUrl: './confirm-entry.page.html',
  styleUrls: ['./confirm-entry.page.scss'],
})
export class ConfirmEntryPage implements OnInit {

	inventoryImg: any;
	data: any = {};
	user: any = {};
	imgURL: string = "";
	uploadLoading: any = null;
  imageList: any = [];

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private transfer: FileTransfer,
  						public file: File,
              private _IMAGES   : ImagesProvider,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Confirm Entry Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Confirm Entry Page');
        }
      }
    } catch(e) {
      console.log(e)
    }

  	console.log("==confirm activity entry===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	this.data = this.global.inventoryData;
    this.inventoryImg = this.global.inventoryImg;
    this.imgURL = "";
    this.imageList = [];
  }

  replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

  async uploadImage(bReturn = false) {
      /*if(!this.inventoryImg || this.inventoryImg == 'null') {
          this.saveData();
          return ;
      }*/
      if(this.data.imageList.length < 1) {
          this.saveData(bReturn);
          return ;
      } else {
          this.doUploadImage(bReturn);
          return ;
      }
      let imageData = this.inventoryImg;
      let now = new Date();
      let today = now.toISOString().substr(0, 19);
      today = this.replaceAll(today, "-", "");
      today = this.replaceAll(today, "T", "_");
      today = this.replaceAll(today, ":", "");
      let imgURL = today + "_" + now.getTime();
      
      this.imgURL = imgURL+".jpg";

      let option: FileUploadOptions = {
          fileKey: 'file',
          fileName: imgURL,
          httpMethod: 'post',
          chunkedMode: false,
          mimeType: 'image/jpeg',
          params: {
              'value1': imgURL,
              'value2' : "param"
          }
      }

      const fileTransfer: FileTransferObject = this.transfer.create();

      this.uploadLoading = await this.loadingController.create({
	      message: '',
	    });
	    await this.uploadLoading.present();
      let url = "https://www.artisanideas.co.nz/api/app-rentice/inventory_imgUpload.php";

      fileTransfer.upload(imageData, encodeURI(url), option).then(data => {
				if(this.uploadLoading) {
	    		this.uploadLoading.dismiss();
	    	}
	      this.saveData();
      }, err => {
      	if(this.uploadLoading) {
	    		this.uploadLoading.dismiss();
	    	}
	      console.log("An error has occurred: Code = " + err.code);
      });

      fileTransfer.onProgress((progressEvent) => {
	      console.log(progressEvent);
	      if (progressEvent.lengthComputable) {
	        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
	      } else {
	      }
	    });
  }

  async doUploadImage(bReturn = false) {
    let n = 0;
    let uploadLoading = await this.loadingController.create({
      message: 'Uploading images...',
    });
    await uploadLoading.present();
    for(let i=0;i<this.data.imageList.length;i++) {

       this._IMAGES
       .uploadImageSelection(this.data.imageList[i].data,
                             this.data.imageList[i].name)
       .subscribe((res) =>
       {
          if(n>=this.data.imageList.length - 1) {
             this.saveData();
             uploadLoading.dismiss();
          }
          n++;
          console.log(res.success);
       },
       (error : any) =>
       {
          uploadLoading.dismiss();
          this.global.displayAlert("There is an error while uploading images, Try again.");
          console.log(error.success);
       });
    }
  }
    
  async saveData(bReturn = false) {
      let data = {
          provider: this.data.provider,
          faculty: this.data.faculty,
          tutor: this.data.tutor,
          user_id: this.data.user_id.toString(),
          main_category: this.data.main_category,
          sub_category: this.data.sub_category,
          inventory_item: this.data.inventory_item,
          inventory_item2: this.data.inventory_item2,
          inventory_item3: this.data.inventory_item3,
          address: this.data.address,
          inventory_value: this.data.inventory_value,
          inventory_purchased: this.data.inventory_purchased,
          notes: this.data.notes,
          inventory_image: this.data.imageList[0] ? this.data.imageList[0].name : "",
          inventory_image2: this.data.imageList[1] ? this.data.imageList[1].name : "",
          inventory_image3: this.data.imageList[2] ? this.data.imageList[2].name : "",
          tutor_check: "",
          tutor_notes: "",
          approved: "",
          boss_check: "",
          boss_notes: ""
      };
      
      let url = "https://www.artisanideas.co.nz/api/app-rentice/add_inventory.php";
      const loading = await this.loadingController.create({
	      message: 'Saving...',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp);
          if(resp.error === true) {
              this.global.displayAlert("There is an error while save your entry on inventory table.");
              return ;
          }
          
          this.global.allStudentLogList.unshift(data);

          this.sendNotification();

          if(this.data.savetimesheet == true || this.data.savetimesheet == "true") {
              this.saveTimesheet(bReturn);
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Great Success!'),
			      message: this.translate.instant('Your entry has been successfully saved'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
			            this.inventoryImg = null;
			            localStorage.setItem("inventoryImg", null);
                  localStorage.setItem("bLoadStudentLog", '1');
                  if(bReturn) {
                      this.router.navigateByUrl('/main');
                  } else {
                     this.router.navigateByUrl('/another-entry');
                  }
                  
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error while save your entry on inventory table.");
      });
  }

  sendNotification() {
    let data = {
      user_id: this.data.user_id.toString(),
      type: "studentlog"
    };
    let url = "https://www.artisanideas.co.nz/api/app-rentice/notify_studentlog.php";
    this.http.post(url, data).subscribe((resp: any) => {
        console.log(resp);
    }, (err) => {
    });
  }

  async saveTimesheet(bReturn) {
      let data = {
          user_id: this.data.user_id.toString(),
          main_category: this.data.main_category,
          sub_category: this.data.sub_category,
          activity: this.data.inventory_item,
          address: this.data.address,
          hours: this.data.inventory_value,
          date: this.data.inventory_purchased,
          notes: this.data.notes,
          image: this.imgURL,
          starttime: this.data.starttime,
          finishtime: this.data.finishtime
      };
      
      let url = "https://www.artisanideas.co.nz/api/app-rentice/add_timesheet_from_inventory.php";
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp);
          if(resp.error == true) {
              this.global.displayAlert("There is an error while save your entry on timesheet table.");
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Great Success!'),
			      message: this.translate.instant('Your entry has been successfully saved'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            this.inventoryImg = null;
			            localStorage.setItem("inventoryImg", null);
                  localStorage.setItem("bLoadStudentLog", '1');
                  localStorage.setItem("bloadTimesheet", '1');
                  if(bReturn) {
                      this.router.navigateByUrl('/main');
                  } else {
                     this.router.navigateByUrl('/another-entry');
                  }
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error while save your entry on timesheet table.");
      });        
  }
    
  saveOnLocal() {
      let localData = window.localStorage.getItem("inventory");
      let inventoryList = [];
      if(localData != null && localData != undefined && localData != "") {
        inventoryList = JSON.parse(localData);
      }
      if(inventoryList.length > 4) {
          this.global.displayAlert('You can not save more than 5 entries to the device, Please try later we your back online.');
          return ;
      }
      let imgURL = "";
      if(this.inventoryImg != null && this.inventoryImg != "") {
          let now = new Date();
          let today = now.toISOString().substr(0, 19);
          today = this.replaceAll(today, "-", "");
          today = this.replaceAll(today, "T", "_");
          today = this.replaceAll(today, ":", "");
          imgURL = today + "_" + now.getTime();
          imgURL = imgURL + ".jpg";
      }
      let data = {
          provider: this.data.provider,
          faculty: this.data.faculty,
          tutor: this.data.tutor,
          user_id: this.data.user_id.toString(),
          main_category: this.data.main_category,
          sub_category: this.data.sub_category,
          inventory_item: this.data.inventory_item,
          address: this.data.address,
          inventory_value: this.data.inventory_value,
          inventory_purchased: this.data.inventory_purchased,
          notes: this.data.notes,
          inventory_image: imgURL,
          img_data: this.inventoryImg,
          savetimeshset: this.data.savetimesheet
      };
      
      inventoryList.push(data);
      let saveData = JSON.stringify(inventoryList);
      window.localStorage.setItem("inventory", saveData);
  }

  doSave() {
      /*if(navigator.onLine == false) {
      	this.alertController.create({
		      header: 'Alert',
		      message: 'Network is not available now, Entry will be saved to your device',
		      buttons: [{
		          text: 'Okay',
		          handler: () => {
		            console.log('Confirm Okay');
		            this.saveOnLocal();
                this.router.navigateByUrl('/another-entry');
              	//$state.go("anotherEntry");
		          }
		        }
		      ]
		    }).then((alert) => {
		    	alert.present();
		    });
          
        return ;
      }*/
      this.uploadImage();
  }

  doSaveAndReturn() {
      this.uploadImage(true);
  }

  doSaveAndAnother() {
    
  }
}
