import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

declare var window;
declare var navigator;

import {
  File
} from '@ionic-native/file/ngx';

import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';

import { Camera } from '@ionic-native/camera/ngx';
@Component({
  selector: 'app-another-to-do-list-item',
  templateUrl: './another-to-do-list-item.page.html',
  styleUrls: ['./another-to-do-list-item.page.scss'],
})
export class AnotherToDoListItemPage implements OnInit {

	data: any = {};
	user: any = {};
	imgURL: any;
	inventoryImg: any;
	listitemCnt: any;
	currentTodolist: any;
	uploadLoading: any;
  currentItem: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController,
              private translate: TranslateService,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	ionViewWillEnter() {
		console.log("==enter another new todo list  item page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
		this.listitemCnt = localStorage.getItem("listitemCnt");
		this.currentTodolist = JSON.parse(localStorage.getItem("currentTodolist"));
    this.currentItem = this.global.newTodoListItem;
    console.log(this.currentItem);
		this.data = {
      user_id: '',
      list_no: this.currentTodolist.list_no,
      item_no: this.listitemCnt + 2,
      item_name: this.currentItem.item_name,
      room1: this.currentItem.room1,
      room2: this.currentItem.room2,
      assigned: this.currentItem.item_name,
      date1: this.currentItem.date1,
      date2: this.currentItem.date2,
      status: 'Not Started',
      notes1: this.currentItem.notes1,
      notes2: this.currentItem.notes2,
      image: this.currentItem.image,
      showDates: this.currentItem.showDates
    };
    this.imgURL = '';
    this.inventoryImg = null;

    /*if($rootScope.inventoryImg) {
        //this.inventoryImg = $rootScope.inventoryImg;
    }*/
    this.loadUserData();
  }

	loadUserData() {
      if(this.user) {
          this.data.tutor = this.user.tutor;
          this.data.user_id = this.user.user_id;
          this.data.faculty = this.user.faculty;
          this.data.provider = this.user.provider;
          return ;
      }
      let user = window.localStorage.getItem("user");
      if(user !== null && user !== undefined && user !== "") {
          try {
              this.user = JSON.parse(user);
          }catch(e){
              this.user = {};
          }
      }
      if(this.user) {
          this.data.tutor = this.user.tutor;
          this.data.user_id = this.user.user_id;
          this.data.faculty = this.user.faculty;
          this.data.provider = this.user.provider;
      }  
  }

	openCamera() {
    this.actionSheetCtrl.create({
      header: this.translate.instant('Select Image Source'),
      buttons: [
        {
          text: this.translate.instant('Take Picture'),
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: this.translate.instant('Choose from gallery'),
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel'
        }
      ]
    }).then((actionSheet) => {
    	actionSheet.present();
    });
  }

  takePicture(sourceType) {
      let options = {
          quality: 75,
          destinationType: this.camera.DestinationType.DATA_URL,
          sourceType: sourceType,
          encodingType: this.camera.EncodingType.JPEG,
          allowEdit : false, 
          targetWidth: 400,
          targetHeight: 300,
          saveToPhotoAlbum: false,
          correctOrientation: true,
      };

			this.camera.getPicture(options).then((imageData) => {
	      // Special handling for Android library
				this.inventoryImg = "data:image/jpeg;base64," + imageData;
	      setTimeout(() => {
	         this.inventoryImg = "data:image/jpeg;base64," + imageData;
	      }, 100);
	      let now = new Date();
	      let today: any  = now.toISOString().substr(0, 19);
	      today = this.replaceAll(today, "-", "");
	      today = this.replaceAll(today, "T", "_");
	      today = this.replaceAll(today, ":", "");
	      let imgURL = today + "_" + now.getTime();
	      this.imgURL = imgURL+".jpg"; 
	    }, (err) => {
	      
	    });
  }

  async saveData() {
      console.log(this.data);
      let data = {
          user_id: this.data.user_id.toString(),
          list_no: this.data.list_no.toString(),
          item_no: this.data.item_no,
          item_name: this.data.item_name,
          room1: this.data.room1,
          room2: this.data.room2,
          assigned: this.data.assigned,
          date1: this.data.showDates ? this.data.date1 : "",
          date2: this.data.showDates ? this.data.date2 : "",
          status: this.data.status,
          notes1: this.data.notes1,
          notes2: this.data.notes2,
          image: this.imgURL
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/add_listitem.php";
      const loading = await this.loadingController.create({
	      message: 'Saving...',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
      		loading.dismiss();
          console.log(resp);
          if(resp.error == true) {
          		this.alertController.create({
					      header: 'Alert',
					      message: 'Sorry we could not upload your entry, please try again later.',
					      buttons: ['OK']
					    }).then((alert) => {
					    	alert.present();
					    });
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('Todo list item has been created.'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
                  localStorage.setItem("bLoadListitem", '1');
			            this.router.navigateByUrl('/view-to-do-list');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, function () {
          loading.dismiss();
          this.alertController.create({
			      header: 'Alert',
			      message: 'Sorry we could not upload your entry, please try again later.',
			      buttons: ['OK']
			    }).then((alert) => {
			    	alert.present();
			    });
      });         
  }

 	async uploadImage() {
			if(!this.inventoryImg) {
          this.saveData();
          return ;
      }
      const imageData = this.inventoryImg;
	    const imgURL = this.imgURL;

	    const option: FileUploadOptions = {
	        fileKey: 'file',
	        fileName: imgURL,
	        httpMethod: 'post',
	        chunkedMode: false,
	        mimeType: 'image/jpeg',
	        params: {
	            'value1': imgURL,
	            'value2' : "param"
	        }
	    };

      const fileTransfer: FileTransferObject = this.transfer.create();

	    this.uploadLoading = await this.loadingController.create({
	      message: '',
	    });
	    await this.uploadLoading.present();
	    const url = "https://www.artisanideas.co.nz/api/app-rentice/inventory_imgUpload.php";
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
	      this.alertController.create({
		      header: 'Alert',
		      message: 'We could not upload your photo, please try again later.',
		      buttons: ['OK']
		    }).then((alert) => {
		    	alert.present()
		    });
	    });

			fileTransfer.onProgress((progressEvent) => {
	      console.log(progressEvent);
	      if (progressEvent.lengthComputable) {
	        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
	      } else {
	      }
	    });
  }

  doSave() {
    this.uploadImage();
  }
}
