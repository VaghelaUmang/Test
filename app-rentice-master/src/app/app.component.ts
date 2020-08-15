import { Component,  } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, NavigationEnd } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { delay, take } from 'rxjs/operators';
import { forkJoin, of, interval } from 'rxjs';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LocalNotifications, ELocalNotificationTriggerUnit, ILocalNotificationActionType, ILocalNotification } from '@ionic-native/local-notifications/ngx';

import { GlobalProvider } from './services/global-provider';

declare var window;
declare var ga;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Log Out',
      title1: 'Log In',
      url: '/',
      icon: 'exit',
      disabled: false
    },
    {
      title: 'Home',
      url: '/home',
      icon: 'home',
      disabled: false
    },
    {
      title: 'Enter Activity',
      url: '/main',
      icon: 'create',
      disabled: false
    },
    {
      title: 'Record of Work',
      url: '/student-log',
      icon: 'filing',
      disabled: false
    },
    {
      title: 'Qualification',
      url: '/search-by-us',
      icon: 'ribbon',
      disabled: false
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: 'business',
      disabled: false
    },
    {
      title: 'Timesheet',
      url: '/timesheet',
      icon: 'timer',
      disabled: false
    },
      {
      title: 'To Do Lists',
      url: '/to-do-list',
      icon: 'clipboard',
      disabled: false
    },
    //   {
    //   title: 'Portfolios',
    //   url: '/portfolio',
    //   icon: 'clipboard',
    //   disabled: false
    // },
    {
      title: 'Portfolios',
      url: '/portfolio-list',
      icon: 'bookmarks',
      disabled: false
    },
    {
      title: 'Request Review',
      url: '/request-review',
      icon: 'checkmark-circle-outline',
      disabled: false
    },
    {
      title: 'Tool Register',
      url: '/tool-register',
      icon: 'hammer',
      disabled: false
    },
      {
      title: 'Managed Staff',
      url: '/managed',
      icon: 'contacts',
      disabled: false
    },
      {
      title: 'News',
      url: '/news',
      icon: 'paper',
      disabled: false
    },
      {
      title: 'CSC Discounts',
      url: '/discounts',
      icon: 'basket',
      disabled: false
    },
    {
      title: 'Calculators',
      url: '/calculator',
      icon: 'calculator',
      disabled: false
    },
      {
      title: 'Help',
      url: '/help',
      icon: 'help',
      disabled: false
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'settings',
      disabled: false
    },
    {
      title: 'Link Accounts',
      url: '/link-accounts',
      icon: 'link',
      disabled: false
    },
        {
      title: 'Assessor Menu',
      url: '/managed-students',
      icon: 'briefcase',
      disabled: false
    },
  ];

  bLoggedIn: boolean = false;
  isLandscape: boolean = false;

  scheduled: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    public loadingController: LoadingController,
    public alertCtrl: AlertController,
    public global: GlobalProvider,
    private storage: Storage,
    private ga: GoogleAnalytics,
    private localNotifications: LocalNotifications,
    private translate: TranslateService
  ) {
    let lang = localStorage.getItem("apprentice-lang");
    if(lang == null || lang == undefined) {
      lang = "en";
    }
    //translate.setDefaultLang('en');
    translate.setDefaultLang(lang);
    this.initializeApp();
    router.events.subscribe((val) => {
      if(val instanceof NavigationEnd) {
        //console.log(val);
        if(val.urlAfterRedirects == "/") {
          this.bLoggedIn = false;
          return ;
        } 

        let user = localStorage.getItem("user");
        //console.log(user);
        if(user == null || user == undefined) {
          this.bLoggedIn = false;
        } else {
          this.bLoggedIn = true;
        }
      }
    })
  }

  showAlert(header, sub, msg) {
    this.alertCtrl.create({
      header: header,
      subHeader: sub,
      message: msg,
      buttons: ['Ok']
    }).then(alert => alert.present());
  }

  initializeApp() {
    console.log(this.platform);
    this.isLandscape = this.platform.isLandscape();
    console.log(this.isLandscape);
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if(window.device) {
        this.ga.startTrackerWithId('UA-52920239-5')
          .then(() => {
            console.log('Google analytics is ready now');
            //the component is ready and you can call any method here
            this.ga.debugMode();
            this.ga.setAllowIDFACollection(true);
          })
          .catch(e => {
            console.log('Error starting GoogleAnalytics', e)
          });
      }

      this.global.initPushNotification();


      this.localNotifications.on('click').subscribe(res => {
        //let msg = res.data ? res.data.mydata : '';
        //this.showAlert(res.title, res.text, msg);
        this.alertCtrl.create({
            header: 'Reminder',
            message: 'This is reminder for enter activity!!!',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                }
              }, {
                text: 'Repeat last entry',
                handler: () => {
                  this.global.quickAdd();
                }
              }
            ]
          }).then(alert => {
            alert.present();
          });
      });
 
      this.localNotifications.on('trigger').subscribe(res => {
        //let msg = res.data ? res.data.mydata : '';
        //this.showAlert(res.title, res.text, msg);
        this.alertCtrl.create({
            header: 'Reminder',
            message: 'This is reminder for enter activity!!!',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                }
              }, {
                text: 'Repeat last entry',
                handler: () => {
                  this.global.quickAdd();
                }
              }
            ]
          }).then(alert => {
            alert.present();
          });
      });

      // Schedule delayed notification
      // this.localNotifications.schedule([{
      //      text: 'Delayed ILocalNotification-1',
      //      trigger: {at: new Date(new Date().getTime() + 8000)},
      //      led: 'FF0000',
      //      sound: null
      //   },{
      //      text: 'Delayed ILocalNotification-2',
      //      trigger: {at: new Date(new Date().getTime() + 15000)},
      //      led: 'FF0000',
      //      sound: null
      //   },{
      //     title: 'Recurring',
      //     text: 'Simons Recurring Notification',
      //     trigger: { every: ELocalNotificationTriggerUnit.MINUTE }
      //   }
      // ]);
      // this.localNotifications.schedule({
      //    text: 'Delayed ILocalNotification-2',
      //    trigger: {at: new Date(new Date().getTime() + 10000)},
      //    led: 'FF0000',
      //    sound: null
      // });
      // this.localNotifications.schedule({
      //   title: 'Recurring',
      //   text: 'Simons Recurring Notification',
      //   trigger: { every: ELocalNotificationTriggerUnit.MINUTE }
      // });
    });

    console.log("=init app==");
    let user = localStorage.getItem("user");
    if(user == null || user == undefined) {
      return ;
    }

    let reminder = localStorage.getItem("reminder");
    if(!window.device && reminder == "1") {
      this.global.startReminderTimer();
    }

    if(window.device && reminder == "1") {
      let reminderWeek = JSON.parse(localStorage.getItem("reminderWeek"))
      let reminderTime = localStorage.getItem("reminderTime")
      let reminderHr = parseInt(reminderTime.substr(0, 2))
      let reminderMin = parseInt(reminderTime.substr(3))

      this.localNotifications.cancelAll().then(() => {
        console.log("current notification cancelled.")
        console.log(reminderWeek)
        reminderWeek.forEach(item => {
          console.log(item)
          this.localNotifications.schedule({
              title: 'Reminder',
              text: 'This is reminder for enter activity',
              trigger: { 
                every: {
                  weekday: parseInt(item),
                  hour: reminderHr,
                  minute: reminderMin
                }
              }
          });
        })
      });
      
    }
    this.loadGlobalData();
  }

  async loadGlobalData() {
    this.global.bDownloadMain = Boolean(localStorage.getItem("bDownloadMain"));
    this.global.bDownloadSub = Boolean(localStorage.getItem("bDownloadSub"));

    const loading = await this.loadingController.create({
      message: this.translate.instant('Loading Data...'),
    });
    await loading.present();
    forkJoin([
       this.storage.get('maincategory'),
       this.storage.get('allSubCategory'),
       this.storage.get('allactivity'),
       this.storage.get('address'),
       this.storage.get('allStudentLogList'),
       this.storage.get('allTimesheetList')
    ])
    .subscribe(data => {
        const maincategory = data[0];
        if(maincategory !== null && maincategory !== undefined && maincategory !== "") {
          try {
              this.global.allMaincategoryList = JSON.parse(maincategory);
          } catch(e) {
              this.global.allMaincategoryList = [];
          }
        }
        const subcategory = data[1];
        if(subcategory !== null && subcategory !== undefined && subcategory !== "") {
          try {
              this.global.allSubcategoryList = JSON.parse(subcategory);
          } catch(e) {
              this.global.allSubcategoryList = [];
          }
        }
        const allactivity = data[2];
        if(allactivity !== null && allactivity !== undefined && allactivity !== "") {
          try {
              this.global.allActivityList = JSON.parse(allactivity);
          } catch(e) {
              this.global.allActivityList = [];
          }
        }

        const address = data[3];
        if(address !== null && address !== undefined && address !== "") {
          try {
              this.global.allAddressList = JSON.parse(address);
          } catch(e) {
              this.global.allAddressList = [];
          }
        }

        const allStudentLogList = data[4];
        if(allStudentLogList !== null && allStudentLogList !== undefined && allStudentLogList !== "") {
          try {
              this.global.allStudentLogList = JSON.parse(allStudentLogList);
          } catch(e) {
              this.global.allStudentLogList = [];
          }
        }

        const allTimesheetList = data[5];
        if(allTimesheetList !== null && allTimesheetList !== undefined && allTimesheetList !== "") {
          try {
              this.global.allTimesheetList = JSON.parse(allTimesheetList);
          } catch(e) {
              this.global.allTimesheetList = [];
          }
        }
        console.log(this.global);
        loading.dismiss();
    }, err => {
        loading.dismiss();
        console.log(err);
    });
  }

  doAction(url) {
    this.global.fromRequestPage = false;
    //console.log(url);
    if(url == "/login" || url == "/") {
        this.global.clearLocalStorage();
        if (this.platform.is('cordova')) {
          this.global.unregisterPush();
        }
    }
    this.appPages.forEach(item => {
      item.disabled = false;
    })
    if(url == "/managed-students" && this.isLandscape) {
        this.appPages.forEach(item => {
          if(item.url != '/' && item.url != '/home' && item.url != '/managed-students') {
            item.disabled = true;
          }
        })
    }
  }
}