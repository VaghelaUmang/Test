import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../services/global-provider';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { TranslateService } from '@ngx-translate/core';
declare var ga, window;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	username: string = "";
	password: string = "";
  user: any = {};

  constructor(private platform: Platform,
              public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              public global: GlobalProvider,
              private ga: GoogleAnalytics,
              private translate: TranslateService) {
    //translate.setDefaultLang('te-reo');
  }

  ngOnInit() {
  	let user: any  = window.localStorage.getItem("user");
    if(user !== undefined && user != null && user != "") {
        user = JSON.parse(user)
        if(user.user_roles == 'List(tutor)') {
          this.global.registerToken();
          this.router.navigateByUrl('/managed-students');
        } else {
          this.router.navigateByUrl('/home');
        }
    }
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      try {
        if(!window.device)
            ga('send', 'pageview', 'Login Page');
        else {
           this.ga.trackView('Login Page');
        }
      } catch (e) {
        console.log(e)
      }
    });

    this.username = "";
    this.password = "";
  }

  keyDown(event) {
    if(event.keyCode == 13) {
      this.login();
    }
  }

  async login() {
  	if(this.username.length < 1) {
      this.global.displayAlert('Please input username.');
  		return ;
  	}
  	if(this.password.length < 1) {
      this.global.displayAlert('Please input password.');
  		return ;
  	}

  	const data = {"username": this.username, "password": this.password };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/login.php";
    const loading = await this.loadingController.create({
      message: this.translate.instant('Logging in...'),
    });
    await loading.present();
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
            try {
              if(!window.device)
                window.ga('send', 'event', 'Login', 'Login Fail', 'Login Fail');
              else
                this.ga.trackEvent('Login', 'Login Fail', 'Login Fail')
            } catch(e) {
              console.log(e)
            }
            let url = 'https://www.artisanideas.co.nz/api/app-rentice/add_login_report.php'
            let data = {"user_id": "", "user_email": "", "user_fail_login": this.username };
            this.http.post(url, data).subscribe((resp: any) => {
              console.log("reported")
            }, err => {
              console.log("reported error")
            });
            this.global.displayAlert('Login failed. Please check your credentials.');
			  		return ;
        }

        if (this.platform.is('cordova')) {
          this.global.initPushNotification();
        }

        try {
          if(!window.device)
            ga('send', 'event', 'Login', 'Login Success', 'Login Success');
          else 
             this.ga.trackEvent('Login', 'Login Success', 'Login Success')
        } catch(e) {
          console.log(e)
        }

        let user = resp.user;
        this.user = user;


        let url = 'https://www.artisanideas.co.nz/api/app-rentice/add_login_report.php'
        let data = {"user_id": user.user_login, "user_email": user.user_email, "user_fail_login": "" };
        this.http.post(url, data).subscribe((resp: any) => {
          console.log("reported")
        }, err => {
          console.log("reported error")
        });

        this.getTutorName(user.tutor);
        this.getProviderName(user.provider);
        window.localStorage.setItem("user", JSON.stringify(user));

        if(user.user_roles == 'List(tutor)') {
          this.router.navigateByUrl('/managed-students');
        } else {
          this.router.navigateByUrl('/home');
        }
    }, (err) => {
        let url = 'https://www.artisanideas.co.nz/api/app-rentice/add_login_report.php'
        let data = {"user_id": "", "user_email": "", "user_fail_login": this.username };
        this.http.post(url, data).subscribe((resp: any) => {
          console.log("reported")
        }, err => {
          console.log("reported error")
        });
        try {
          if(!window.device)
            window.ga('send', 'event', 'Login', 'Login Fail', 'Login Fail');
          else
            this.ga.trackEvent('Login', 'Login Fail', 'Login Fail')
        } catch(e) {
          console.log(e)
        }
        loading.dismiss();
        this.global.displayAlert('There was a problem when logging in.');
    });
  }

  getTutorName(tutor) {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_user_by_tutor.php?tutor=" + tutor;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        if(resp.data.length > 0) {
          this.user.tutorName = resp.data[0].user_firstname + " " + resp.data[0].user_lastname;
          this.user.tutorEmail = resp.data[0].user_email;
        }
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
        window.localStorage.setItem("user", JSON.stringify(this.user));        
    }, (err) => {
        console.log("there is an error while get provider");
    });
  }
}
