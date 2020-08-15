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
  selector: 'app-edit-tool',
  templateUrl: './edit-tool.page.html',
  styleUrls: ['./edit-tool.page.scss'],
})
export class EditToolPage implements OnInit {
	user: any = {};
	data: any = {};
	currentTool: any;
	bShowButton: boolean = false;
	loading: any;
	imgURL: any;
	toolImg: any;
	uploadLoading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
              private translate: TranslateService,
              public global: GlobalProvider,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==student edit page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

	  this.currentTool = JSON.parse(localStorage.getItem("currentTool"));
    console.log(this.currentTool);

    this.data = {
        id: this.currentTool.id,
        user_id: '',
        type: this.currentTool.type,
        brand: this.currentTool.brand,
        model: this.currentTool.model,
        serial: this.currentTool.serial,
        tool_id: this.currentTool.tool_id,
        value: this.currentTool.value,
        staff: this.currentTool.staff,
        team: this.currentTool.team,
        notes: this.currentTool.notes,
        purchased: this.currentTool.purchased,
        image: this.currentTool.image
    };
    
    if(!this.data.image || this.data.image == '') {
        this.bShowButton = true;
    } else {
        this.bShowButton = false;
    }
    
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
                id: this.data.id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_tool.php";
            this.loadingController.create({
				      message: this.translate.instant('Removing...'),
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert('There is an error when remove tool.')
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Success'),
						      message: this.translate.instant('Tool is removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            localStorage.setItem('bLoadTool', '1');
						            this.router.navigateByUrl('/tool-register');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });                
            }, (err) => {
                this.loading.dismiss();
                this.global.displayAlert('There is an error when remove tool.')
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
      let data = {
          id: this.data.id,
          user_id: this.data.user_id,
          type: this.data.type,
          brand: this.data.brand,
          serial: this.data.serial,
          tool_id: this.data.tool_id,
          model: this.data.model,
          value: this.data.value,
          notes: this.data.notes,
          staff: this.data.staff,
          team: this.data.team,
          purchased: this.data.purchased,
          image: this.imgURL
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_tool.php";
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp.data);
          if(resp.error === true) {
              this.global.displayAlert('There is an error when update tool.')
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('Tool has been updated successfully'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
			            localStorage.setItem("bLoadTool", '1');
			            this.router.navigateByUrl('/tool-register');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when update tool.')
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
				this.toolImg = "data:image/jpeg;base64," + imageData;
	      setTimeout(() => {
	         this.toolImg = "data:image/jpeg;base64," + imageData;
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


	async doUpdate() {
      if(!this.toolImg) {
          this.doSaveData();
          return ;
      }
      let imageData = this.toolImg;
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
	        let perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
	      } else {
	      }
	    });
    }

}
