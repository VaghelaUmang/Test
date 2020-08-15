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
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-link-employer',
  templateUrl: './link-employer.page.html',
  styleUrls: ['./link-employer.page.scss'],
})
export class LinkEmployerPage implements OnInit {

	user: any = {};
	data: any = {};
	remove_id: any = "";
	add_id: any = "";
  linkedUser: any = {};

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private translate: TranslateService,
              public global: GlobalProvider,
  						private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==link employers page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.loadUserData();
    this.getLinkedUser(this.user.boss);
  }

	loadUserData() {
	  if(this.user) {
        this.data.tutor = this.user.tutorName;
        this.data.user_id = this.user.user_id;
        this.data.faculty = this.user.faculty;
        this.data.provider = this.user.providerName;
        this.data.name = this.user.user_login;
        this.data.username =  this.user.user_firstname + ' ' + this.user.user_lastname;
        this.data.email = this.user.user_email;
        return ;
    }
    let user = window.localStorage.getItem("user");
    if(user !== null && user !== undefined && user !== "") {
        try {
            this.user = JSON.parse(user);
        } catch(e){
            this.user = {};
        }
    }
    if(this.user) {
        this.data.tutor = this.user.tutorName;
        this.data.user_id = this.user.user_id;
        this.data.faculty = this.user.faculty;
        this.data.provider = this.user.providerName;
        this.data.name = this.user.user_login;
        this.data.username =  this.user.user_firstname + ' ' + this.user.user_lastname;
        this.data.email = this.user.user_email;
    }
  }

  getLinkedUser(user_id) {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_linked_user.php?user_id=" + user_id;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get linked user");
          return ;
        }
        this.linkedUser = resp.data[0];
        console.log(resp.data);
        this.remove_id = this.linkedUser.user_firstname + " " + this.linkedUser.user_lastname;
    }, (err) => {
        console.log("there is an error while get linked user");
    });
  }

  async doAdd() {
  	const data = {"add_id": this.user.user_id, "user_id": this.add_id };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/link_employer.php";
    const loading = await this.loadingController.create({
      message: 'Logining...',
    });
    await loading.present();
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        console.log(resp);
        if(resp.error == true) {
            this.global.displayAlert('There is an error when link employer.')
			  		return ;
        }
        let user = resp.user;
        this.user = user;
        this.router.navigateByUrl('/link-accounts');
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There is an error when link employer.')
    });
  }

  async doRemove() {
  	const data = {"user_id": this.user.user_id, "add_id": this.linkedUser.user_id };
    const url = "https://www.artisanideas.co.nz/api/app-rentice/unlink_employer.php";
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        console.log(resp);
        if(resp.error == true) {
            this.global.displayAlert('There is an error when unlink employer.')
			  		return ;
        }
        let user = resp.user;
        this.user = user;
        this.router.navigateByUrl('/link-accounts');
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There is an error when unlink employer.')
    });
  }
}
