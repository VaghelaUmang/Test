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
  selector: 'app-view-staff-unit-standard-update',
  templateUrl: './view-staff-unit-standard-update.page.html',
  styleUrls: ['./view-staff-unit-standard-update.page.scss'],
})
export class ViewStaffUnitStandardUpdatePage implements OnInit {

  data: any = {};
  user: any = {};
  noteText: string = '';
  currentUnit: any;
  currentElement: any;
  currentUnit_Element: any;
  currentElementList: any;

  constructor(private platform: Platform,
              private translate: TranslateService,
              public alertController: AlertController,
              public loadingController: LoadingController,
              private http: HttpClient,
              private router: Router,
              private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Staff Student Log Search us Update Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Staff Student Log Search us Update Page');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
    console.log("==view tutor student page==");
    this.user = JSON.parse(localStorage.getItem("currentStaff"));
    console.log(this.user);
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
      'student': this.user.user_id,
      'provider': this.user.provider,
      'faculty': this.user.faculty,
      'course_code': this.user.qual,
      'unit': this.global.currentUnit.list_id,
      'element':  this.global.currentElement.list_id,
      'status': this.data.status,
      'notes': this.noteText
    };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/save_signedoff2.php";
    const loading = await this.loadingController.create({
      message: this.translate.instant('Saving Element Status...'),
    });
    await loading.present();
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
            this.global.displayAlert('There was a problem when saving data.');
            return ;
        }
        //this.global.displayAlert('SignedOff have been saved successfully.');
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

    console.log(this.currentElementList)
    let addedUser = JSON.parse(localStorage.getItem("user"));
    this.currentElementList.forEach(item => {
      if(item.checked == true) {
        const data = {
          'added': addedUser.user_id,
          'student': this.user.user_id,
          'provider': this.user.provider,
          'faculty': this.user.faculty,
          'course_code': this.user.qual,
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
      message: this.translate.instant('Saving Element Status...'),
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
      'student': this.user.user_id,
      'provider': this.user.provider,
      'faculty': this.user.faculty,
      'course_code': this.user.qual,
      'unit': this.global.currentUnit.list_id,
      'status': status,
      'notes': ''
    };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/save_signedoff.php";
    const loading = await this.loadingController.create({
      message: this.translate.instant('Saving Unit Status...'),
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
                     this.router.navigateByUrl('/view-staff-unit-standard');
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
