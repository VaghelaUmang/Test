import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { catchError, retry, map } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core'
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File } from '@ionic-native/file/ngx';

declare var window;
declare var opr;
declare var navigator;

@Injectable({
  providedIn: 'root',
})
export class GlobalProvider {

  public inventoryData: any;
  public inventoryImg: any;
  public isCordova: boolean = false;
  public newTodoListItem: any;
  public allActivityList: any = [];
  public allSubcategoryList: any = [];
  public allMaincategoryList: any = [];
  public allStudentLogList: any = [];
  public allTimesheetList: any = [];
  public bDownloadMain: boolean = false;
  public bDownloadSub: boolean = false;
  public currentSubCatList: any = [];
  public allAddressList: any = [];
  public defaultAddressList: any = [];
  public bossAddressList: any = [];
  public pushToken: string = "";
  pushObject: any;
  public lastEntry: any = {};
  public tutorStudentLog: any = [];
  public tutorMaincategoryList: any = [];
  public tutorSubcategoryList: any = [];
  public tutorActivityList: any = [];
  public tutorInventoryList: any = [];
  public staffStudentLog: any = [];
  public staffMaincategoryList: any = [];
  public staffSubcategoryList: any = [];
  public staffActivityList: any = [];
  public staffInventoryList: any = [];
  public listByFaculty: any = null;
  public tutorUnitStandardStudentLogList: any = [];
  public currentUnit_Element;
  public currentUnit;
  public currentElement;
  public currentElementList;
  public loading: any;
  public signupUser: any;
  public editSignup: boolean = false;
  public currentQual: string = '';
  public currentGrp: string = '';
  public reminderTimer: any = null;
  public portfolioFilter: any;
  public allQualList: any = [];
  public browser: string = '';
  public fromRequestPage: boolean = false;

  constructor(public http: HttpClient,
              private translate: TranslateService,
              public platform: Platform,
              public push: Push,
              private router: Router,
              private storage: Storage,
              public file: File,
              private socialSharing: SocialSharing,
              public loadingController: LoadingController,
              public alertController: AlertController){
    this.isCordova = this.platform.is('cordova');

    this.checkBrowserType();
    console.log(this.browser)
  }

  /**
  * @public
  * @method displayAlert
  * @param message  {string}  The message to be displayed to the user
  * @description          Use the Ionic AlertController API to provide user feedback
  * @return {none}
  */
 public displayAlert(message : string) : void {
    this.alertController.create({
      header: this.translate.instant('Alert'),
      message: this.translate.instant(message),
      buttons: [this.translate.instant('OK')]
    }).then((alert) => {
      alert.present()
    });
 }

 public async  displayLoading(message = "") {
    this.loading = await this.loadingController.create({
      message: message,
    });
    await this.loading.present();
 }

 public hideLoading() {
   if(this.loading)
     this.loading.dismiss()
 }

 replaceAll(str, search, replacement) {
    return str.replace(new RegExp(search, 'g'), replacement);
 }

 public todayString() {
   let now = new Date();
   let today = now.toISOString().substr(0, 19);
    today = this.replaceAll(today, "-", "");
    today = this.replaceAll(today, "T", "_");
    today = this.replaceAll(today, ":", "");
    today = today + "_" + now.getTime();
    return today;
 }

 public toDataURL(url, callback) {
    /*debugger;
    return this.http.get(url, {responseType: 'arraybuffer'})
      .subscribe((res: any) => {
        console.log(res);
      }
    );
    return ;*/
    //console.log(url);
    url = url.replace("List(", "");
    url = url.replace(")", "");
    //debugger;
    let httpRequest = new XMLHttpRequest();
    httpRequest.onload = function() {
       let fileReader = new FileReader();
          fileReader.onloadend = function() {
            //console.log(e);
            //console.log(fileReader);
            try {
              callback(fileReader.result);
            } catch (e) {
              callback(null);
            }
          }

          fileReader.onerror = function (err) {
            console.log(err);
            callback(null);
          }
          fileReader.readAsDataURL(httpRequest.response);
    };

    httpRequest.onerror = function (err) {
      console.log(err);
      callback(null);
    };
    httpRequest.open('GET', url);
    /*httpRequest.setRequestHeader("Content-Type","application/json");
    httpRequest.setRequestHeader("X-Requested-With","XMLHttpRequest");
    //supported in new browsers...do JSONP based stuff in older browsers...figure out how
    httpRequest.setRequestHeader("Access-Control-Allow-Origin","*");
    httpRequest.setRequestHeader("Accept","application/json");*/
    httpRequest.responseType = 'blob';
    httpRequest.send();
 }

  //toDataURL2(src, callback, outputFormat) {
 toDataURL2(src, callback) {
    let img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      let canvas: any = document.createElement('CANVAS');
      let ctx = canvas.getContext('2d');
      let dataURL;
      canvas.height = canvas.naturalHeight;
      canvas.width = canvas.naturalWidth;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL();
      //dataURL = canvas.toDataURL(outputFormat);
      callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = src;
    }
 }

 public initPushNotification() {
    if (!this.platform.is('cordova')) {
      console.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
      return;
    }
    let isRegisterd = parseInt(localStorage.getItem("tokenRegister"));
    if(isRegisterd) {
       return ;
    }
    const options: PushOptions = {
      android: {
        senderID: '680838124370',
        vibrate: true,
        sound: true
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);
    this.pushObject = pushObject;
    this.pushObject.on('registration').subscribe((data: any) => {
      console.log('device token -> ' + data.registrationId);
      //TODO - send device token to server
      this.pushToken = data.registrationId;
      this.registerToken();
    });

    this.pushObject.on('notification').subscribe((data: any) => {
      console.log('message -> ' + data.message);
      let user = localStorage.getItem("user");
      if(user == null || user == undefined) {
        return ;
      }
      //if user using app and push notification comes
      if (data.additionalData.foreground) {
        // if application open, show popup
        let confirmAlert = this.alertController.create({
          header: 'New Notification',
          message: data.message,
          buttons: [{
            text: 'Ignore',
            role: 'cancel'
          }, {
            text: 'View',
            handler: () => {
              //TODO: Your logic here
              console.log(data.additionalData["gcm.notification.type"]);
              const type = data.additionalData["gcm.notification.type"];
              if(type == "studentlog") {
                localStorage.setItem("bLoadStudentLog", "1");
                this.router.navigateByUrl("/student-log");
              } else {
                this.router.navigateByUrl("/managed-student-log");
              }
            }
          }]
        }).then((alert) => {
          alert.present();
        })
      } else {
        const type = data.additionalData["gcm.notification.type"];
        if(type == "studentlog") {
          localStorage.setItem("bLoadStudentLog", "1");
          this.router.navigateByUrl("/student-log");
        } else {
          this.router.navigateByUrl("/managed-student-log");
        }
      }
    });

    this.pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));
  }

 public registerToken() {
   let isRegisterd = parseInt(localStorage.getItem("tokenRegister"));
   if(isRegisterd) {
     return ;
   }
   if(this.pushToken.length < 1) {
     return ;
   }
   let user: any = localStorage.getItem("user");
   if(user == null || user == undefined) {
     return ;
   }

   user = JSON.parse(localStorage.getItem("user"));
    const data = {"user_id": user.user_id.toString(), "token": this.pushToken };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/register_token.php";
    this.http.post(url, data).subscribe((resp: any) => {
        console.log(resp);
        localStorage.setItem("tokenRegister", "1");
    }, (err) => {
        console.log(err);
    });
 }

 public unregisterPush() {
  if(!this.pushObject) {
    return ;
  }

  this.pushObject.unregister(() => {
    console.log('success');
    this.removePushToken();
  }, () => {
    console.log('error');
  });
 }

 public removePushToken() {
    const data = {"token": this.pushToken };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_pushToken.php";
    this.http.post(url, data).subscribe((resp: any) => {
        this.pushToken = "";
        window.localStorage.setItem("tokenRegister", "0");
    }, (err) => {
        console.log(err);
    });
 }

 public roundTime() {
    var time = 1000 * 60 * 5;
    var date = new Date();
    var rounded = new Date(date.getTime() - (date.getTime() % time));
    return rounded.toLocaleTimeString();
 }

 public startReminderTimer() {
   if(this.reminderTimer)
     clearInterval(this.reminderTimer);
   this.reminderTimer = setInterval(() => {
     this.checkReminder()
   }, 60000);
 }

 public stopReminderTimer() {
   if(this.reminderTimer)
     clearInterval(this.reminderTimer);
 }

 public checkReminder() {
   console.log("==reminder==")
   let now = new Date();
   let curHr = now.getHours();
   let curMin = now.getMinutes();
   let week = now.getDay().toString();

   let reminderWeek = JSON.parse(localStorage.getItem("reminderWeek"))
   let reminderTime = localStorage.getItem("reminderTime")
   let flag = true;
   
   if(reminderWeek.indexOf(week) < 0) {
     flag = false;
   }

   let reminderHr = parseInt(reminderTime.substr(0, 2))
   let reminderMin = parseInt(reminderTime.substr(3))

   let bNotified = localStorage.getItem("bNotified");
   let notifiedDate = localStorage.getItem("notifiedDate");

   if(flag && bNotified != "1") {
     if(curHr == reminderHr && curMin == reminderMin) {
         this.alertController.create({
            header: 'Reminder',
            message: 'This is reminder for enter activity!!!',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                  localStorage.setItem("bNotified", "1");
                  localStorage.setItem("notifiedDate", now.toISOString().substr(0, 10));
                  this.startReminderTimer()
                }
              }, {
                text: 'Repeat last entry',
                handler: () => {
                  localStorage.setItem("bNotified", "1");
                  localStorage.setItem("notifiedDate", now.toISOString().substr(0, 10));
                  this.startReminderTimer()
                  this.quickAdd();
                }
              }
            ]
          }).then(alert => {
            alert.present();
          });

          this.stopReminderTimer()
     }
   }
   
 }

 quickAdd() {
    console.log(this.allStudentLogList);
    let lastEntry: any = {};
    if(this.allStudentLogList.length > 0) {
      lastEntry = this.allStudentLogList[0];
      this.lastEntry = lastEntry;
    }

    if(lastEntry.main_category == null || lastEntry.main_category == undefined) {
      return ;
    }

    localStorage.setItem("lastEntry", JSON.stringify(lastEntry));

    let mainCatName, subCatName;
    this.allMaincategoryList.forEach(item => {
      if(parseInt(item.cat) == parseInt(lastEntry.main_category)) {
        mainCatName = item.name;
      }
    })

    this.allSubcategoryList.forEach(item => {
      if(parseInt(item.list_id) == parseInt(lastEntry.sub_category)) {
        subCatName = item.name;
      }
    })

    localStorage.setItem("mainCategoryIdx", lastEntry.main_category);
    localStorage.setItem("mainCategoryName", mainCatName);
    localStorage.setItem("subCategoryIdx", lastEntry.sub_category);
    localStorage.setItem("subCategoryName", subCatName);

    this.router.navigateByUrl("/activity");
 }

 exportPDFCordova(pdfOutput, pdfName) {
    // using ArrayBuffer will allow you to put image inside PDF
    let buffer = new ArrayBuffer(pdfOutput.length);
    let array = new Uint8Array(buffer);
    for (var i = 0; i < pdfOutput.length; i++) {
        array[i] = pdfOutput.charCodeAt(i);
    }

    let directory = '';
    // For this, you have to use ionic native file plugin
    //const directory = this.file.externalApplicationStorageDirectory ;

    if(this.platform.is('android') == true) {
        directory = this.file.externalDataDirectory;  
    } else {
        directory = this.file.dataDirectory;
    }

    const fileName = pdfName;

    this.file.writeFile(directory, fileName, buffer)
    .then((success)=> {
      console.log("File created Succesfully" + JSON.stringify(success));
      this.socialSharing.share("ROW Pdf file for sharing", "ROW pdf", directory + fileName, null);
    })
    .catch((error)=> {
      console.log("Cannot Create File " +JSON.stringify(error));
      this.displayAlert("Cannot create pdf file.");
    });
  }

  checkBrowserType() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;

    // Internet Explorer 6-11
    var isIE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 71
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    var output = 'Detecting browsers by ducktyping:<hr>';
    output += 'isFirefox: ' + isFirefox + '<br>';
    output += 'isChrome: ' + isChrome + '<br>';
    output += 'isSafari: ' + isSafari + '<br>';
    output += 'isOpera: ' + isOpera + '<br>';
    output += 'isIE: ' + isIE + '<br>';
    output += 'isEdge: ' + isEdge + '<br>';
    output += 'isBlink: ' + isBlink + '<br>';

    let browser = "chrome";
    if(isOpera) {
      browser = 'opera'
    } else if(isIE) {
      browser = 'opera'
    } else if(isEdge) {
      browser = 'edge'
    } else if(isFirefox) {
      browser = 'firefox'
    } else if(isSafari) {
      browser = 'safari'
    } else if(isSafari) {
      browser = 'other'
    }

    this.browser = browser;
    //document.body.innerHTML = output;
  }

 public clearLocalStorage() {

  this.allActivityList = [];
  this.allSubcategoryList = [];
  this.allMaincategoryList = [];
  this.allStudentLogList = [];
  this.allTimesheetList = [];
  this.currentSubCatList = [];
  this.allAddressList = [];
  this.storage.remove('maincategory');
  this.storage.remove('address');
  this.storage.remove('allactivity');
  this.storage.remove('allStudentLogList');
  this.storage.remove('allTimesheetList');

  localStorage.removeItem("user");
  localStorage.removeItem("project");
  localStorage.removeItem("projectDate");
  localStorage.removeItem("allactivity");
  localStorage.removeItem("activityDate");
  localStorage.removeItem("categoryDate");
  localStorage.removeItem("maincategory");
  localStorage.removeItem("mainCategoryDate");
  localStorage.removeItem("subcategory");
  localStorage.removeItem("allSubCategory");
  localStorage.removeItem("allSubCategoryDate");
  localStorage.removeItem("mainCategoryIdx");
  localStorage.removeItem("todolist");
  localStorage.removeItem("todolistDate");
  localStorage.removeItem("currentProject");
  localStorage.removeItem("currentStudent");
  localStorage.removeItem("inventoryData");
  localStorage.removeItem("projectData");
  localStorage.removeItem("tool");
  localStorage.removeItem("toolDate");
  localStorage.removeItem("currentTool");
  localStorage.removeItem("bLoadStudent");
  localStorage.removeItem("currentTimesheet");
  localStorage.removeItem("bloadTimesheet");
  localStorage.removeItem("timesheet");
  localStorage.removeItem("timesheetDate");
  localStorage.removeItem("todolist");
  localStorage.removeItem("todolistDate");
  localStorage.removeItem("currentListItem");
  localStorage.removeItem("address");
  localStorage.removeItem("addressDate");
  localStorage.removeItem("bLoadListitem");
  localStorage.removeItem("bLoadProject");
  localStorage.removeItem("bLoadViewTodoList");
  localStorage.removeItem("currentTodolist");

  localStorage.removeItem("allStudentLogDate");
  localStorage.removeItem("allStudentLogList");

  localStorage.removeItem("bDownloadMain");
  localStorage.removeItem("bDownloadSub");

  localStorage.removeItem("allTimesheetDate");
  localStorage.removeItem("allTimesheetList");

  localStorage.removeItem("mainCatImageList");
  localStorage.removeItem("subCatImageList");

  localStorage.removeItem("tokenRegister");

  localStorage.removeItem("lastEntry");
  localStorage.removeItem("currentStaff");
  localStorage.removeItem("mainCategoryName");
  localStorage.removeItem("mainSummary");
  localStorage.removeItem("summaryActivity");
  localStorage.removeItem("currentTutorItem");
  localStorage.removeItem("listByFaculty");
  localStorage.removeItem("signupUser");
  localStorage.removeItem("subSummary");
  localStorage.removeItem("bossAddressDate");
  localStorage.removeItem("defaultAddressDate");
 }
}