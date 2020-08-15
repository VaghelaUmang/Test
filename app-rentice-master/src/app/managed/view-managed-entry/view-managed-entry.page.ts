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
  selector: 'app-view-managed-entry',
  templateUrl: './view-managed-entry.page.html',
  styleUrls: ['./view-managed-entry.page.scss'],
})
export class ViewManagedEntryPage implements OnInit {

	data: any = {};
	user: any = {};
	uploadLoading: any;
  showButton: boolean = false;
  currentTimesheet: any = {};
  timesheetImg: any;
  addressList: any = [];
  imgURL: any;
  loading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  	console.log("==timesheet edit page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
  	this.currentTimesheet = JSON.parse(localStorage.getItem("currentManagedTimesheet"));
    console.log(this.currentTimesheet);
    this.data = {
        user_id: '',
        tutor: '',
        faculty: '',
        provider: '',
        timesheet_date: this.currentTimesheet.date,
        starttime: this.currentTimesheet.starttime,
        finishtime: this.currentTimesheet.finishtime,
        address: this.currentTimesheet.address,
        hours: this.currentTimesheet.hours,
        notes: this.currentTimesheet.notes,
        timesheet_image: this.currentTimesheet.image
    };

    this.loadUserData();
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

}
