import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

declare var window;
declare var navigator;

import {
  File
} from '@ionic-native/file/ngx';

import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';

import { Camera } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.page.html',
  styleUrls: ['./view-project.page.scss'],
})
export class ViewProjectPage implements OnInit {
	data: any = {};
	user: any = {};
	currentProject: any;
	showButton: boolean = false;
	projectImg: any = null;
	imgURL: string = "";
	uploadLoading: any;
	loading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
  						public actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
  	this.currentProject = JSON.parse(localStorage.getItem("currentProject"));
    this.data = {
        id: this.currentProject.list_id,
        address: this.currentProject.address,
        date: this.currentProject.date,
        notes: this.currentProject.notes,
        project_image: this.currentProject.image,
        completed: this.currentProject.completed,
        isBoss: this.currentProject.isBoss ? true : false
    };
    
    if(this.data.completed === 1) {
        this.data.completed = true;
    } else {
        this.data.completed = false;
    }
    
    if(!this.data.project_image || this.data.project_image === '') {
        this.showButton = true;
    } else {
        this.showButton = false;
    }
    
    this.projectImg = null;

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
