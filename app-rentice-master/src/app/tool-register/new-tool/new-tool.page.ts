import { Component, OnInit } from '@angular/core';
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
  selector: 'app-new-tool',
  templateUrl: './new-tool.page.html',
  styleUrls: ['./new-tool.page.scss'],
})
export class NewToolPage implements OnInit {

	data: any = {};
	user: any = {};
	toolImg: any;
	imgURL: any;
	uploadLoading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
              private translate: TranslateService,
              public global: GlobalProvider,
  						private http: HttpClient,
  						private router: Router,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  	console.log("==enter new tool page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.data = {
        user_id: '',
        type: '',
        brand: '',
        model: '',
        serial: '',
        tool_id: '',
        purchased: new Date().toISOString().substr(0, 10),
        value: '',
        notes: '',
        staff: '',
        team: '',
        image: ''
    };
    this.toolImg = null;
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

	async saveData() {
      console.log(this.data);
      const data = {
          user_id: this.data.user_id.toString(),
          type: this.data.type,
          brand: this.data.brand,
          model: this.data.model,
          tool_id: this.data.tool_id,
          serial: this.data.serial,
          purchased: this.data.purchased,
          value: this.data.value,
          notes: this.data.notes,
          staff: this.data.staff,
          team: this.data.team,
          image: this.imgURL
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/add_tool.php";
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp);
          if(resp.error === true) {
              this.alertController.create({
					      header: 'Alert',
					      message: 'Sorry we could not upload your entry, please try again later.',
					      buttons: ['OK']
					    }).then((alert) => {
					    	alert.present()
					    });
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('Tool has been created successfully'),
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
          this.global.displayAlert('Sorry we could not upload your entry, please try again later.')
      });         
  }

  async uploadImage() {
      if(!this.toolImg) {
          this.saveData();
          return ;
      }
      let imageData = this.toolImg;

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
      let ft = new FileTransfer();
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
	      this.global.displayAlert('Sorry we could not upload your entry, please try again later.')
	    });

			fileTransfer.onProgress((progressEvent) => {
	      console.log(progressEvent);
	      if (progressEvent.lengthComputable) {
	        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
	      } else {
	      }
	    });
  }

  doSave () {
    this.uploadImage();
  }
}
