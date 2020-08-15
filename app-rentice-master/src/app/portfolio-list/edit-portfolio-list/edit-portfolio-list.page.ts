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
  selector: 'app-edit-portfolio-list',
  templateUrl: './edit-portfolio-list.page.html',
  styleUrls: ['./edit-portfolio-list.page.scss'],
})
export class EditPortfolioListPage implements OnInit {

	data: any = {};
	user: any = {};
	currentPortfolio: any;
	imgURL: any;
	inventoryImg: any;
	addressList: any = [];
	uploadLoading: any;
	showButton: boolean = false;
	loading: any;

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

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.imgURL = '';
    this.currentPortfolio = JSON.parse(localStorage.getItem("currentPortfolio"));
    this.data = {
        list_id: this.currentPortfolio.list_id,
        list_no: this.currentPortfolio.list_no,
        name: this.currentPortfolio.name,
        date1: this.currentPortfolio.date1,
        date2: this.currentPortfolio.date2,
        notes1: this.currentPortfolio.notes1,
        image: this.currentPortfolio.image
    };

    this.isCordova = this.global.isCordova;
    this.imageList = [];
    this.inventoryImg = null;

    if(!this.data.image || this.data.image === '') {
        this.showButton = true;
    } else {
        this.showButton = false;
    }

    this.loadUserData();

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
          list_id: this.data.list_id.toString(),
          name: this.data.name,
          date1: this.data.date1,
          date2: this.data.date2,
          notes1: this.data.notes1,
          image: this.imgURL
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_portfolio.php";
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
			      message: this.translate.instant('Portfolio has been updated.'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
			            this.router.navigateByUrl('/portfolio-list');
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
    //this.uploadImage();
    if(this.imageList.length < 1) {
        this.saveData();
        return ;
    } else {
        this.doUploadImage();
        return ;
    }
  }

	doRemove () {
		this.alertController.create({
      header: this.translate.instant('Alert'),
      message: this.translate.instant('Are you sure to remove this item?'),
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
                id: this.data.list_id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_portfolio.php";
            this.loadingController.create({
				      message: this.translate.instant('Removing...')
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert("There is an error when remove portfolio.");
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Success'),
						      message: this.translate.instant('Portfolio is removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            localStorage.setItem('bLoadPortfolio', '1');
						            this.router.navigateByUrl('/portfolio');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });                
            }, (err) => {
                this.loading.dismiss();
						    this.global.displayAlert("There is an error when remove portfolio.");
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });
  }

  selectFileToUpload(event) : void {
     /*if(this.imageList.length > 2) {
       this.global.displayAlert('You can upload up to 3 images.');
       return ;
     }*/
     this.inventoryImg = null;
     this.data.image = null;
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
