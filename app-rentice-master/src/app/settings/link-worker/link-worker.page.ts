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
  selector: 'app-link-worker',
  templateUrl: './link-worker.page.html',
  styleUrls: ['./link-worker.page.scss'],
})
export class LinkWorkerPage implements OnInit {
	user: any = {};
	data: any = {};

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==link employers page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.loadUserData();
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

}
