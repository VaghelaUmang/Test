import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { forkJoin, interval } from 'rxjs';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
declare var ga, window;

@Component({
  selector: 'app-signoff-qual-update',
  templateUrl: './signoff-qual-update.page.html',
  styleUrls: ['./signoff-qual-update.page.scss'],
})
export class SignoffQualUpdatePage implements OnInit {

	data: any = {};
  assessor: any = {};
  noteText: string = '';
  currentUnit: any;
  currentElement: any;
  currentUnit_Element: any;
  currentElementList: any;

  constructor(private platform: Platform,
              public alertController: AlertController,
              public loadingController: LoadingController,
              private http: HttpClient,
              private router: Router,
              private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              private translate: TranslateService,
              public global: GlobalProvider) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Signoff Qual Update Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Signoff Qual Update Page');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
    console.log("==view tutor student page==");
    this.assessor = JSON.parse(localStorage.getItem("currentTutorItem"));
    console.log(this.assessor);
    this.data = {
      status: '',
      status1: '',
      noteText: ''
    }

    console.log(this.global.currentUnit_Element)
    console.log(this.global.currentUnit)
    console.log(this.global.currentElement)
    this.currentElementList = this.global.currentElementList;
    this.currentElementList.map(item=> {
      item.checked = true;
    })
    this.currentUnit_Element = this.global.currentUnit_Element;
    this.currentUnit = this.global.currentUnit;
    this.currentElement = this.global.currentElement;
  }

  onNoteTextPressed(value) {

  }

  async saveStatus() {
    if(this.data.status.length < 1) {
      this.global.displayAlert('Please select Status.');
      return ;
    }

    let addedUser = JSON.parse(localStorage.getItem("user"));
    const data = {
      'added': addedUser.user_id,
      'student': this.assessor.user_id,
      'provider': this.assessor.provider,
      'faculty': this.assessor.faculty,
      'course_code': this.assessor.qual,
      'unit': this.global.currentUnit.list_id,
      'element':  this.global.currentElement.list_id,
      'status': this.data.status,
      'notes': this.noteText
    };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/save_signedoff2.php";
    const loading = await this.loadingController.create({
      message: this.translate.instant('Saving Element Status...')
    });
    await loading.present();
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
            this.global.displayAlert('There was a problem when saving data.');
            return ;
        }
        let finished = 0, completed = 0;
        this.currentUnit_Element.element.forEach(item => {
          if(item.list_id == this.currentElement.list_id) {
            if(this.data.status == 'Finished') {
              finished++;
            } else if(this.data.status == 'Completed') {
              completed++;
            }
          } else {
            if(item.status == 'Finished') {
              finished++;
            } else if(item.status == 'Completed') {
              completed++;
            }
          }
        })

        let status = 'In Progress';
        if(finished == this.currentUnit_Element.element.length) {
          status = "Finished"
        }
        if(completed == this.currentUnit_Element.element.length) {
          status = "Completed"
        }
        this.saveUnitStatus(status);

    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There was a problem when saving data.');
    });
  }

  async saveStatus1(){
    if(this.data.status1 == '') {
      this.global.displayAlert('Please select Status.');
      return ;
    }

    let funcList = [];
    let addedUser = JSON.parse(localStorage.getItem("user"));
    console.log(this.currentElementList)
    this.currentElementList.forEach(item => {
      if(item.checked == true) {
        const data = {
          'added': addedUser.user_id,
          'student': this.assessor.user_id,
          'provider': this.assessor.provider,
          'faculty': this.assessor.faculty,
          'course_code': this.assessor.qual,
          'unit': this.global.currentUnit.list_id,
          'element':  item.list_id,
          'status': this.data.status1,
          'notes': this.data.noteText
        };
        const url = "https://www.artisanideas.co.nz/api/app-rentice/save_signedoff2.php";
        funcList.push(this.http.post(url, data));
      }
    })

    if(funcList.length < 1) {
      this.global.displayAlert('Please select Element.');
      return ;
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('Saving Element Status...')
    });
    await loading.present();
    forkJoin(funcList).subscribe(data => {
        loading.dismiss();
        let n = 0;
        this.currentElementList.forEach(item => {
          if(item.checked) {
            n++;
          }
        });
        let status = this.data.status1
        if(n != this.currentElementList.length) {
          status = "In Progress"
        }
        this.saveUnitStatus(status);
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There was a problem when saving data.');
    });
  }

  async saveUnitStatus(status) {
    const data = {
      'student': this.assessor.user_id,
      'provider': this.assessor.provider,
      'faculty': this.assessor.faculty,
      'course_code': this.assessor.qual,
      'unit': this.global.currentUnit.list_id,
      'status': status,
      'notes': ''
    };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/save_signedoff.php";
    const loading = await this.loadingController.create({
      message: this.translate.instant('Saving Unit Status...')
    });
    await loading.present();
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
            this.global.displayAlert('There was a problem when saving data.');
            return ;
        }

        this.alertController.create({
            header: this.translate.instant('Success'),
            message: this.translate.instant('SignedOff have been updated successfully'),
            buttons: [{
                text: 'Okay',
                handler: () => {
                     this.router.navigateByUrl('/signoff-summary');
                }
              }
            ]
          }).then((alert) => {
            alert.present();
          });
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There was a problem when saving data.');
    });
  }
}
