import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Platform, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { GlobalProvider } from '../../services/global-provider';
import { ImagesProvider } from '../../services/images.images';
import { TranslateService } from '@ngx-translate/core';

declare var window;

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
  selector: 'app-new-portfolio',
  templateUrl: './new-portfolio.page.html',
  styleUrls: ['./new-portfolio.page.scss'],
})
export class NewPortfolioPage implements OnInit {

	data: any = {};
	user: any = {};
	inventoryImg: any;
	addressList: any = [];
	imgURL: any;
	portfoliolistCnt: any = 0;
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
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController,
              private storage: Storage,
              private _IMAGES: ImagesProvider,
              private translate: TranslateService,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
		console.log("==enter new portfolio page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
		this.portfoliolistCnt = localStorage.getItem("portfoliolistCnt");
		this.data = {
        list_no: parseInt(this.portfoliolistCnt) + 1,
        user_id: '',
        name: '',
        project_no: '',
        date1: new Date().toISOString().substr(0, 10),
        date2: new Date().toISOString().substr(0, 10),
        status: 'Not Started',
        notes1: '',
        image: ''
    };
    this.isCordova = this.global.isCordova;
    this.inventoryImg = null;

    this.loadUserData();
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
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
        this.imageList = [];
        this.imgURL = this.global.todayString() +".jpg";
        this.imageList.push({
           ext: 'jpeg',
           data: "data:image/jpeg;base64," + imageData,
           name: this.imgURL
        });
	    }, (err) => {
	      
	    });
  }

	async saveData() {
      console.log(this.data);
      const data = {
          user_id: this.data.user_id.toString(),
          name: this.data.name,
          project_no: this.data.project_no,
          date1: this.data.date1,
          date2: this.data.date2,
          notes1: this.data.notes1,
          image: this.imgURL
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/add_portfolio.php";
      const loading = await this.loadingController.create({
	      message: ''
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
      		loading.dismiss();
          console.log(resp);
          if(resp.error == true) {
              this.global.displayAlert('Sorry we could not upload your entry, please try again later.');
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('Portfolio has been created.'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
                  localStorage.setItem("bLoadPortfolio", '1');
			            this.router.navigateByUrl('/portfolio');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('Sorry we could not upload your entry, please try again later.');
      });         
  }

	async doSave() {
      if(this.imageList.length < 1) {
          this.saveData();
          return ;
      } else {
          this.doUploadImage();
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
	      message: this.translate.instant('Uploading images...')
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
        this.global.displayAlert('We could not upload your photo, please try again later.',)
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
      message: this.translate.instant('Uploading images...')
    });
    await uploadLoading.present();
    for(let i=0;i<this.imageList.length;i++) {

       this._IMAGES
       .uploadImageSelection(this.imageList[i].data,
                             this.imageList[i].name)
       .subscribe((res) =>
       {
          if(n>=this.imageList.length - 1) {
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

  selectFileToUpload(event) : void {
     /*if(this.imageList.length > 2) {
       this.global.displayAlert('You can upload up to 3 images.');
       return ;
     }*/
     this.imageList = [];
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
          this.imgURL = imgURL + "." + _SUFFIX
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
