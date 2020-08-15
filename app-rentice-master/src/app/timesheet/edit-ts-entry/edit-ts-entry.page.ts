import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ImagesProvider } from '../../services/images.images';
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
  selector: 'app-edit-ts-entry',
  templateUrl: './edit-ts-entry.page.html',
  styleUrls: ['./edit-ts-entry.page.scss'],
})
export class EditTsEntryPage implements OnInit {

	data: any = {};
	user: any = {};
	uploadLoading: any;
  showButton: boolean = false;
  currentTimesheet: any = {};
  timesheetImg: any;
  addressList: any = [];
  imgURL: any;
  loading: any;
  imageList: any = [];
  imageNewList: any = [];
  isCordova: boolean = false;

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
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider,
              private translate: TranslateService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  	console.log("==timesheet edit page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
  	this.currentTimesheet = JSON.parse(localStorage.getItem("currentTimesheet"));
    console.log(this.currentTimesheet);
    this.data = {
        user_id: '',
        tutor: '',
        faculty: '',
        provider: '',
        timesheet_date: this.currentTimesheet.date,
        starttime: this.currentTimesheet.starttime,
        finishtime: this.currentTimesheet.finishtime,
        address: this.currentTimesheet.address,
        hours: this.currentTimesheet.hours,
        notes: this.currentTimesheet.notes,
        image: this.currentTimesheet.image,
        image2: this.currentTimesheet.image2,
        image3: this.currentTimesheet.image3,
    };
    
    this.imageList = [];
    this.imageNewList = [];
    this.isCordova = this.global.isCordova;


    if(this.data.image && this.data.image.length > 0) {
      this.imageList.push({
         data: this.data.image,
         name: this.data.image
      });
    }
    if(this.data.image2 && this.data.image2.length > 0) {
      this.imageList.push({
         data: this.data.image2,
         name: this.data.image2
      });
    }
    if(this.data.image3 && this.data.image3.length > 0) {
      this.imageList.push({
         data: this.data.image3,
         name: this.data.image3
      });
    }

    if(!this.data.image || this.data.image === '') {
        this.showButton = true;
    } else {
        this.showButton = false;
    }
    this.timesheetImg = null;

    this.cdRef.detectChanges();

    this.loadUserData();
    this.getAddress();
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
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

	async getAddress() {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
    this.addressList = [];
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error === true) {
            this.global.displayAlert("There is an error when get project");
            return ;
        }
        this.addressList = resp.data;
        let idx = 0;
        this.addressList.forEach((item) => {
          if(item.address == this.data.address) {
            idx = item.list_id;
          }
        });
        setTimeout(() => {
          this.data.address = idx;
          this.cdRef.detectChanges();
        }, 500);
        this.cdRef.detectChanges();
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert("There is an error when get project");
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
				this.timesheetImg = "data:image/jpeg;base64," + imageData;
	      setTimeout(() => {
	         this.timesheetImg = "data:image/jpeg;base64," + imageData;
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

	doRemove() {
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
                id: this.currentTimesheet.id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_timesheet.php";
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
                    this.global.displayAlert('There is an error when remove timesheet.')
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Success'),
						      message: this.translate.instant('Timesheet is removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            localStorage.setItem('bloadTimesheet', '1');
						            this.router.navigateByUrl('/timesheet');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });                
            }, (err) => {
                this.loading.dismiss();
                this.global.displayAlert('There is an error when remove timesheet.')
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });    
  }

	async doSaveData() {
      console.log(this.data);

      let address = "";
      this.addressList.forEach((item) => {
        if(item.list_id == this.data.address) {
          address = item.address;
          return ;
        }
      });
      let data = {};
      if(this.imageNewList.length > 0) {
        data = {
            id: this.currentTimesheet.id,
            user_id: this.data.user_id.toString(),
            address: address,
            date: this.data.timesheet_date,
            starttime: this.data.starttime,
            finishtime: this.data.finishtime,
            hours: this.data.hours,
            notes: this.data.notes,
            image: this.imageNewList[0] ? this.imageNewList[0].name : "",
            image2: this.imageNewList[1] ? this.imageNewList[1].name : "",
            image3: this.imageNewList[2] ? this.imageNewList[2].name : ""
        };
      } else {
        data = {
            id: this.currentTimesheet.id,
            user_id: this.data.user_id.toString(),
            address: address,
            date: this.data.timesheet_date,
            starttime: this.data.starttime,
            finishtime: this.data.finishtime,
            hours: this.data.hours,
            notes: this.data.notes,
        };
      }

      console.log(data);
      var url = "https://www.artisanideas.co.nz/api/app-rentice/update_timesheet.php";
      const loading = await this.loadingController.create({
	      message: 'Saving...',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
        	loading.dismiss();
          console.log(resp);
          if(resp.error === true) {
              this.global.displayAlert('Sorry we could not upload your timesheet, please try again later.')
              return ;
          }
          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: 'Timesheet has been uploaded successfully',
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
			            localStorage.setItem("bloadTimesheet", '1');
			            this.router.navigateByUrl('/timesheet');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });          
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('Sorry we could not upload your timesheet, please try again later.')
      });
  }

	async doSave() {
      /*if(!this.timesheetImg) {
          this.doSaveData();
          return ;
      }*/
      if(this.imageNewList.length < 1) {
        this.doSaveData();
          return ;
      } else {
          this.doUploadImage();
          return ;
      }
      let imageData = this.timesheetImg;
      let imgURL = this.imgURL;

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
	    };
      
      const fileTransfer: FileTransferObject = this.transfer.create();
      this.uploadLoading = await this.loadingController.create({
	      message: '',
	    });
	    await this.uploadLoading.present();
      const url = "https://www.artisanideas.co.nz/api/app-rentice/record_imgUpload.php";
      fileTransfer.upload(imageData, encodeURI(url), option).then(data => {
				if(this.uploadLoading) {
	    		this.uploadLoading.dismiss();
	    	}
	      this.doSaveData();
	    }, err => {
	    	if(this.uploadLoading) {
	    		this.uploadLoading.dismiss();
	    	}
	      console.log("An error has occurred: Code = " + err.code);
        this.global.displayAlert('We could not upload your photo, please try again later.')
	    });

			fileTransfer.onProgress((progressEvent) => {
	      console.log(progressEvent);
	      if (progressEvent.lengthComputable) {
	        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
	      } else {
	      }
	    });
  }

  async doUploadImage() {
    let n = 0;
    let uploadLoading = await this.loadingController.create({
      message: 'Uploading images...',
    });
    await uploadLoading.present();
    for(let i=0;i<this.imageNewList.length;i++) {

       this._IMAGES
       .uploadImageSelection(this.imageNewList[i].data,
                             this.imageNewList[i].name)
       .subscribe((res) =>
       {
          if(n>=this.imageNewList.length - 1) {
             this.doSaveData();
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

  selectFileToUpload(event) : void {
     if(this.imageNewList.length > 2) {
       this.global.displayAlert('You can upload up to 3 images.');
       return ;
     }
     this._IMAGES
     .handleImageSelection(event)
     .subscribe((res) => {
        // Retrieve the file type from the base64 data URI string
        let _SUFFIX       = res.split(':')[1].split('/')[1].split(";")[0];

        // Do we have correct file type?
        if(this._IMAGES.isCorrectFileType(_SUFFIX)) {
           // Hide the file input field, display the image in the component template
           // and display an upload button
           let now = new Date();
           let today = now.toISOString().substr(0, 19);
            today = this.replaceAll(today, "-", "");
            today = this.replaceAll(today, "T", "_");
            today = this.replaceAll(today, ":", "");
            let imgURL = today + "_" + now.getTime();

           this.imageNewList.push({
             ext: _SUFFIX,
             data: res,
             name: imgURL + "." + _SUFFIX
           });
           this.cdRef.detectChanges();
        } else {
           this.global.displayAlert('You need to select an image file with one of the following types: jpg, gif or png');
        }
     }, (error) => {
        console.dir(error);
        console.log(error.message);
     });
  }
}
