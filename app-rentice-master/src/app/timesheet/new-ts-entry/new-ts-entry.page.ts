import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
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
  selector: 'app-new-ts-entry',
  templateUrl: './new-ts-entry.page.html',
  styleUrls: ['./new-ts-entry.page.scss'],
})
export class NewTsEntryPage implements OnInit {

	data: any = {};
	user: any = {};
	mainCategory: any;
	subCategory: any;
	timesheetImg: any;
	addressList: any = [];
	imgURL: any;
	uploadLoading: any;

  isCordova: boolean = false;
  public image : string;
  public imageList: any = [];
  public isSelected : boolean     =  false;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private cdRef: ChangeDetectorRef,
  						private transfer: FileTransfer,
              private translate: TranslateService,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController,
              private _IMAGES: ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

  ionViewWillEnter() {
  	console.log("==enter new timesheet page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

    this.data = {
	      user_id: '',
	      timesheet_date: new Date().toISOString().substr(0, 10),
	      starttime: "08:00",
	      finishtime: this.global.roundTime(),
	      main_category: this.mainCategory,
	      sub_category: this.subCategory,
	      address: '',
	      hours: '1',
	      notes: '',
	      timesheet_image: ''
	  };
	  this.timesheetImg = null;
    this.isCordova = this.global.isCordova;
    this.imageList = [];

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
    if(this.addressList.length > 0) {
      this.addressList = this.addressList.filter(item => {
        return item.completed != '1' || item.completed != 1
      })
      return ;
    }
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
            this.global.displayAlert('There is an error when get tool.');
            return ;
        }
        this.addressList = resp.data;

        this.addressList = this.addressList.filter(item => {
          return item.completed != '1' || item.completed != 1
        })
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There is an error when get tool.');
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

	async doSaveData() {
        var data = {
            user_id: this.data.user_id.toString(),
            address: this.data.address,
            date: this.data.timesheet_date,
            starttime: this.data.starttime,
            finishtime: this.data.finishtime,
            hours: this.data.hours,
            notes: this.data.notes,
            image: this.imageList[0] ? this.imageList[0].name : "",
            image2: this.imageList[1] ? this.imageList[1].name : "",
            image3: this.imageList[2] ? this.imageList[2].name : "",
        };
        console.log(data);
        const url = "https://www.artisanideas.co.nz/api/app-rentice/add_timesheet.php";
        const loading = await this.loadingController.create({
		      message: 'Saving...',
		    });
		    await loading.present();
        this.http.post(url, data).subscribe((resp: any) => {
          	loading.dismiss();
            console.log(resp);
            if(resp.error === true) {
                this.global.displayAlert('Sorry, we could not upload your timesheet, please try again later.');
                return ;
            }

            this.alertController.create({
				      header: this.translate.instant('Success'),
				      message: this.translate.instant('Timesheet has been created successfully'),
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
            this.global.displayAlert('Sorry, we could not upload your timesheet, please try again later.');
        });         
  }

	async doSave() {
      console.log(this.data);
      if(this.data.address.length < 1) {
        this.global.displayAlert("Please select Project.")
        return ;
      }
      if(this.imageList.length < 1) {
          this.doSaveData();
          return ;
      } else {
          this.doUploadImage();
          return ;
      }
      let imageData = this.timesheetImg;

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
        this.global.displayAlert('We could not upload your photo, please try again later.');
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
    for(let i=0;i<this.imageList.length;i++) {

       this._IMAGES
       .uploadImageSelection(this.imageList[i].data,
                             this.imageList[i].name)
       .subscribe((res) =>
       {
          if(n>=this.imageList.length - 1) {
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
     if(this.imageList.length > 2) {
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
           this.isSelected   = true
           this.image       = res;
           let now = new Date();
           let today = now.toISOString().substr(0, 19);
            today = this.replaceAll(today, "-", "");
            today = this.replaceAll(today, "T", "_");
            today = this.replaceAll(today, ":", "");
            let imgURL = today + "_" + now.getTime();

           this.imageList.push({
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
