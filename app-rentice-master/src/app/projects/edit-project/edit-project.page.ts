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
  selector: 'app-edit-project',
  templateUrl: './edit-project.page.html',
  styleUrls: ['./edit-project.page.scss'],
})
export class EditProjectPage implements OnInit {
	data: any = {};
	user: any = {};
	currentProject: any;
	showButton: boolean = false;
	projectImg: any = null;
	imgURL: string = "";
	uploadLoading: any;
	loading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
              private translate: TranslateService,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
              public global: GlobalProvider,
  						public actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
  	this.currentProject = JSON.parse(localStorage.getItem("currentProject"));
    this.data = {
        id: this.currentProject.list_id,
        address: this.currentProject.address,
        date: this.currentProject.date,
        notes: this.currentProject.notes,
        project_image: this.currentProject.image,
        completed: parseInt(this.currentProject.completed),
        isBoss: this.currentProject.isBoss ? true : false
    };
    
    if(this.data.completed === 1) {
        this.data.completed = true;
    } else {
        this.data.completed = false;
    }
    
    if(!this.data.project_image || this.data.project_image === '') {
        this.showButton = true;
    } else {
        this.showButton = false;
    }
    
    this.projectImg = null;

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
				this.projectImg = "data:image/jpeg;base64," + imageData;
	      setTimeout(() => {
	         this.projectImg = "data:image/jpeg;base64," + imageData;
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
            var data = {
                id: this.data.id
            };
            
            var url = "https://www.artisanideas.co.nz/api/app-rentice/remove_project.php";
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
                    this.global.displayAlert('There is an error when remove project.')
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Success'),
						      message: this.translate.instant('Project is removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            this.router.navigateByUrl('/projects');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });

                localStorage.setItem('bLoadProject', '1');
            }, (err) => {
                this.loading.dismiss();
                this.global.displayAlert('There is an error when remove project.')
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });     
  }

	async doSaveData() {
        if(this.data.address.length < 1) {
            this.global.displayAlert('Please input address.')
            return ;
        }
        
        let completed = 0;
        if(this.data.completed === true) {
            completed = 1;
        } else {
            completed = 0;
        }

        var data = {
            id: this.data.id.toString(),
            address: this.data.address,
            date: this.data.date,
            notes: this.data.notes,
            image: this.imgURL,
            completed: completed
        };
        var url = "https://www.artisanideas.co.nz/api/app-rentice/update_project.php";
        const loading = await this.loadingController.create({
		      message: '',
		    });
		    await loading.present();
        this.http.post(url, data).subscribe((resp: any) => {
            loading.dismiss();
            console.log(resp);
            if(resp.error === true) {
                this.global.displayAlert('There is an error when save data. Please try again later.')
                return ;
            }

						this.alertController.create({
              header: this.translate.instant('Success'),
              message: this.translate.instant('Project has been uploaded successfully'),
				      buttons: [{
				          text: 'Okay',
				          handler: () => {
				            console.log('Confirm Okay');
				            this.router.navigateByUrl('/projects');
				          }
				        }
				      ]
				    }).then((alert) => {
				    	alert.present();
				    });

            localStorage.setItem("bLoadProject", '1');
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert('There is an error when save data. Please try again later.')
        });

        localStorage.setItem("projectData", JSON.stringify(data));
	      //$rootScope.projectImg = this.projectImg;
	      localStorage.setItem("projectImg", this.projectImg);
        //$state.go("confirmEntry");
  }

	async doSave() {
    if(!this.projectImg) {
        this.doSaveData();
        return ;
    }
    var imageData = this.projectImg;
    var imgURL = this.imgURL;

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
    const url = "https://www.artisanideas.co.nz/api/app-rentice/project_imgUpload.php";
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
      this.global.displayAlert('There is an error when save data. Please try again later.')
    });

		fileTransfer.onProgress((progressEvent) => {
      console.log(progressEvent);
      if (progressEvent.lengthComputable) {
        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
      } else {
      }
    });
  }
}
