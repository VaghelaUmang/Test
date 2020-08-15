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
import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from '../services/global-provider';
import { LocalNotifications, ELocalNotificationTriggerUnit, ILocalNotificationActionType, ILocalNotification } from '@ionic-native/local-notifications/ngx';


declare var window;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

	user: any = {};
	data: any = {};

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              public global: GlobalProvider,
              private localNotifications: LocalNotifications,
  						private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==setting page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

    let lang = localStorage.getItem("apprentice-lang");
    if(lang == null || lang == undefined) {
      lang = "en";
    }

    switch (lang) {
      case "en":
        lang = "English";
        break;
      case "te-reo":
        lang = "Te Reo";
        break;
      default:
        lang = "English";
        break;
    }

    let reminderWeek = JSON.parse(localStorage.getItem("reminderWeek"))
    let reminderTime = localStorage.getItem("reminderTime")
    let reminder = localStorage.getItem("reminder")
  	this.data = {
      user_id: '',
      tutor: '',
      faculty: '',
      provider: '',
      name: '',
      username: '',
      email: '',
      language: lang,
      reminder: reminder ? true : false,
      reminderWeek: reminderWeek ? reminderWeek : ["1", "2", "3", "4", "5"],
      reminderTime: reminderTime ? reminderTime : "16:00"
    };

    if(reminder) {
      this.global.startReminderTimer();
    }

    this.loadUserData();

    if(this.user.tutorName == null || this.user.tutorName == undefined || this.user.tutorName == "") {
      this.getTutorName(this.user.tutor);
    }
    if(this.user.providerName == null || this.user.providerName == undefined || this.user.providerName == "") {
      this.getProviderName(this.user.provider);
    }
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	loadUserData() {
    this.data.tutor = this.user.tutorName;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.providerName;
    this.data.name = this.user.user_login;
    this.data.username =  this.user.user_firstname + ' ' + this.user.user_lastname;
    this.data.email = this.user.user_email;
  }

  toggleReminder() {
    console.log(this.data.reminder)
    if(this.data.reminder) {
      if(window.device) {
        console.log("device reminder started")
        this.deviceNotification()
      } else {
        console.log("browser reminder started")
        this.global.startReminderTimer();
      }
      
      localStorage.setItem("reminder", "1");
      localStorage.setItem("reminderTime", this.data.reminderTime);
      localStorage.setItem("reminderWeek", JSON.stringify(this.data.reminderWeek));
    } else {
      this.global.stopReminderTimer();
      localStorage.removeItem("reminder");
      localStorage.removeItem("reminderTime");
      localStorage.removeItem("reminderWeek");
    }
  }

  deviceNotification() {
      let reminderHr = parseInt(this.data.reminderTime.substr(0, 2))
      let reminderMin = parseInt(this.data.reminderTime.substr(3))

      this.localNotifications.cancelAll().then(() => {
        console.log("current notification cancelled.")
        this.data.reminderWeek.forEach(item => {
          console.log(item)
          this.localNotifications.schedule({
              title: 'Reminder',
              text: 'This is reminder for enter activity',
              trigger: { every: {
                  weekday: parseInt(item),
                  hour: reminderHr,
                  minute: reminderMin
                }
              }
            });
        })
      });

      // this.localNotifications.on('click').subscribe(res => {
      //   let msg = res.data ? res.data.mydata : '';
      //   this.showAlert(res.title, res.text, msg);
      // });
 
      // this.localNotifications.on('trigger').subscribe(res => {
      //   let msg = res.data ? res.data.mydata : '';
      //   this.showAlert(res.title, res.text, msg);
      // });
  }

  showAlert(header, sub, msg) {
    this.alertController.create({
      header: header,
      subHeader: sub,
      message: msg,
      buttons: ['Ok']
    }).then(alert => alert.present());
  }

  changeWeek() {
    localStorage.removeItem("bNotified");
    localStorage.removeItem("notifiedDate");
    this.toggleReminder();
  }

  changeTime() {
    localStorage.removeItem("bNotified");
    localStorage.removeItem("notifiedDate");
    this.toggleReminder();
  }

  getTutorName(tutor) {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_user_by_tutor.php?tutor=" + tutor;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        this.user.tutorName = resp.data[0].name;
        this.user.tutorEmail = resp.data[0].user_email;
        this.data.tutor = resp.data[0].user_firstname + " " + resp.data[0].user_lastname;
        window.localStorage.setItem("user", JSON.stringify(this.user));
    }, (err) => {
        console.log("there is an error while get tutorname");
    });
  }

  getProviderName(provider) {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_provider_by_user.php?provider=" + provider;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get provider");
          return ;
        }
        this.user.providerName = resp.data[0].name;
        this.data.provider = resp.data[0].name;
        window.localStorage.setItem("user", JSON.stringify(this.user));        
    }, (err) => {
        console.log("there is an error while get provider");
    });
  }

  openUrl(url) {
   //window.open(url,  '_blank');
    window.open(url, '_blank', 'location=yes');
  }
}
