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

@Component({
  selector: 'app-link-accounts',
  templateUrl: './link-accounts.page.html',
  styleUrls: ['./link-accounts.page.scss'],
})
export class LinkAccountsPage implements OnInit {

	user: any = {};
	data: any = {};
	userList: any = [];

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==link accounts page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.loadUserData();
    this.getUserList(this.user.user_id);
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

  getUserList(user_id) {
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_users_by_boss.php?boss=" + user_id;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        console.log(resp.data);
        this.userList = resp.data;
    }, (err) => {
        console.log("there is an error while get tutorname");
    });
  }
}
