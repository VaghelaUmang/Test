import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonItemSliding } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { forkJoin, interval } from 'rxjs';
import { ImagesProvider } from '../../services/images.images';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { placeholderImg } from "../../services/placeholderImg";

declare var window;

@Component({
  selector: 'app-new-signoff',
  templateUrl: './new-signoff.page.html',
  styleUrls: ['./new-signoff.page.scss'],
})
export class NewSignoffPage implements OnInit {

	data: any = {};
	user: any = {};
	maincategoryList: any = [];
	currentSignoffItem: any;
	existedList: any = [];
	recordWorkList: any = [];

	rowstatusList: any = [];
	unitSummary: any = [];
	allElementList: any = [];
	allUnitList: any = [];
	signedOffList: any = [];
	signedOff2List: any = [];

	photo1: any;
	photo2: any;
	tutor_notes: string = '';
	image1: string = '';
	image2: string = '';
	isReadonly: boolean = false;
	currentStatus: number = 0; //In Progress, Sent, Completed
  qualName: string = "";

  pdf: any;
  saveList: any = [];
  saveLoading: any;
  pdfListCnt: number = 0;
  yPos: number;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              private _IMAGES: ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Trainee New Signoff page');
      } else {
        if(this.ga) {
          this.ga.trackView('Trainee New Signoff page');
        }
      }
    } catch(e) {
      console.log(e)
    }

    this.data = {
        date: new Date().toISOString().substr(0, 10),
        notes: '',
        booking_note: ''
    };

    this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
    this.photo1 = null;
    this.photo2 = null;
    this.loadUserData()
  }

  loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

  selectFileToUpload(event, idx) : void {
     this._IMAGES
     .handleImageSelection(event)
     .subscribe((res) => {
        // Retrieve the file type from the base64 data URI string
        const _SUFFIX  = res.split(':')[1].split('/')[1].split(";")[0];

        if(this._IMAGES.isCorrectFileType(_SUFFIX)) {
           const imgURL = this.global.todayString();

           if(idx == 1) {
              this.photo1 = {
               ext: _SUFFIX,
               data: res,
               name: imgURL + "." + _SUFFIX
             };
           } else {
               this.photo2 = {
               ext: _SUFFIX,
               data: res,
               name: imgURL + "." + _SUFFIX
              };
           }
        } else {
           this.global.displayAlert('You need to select an image file with one of the following types: jpg, gif or png');
        }
     }, (error) => {
        console.dir(error);
        console.log(error.message);
     });
  }

  async doUploadImage(bReturn = false) {
    let imageList = [];
    if(this.photo1 && this.photo1.data) {
      imageList.push(this.photo1)
    }
    if(this.photo2 && this.photo2.data) {
      imageList.push(this.photo2)
    }

    if(imageList.length < 1) {
      this.saveData();
      return ;
    }
    let n = 0;
    let uploadLoading = await this.loadingController.create({
      message: 'Uploading images...',
    });
    await uploadLoading.present();
    for(let i=0;i<imageList.length;i++) {

       this._IMAGES
       .uploadImageSelection(imageList[i].data,
                             imageList[i].name)
       .subscribe((res) =>
       {
          if(n>=imageList.length - 1) {
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

  async saveNotePhoto() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Want to send notification to Trainee?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            this.doUploadImage();
          }
        }, {
          text: 'YES',
          handler: () => {
            console.log('Confirm Okay');
            this.notifyUser();
          }
        }
      ]
    });
    await alert.present();
  }

  async saveData(bReturn = false) {
      let data = {
          student: this.user.user_id.toString(),
          tutor: this.user.tutor,
          provider: this.user.provider,
          faculty: this.user.faculty,
          course_code: this.user.qual,
          status: 'In Progress',
          created: this.data.date,
          notes: this.data.notes,
          note1: this.data.booking_note,
          photo1: this.photo1 && this.photo1.name ? this.photo1.name : "",
          photo2: this.photo2 && this.photo2.name ? this.photo2.name : "",
          tutor_notes: '',
          list_id: ''
      };
      
      let url = "https://www.artisanideas.co.nz/api/app-rentice/add_request_list.php";
      const loading = await this.loadingController.create({
        message: 'Saving Data...',
      });
      await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error == true) {
              this.global.displayAlert("There is an error while save your entry on inventory table.");
              return ;
          }
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error while save your entry on inventory table.");
      });
  }

  async notifyUser() {
    let data = {
      user_id: this.user.tutor
    };
    const loading = await this.loadingController.create({
      message: 'Sending Notification',
    });
    await loading.present();

    setTimeout(() => {
      loading.dismiss();
      this.doUploadImage();
    }, 5000)
    let url = "https://www.artisanideas.co.nz/api/app-rentice/notify_requestreview.php";
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss()
        console.log(resp);
    }, (err) => {
        loading.dismiss()
        console.log(err)
    });
  }
}
