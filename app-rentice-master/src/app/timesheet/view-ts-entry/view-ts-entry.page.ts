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
  selector: 'app-view-ts-entry',
  templateUrl: './view-ts-entry.page.html',
  styleUrls: ['./view-ts-entry.page.scss'],
})
export class ViewTsEntryPage implements OnInit {

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
              private translate: TranslateService,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController,
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  	console.log("==timesheet view page===");
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
  }

	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
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
            let data = {
                id: this.currentTimesheet.id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_timesheet.php";
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
								    this.global.displayAlert('There is an error when remove timesheet.');
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
                this.global.displayAlert('There is an error when remove timesheet.');
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });    
  }

  doSave() {
  	this.router.navigateByUrl('/edit-ts-entry');
  }
}
