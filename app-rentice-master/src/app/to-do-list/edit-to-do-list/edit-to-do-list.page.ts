import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
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
  selector: 'app-edit-to-do-list',
  templateUrl: './edit-to-do-list.page.html',
  styleUrls: ['./edit-to-do-list.page.scss'],
})
export class EditToDoListPage implements OnInit {

	data: any = {};
	user: any = {};
	currentTodolist: any;
	imgURL: any;
	inventoryImg: any;
	addressList: any = [];
	uploadLoading: any;
	showButton: boolean = false;
	loading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController,
              private storage: Storage,
              private translate: TranslateService,
  						public global: GlobalProvider) { }

  ngOnInit() {
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.imgURL = '';
    this.currentTodolist = JSON.parse(localStorage.getItem("currentTodolist"));
    this.data = {
        id: this.currentTodolist.id,
        list_no: this.currentTodolist.list_no,
        list_name: this.currentTodolist.list_name,
        //project_no: this.currentTodolist.project_no,
        date1: this.currentTodolist.date1,
        date2: this.currentTodolist.date2,
        status: this.currentTodolist.status,
        notes1: this.currentTodolist.notes1,
        image: this.currentTodolist.image
    };
    this.inventoryImg = null;

    if(!this.data.image || this.data.image === '') {
        this.showButton = true;
    } else {
        this.showButton = false;
    }
    /*if($rootScope.inventoryImg) {
        //this.inventoryImg = $rootScope.inventoryImg;
    }*/
    this.loadUserData();
    
    this.getAddress();
 	}

	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

	async getAddress() {
      this.addressList = this.global.allAddressList;

      setTimeout(() => {
        this.data.project_no = this.currentTodolist.project_no;
        this.cdRef.detectChanges();
      }, 100);
      this.cdRef.detectChanges();
      if(this.addressList.length > 0) {
        return ;
      }
			const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;

      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.get(url).subscribe((resp:any) => {
          loading.dismiss();
          if(resp.error == true) {
              this.global.displayAlert('There is an error when get address');
              return ;
          }
          this.addressList = resp.data;
          var now = new Date();
          window.localStorage.setItem("addressDate", now.getTime());
          var data = JSON.stringify(this.addressList);
          window.localStorage.setItem("address", data);
          this.storage.set('addressDate', now.getTime());
          this.storage.set('address', data);
          this.global.allAddressList = resp.data;
      }, function () {
          loading.dismiss();
          this.global.displayAlert('There is an error when get address');
      });
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
      const data = {
          id: this.data.id.toString(),
          list_name: this.data.list_name,
          project_no: this.data.project_no,
          date1: this.data.date1,
          date2: this.data.date2,
          status: this.data.status,
          notes1: this.data.notes1,
          image: this.imgURL
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_todolist.php";
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error === true) {
					    this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
              return ;
          }
          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('Todo list has been updated.'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
                  localStorage.setItem("bLoadTodolist", '1');
			            this.router.navigateByUrl('/to-do-list');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
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
	    const url = "https://www.artisanideas.co.nz/api/app-rentice/project_imgUpload.php";
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


	doRemove () {
		this.alertController.create({
      header: 'Alert',
      message: 'Are you sure to remove this item?',
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
						let data = {
                id: this.data.id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_todolist.php";
            this.loadingController.create({
				      message: 'Removing...',
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert("There is an error when remove todo list.");
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Success'),
						      message: this.translate.instant('Todo List is removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            localStorage.setItem('bLoadTodolist', '1');
						            this.router.navigateByUrl('/to-do-list');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });                
            }, (err) => {
                this.loading.dismiss();
						    this.global.displayAlert("There is an error when remove todo list.");
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });
  }
}
