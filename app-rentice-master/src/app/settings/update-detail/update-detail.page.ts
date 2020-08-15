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
import { GlobalProvider } from '../../services/global-provider';

@Component({
  selector: 'app-update-detail',
  templateUrl: './update-detail.page.html',
  styleUrls: ['./update-detail.page.scss'],
})
export class UpdateDetailPage implements OnInit {

	user: any = {};
	data: any = {};

constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
              public global: GlobalProvider,
  						private router: Router,
              private translate: TranslateService,
  						private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==user information edit page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

    let lang = localStorage.getItem("apprentice-lang");
    if(lang == null || lang == undefined) {
      lang = "en";
    }

    let date_to = new Date().getDay();
  	this.data = {
      user_id: '',
      tutor: '',
      faculty: '',
      provider: '',
      firstname: '',
      lastname: '',
      email: '',
      language: lang,
      reminder: false,
      reminderWeek: ["1", "2", "3", "4", "5"],
      reminderTime: "16:00"
    };
    this.loadUserData();
  }

  changeLang() {
    console.log(this.data.language)
    this.translate.setDefaultLang(this.data.language);
    localStorage.setItem("apprentice-lang", this.data.language);
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
    this.data.firstname = this.user.user_firstname;
    this.data.lastname = this.user.user_lastname;
    this.data.email = this.user.user_email;
  }

  toggleReminder() {
    console.log(this.data.reminder)
    if(this.data.reminder) {
      localStorage.setItem("reminder", "1");
      localStorage.setItem("reminderTime", this.data.reminderTime);
      localStorage.setItem("reminderWeek", JSON.stringify(this.data.reminderWeek));
    } else {
      localStorage.removeItem("reminder");
      localStorage.removeItem("reminderTime");
      localStorage.removeItem("reminderWeek");
    }
  }

  async doUpdate() {
			const data = {
          user_id: this.data.user_id,
		      firstname: this.data.firstname,
		      lastname: this.data.lastname,
		      email: this.data.email
      };
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_user.php";
      const loading = await this.loadingController.create({
	      message: '',
	    });
      if(this.data.reminder) {
        localStorage.setItem("reminder", "1");
        localStorage.setItem("reminderTime", this.data.reminderTime);
        localStorage.setItem("reminderWeek", JSON.stringify(this.data.reminderWeek));
      } else {
        localStorage.removeItem("reminder");
        localStorage.removeItem("reminderTime");
        localStorage.removeItem("reminderWeek");
      }
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp);
          if(resp.error == true) {
              this.global.displayAlert('There is an error when update information.')
              return ;
          }
          let user = resp.data;
					window.localStorage.setItem("user", JSON.stringify(user));
          this.alertController.create({
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('User Information has been updated.'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            this.router.navigateByUrl('/settings');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when update information.')
      });
  }
}
