import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ImagesProvider } from '../../services/images.images';
import { GlobalProvider } from '../../services/global-provider';
import * as _ from 'lodash';

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
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-tutor-view-summary',
  templateUrl: './view-summary.page.html',
  styleUrls: ['./view-summary.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorViewSummaryPage implements OnInit {

	data: any = {};
	user: any = {};
	inventoryList: any = [];
	mainCategoryList: any = [];
  subCategoryList: any = [];
  activities: any = [];
  activityList: any = [];
  addressList: any = [];
  currentStudent: any = {};
  studentImg: any;
  loading: any;
  imgURL: any;
  uploadLoading: any;
  showButton: boolean = false;
  main_category: any;
  bFirstLoad: boolean = true;
  currentActivityIdx: any;
  imageList: any = [];
  imageNewList: any = [];
  isCordova: boolean = false;
  pdf: any;
  pdfData: any;
  resultList: any = [];
  renderList: any = [];

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
              private socialSharing: SocialSharing,
  						public actionSheetCtrl: ActionSheetController,
              private sanitizer: DomSanitizer,
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewDidEnter() {
  	console.log("==tutor view summary page===");

    // this.resultList = [];
    // this.global.tutorMaincategoryList.forEach(item => {
    //   let nHour = 0;
    //   this.global.tutorInventoryList.forEach(data => {
    //     if(parseInt(item.cat) == parseInt(data.main_category)) {
    //       nHour += parseFloat(data.inventory_value)
    //     }
    //   })
    //   this.resultList.push({
    //     cat: item.cat,
    //     name: item.name,
    //     hour: nHour
    //   })
    // })

    this.resultList = [];
    this.global.tutorMaincategoryList.forEach(mainCat => {
      let nHour = 0;
      this.global.tutorSubcategoryList.forEach(subCat => {
        if(parseInt(mainCat.cat) == parseInt(subCat.main)) {
            let activities = [];
            this.global.tutorActivityList.forEach(item => {
              if(parseInt(item.sub_category) == parseInt(subCat.list_id) || 
                parseInt(item.sub_category) == parseInt(subCat.cat)) {
                  activities.push(item)
              }
            })
            activities.forEach(item => {
              this.global.tutorInventoryList.forEach(data => {
                if(item.name.toLowerCase() == data.inventory_item.toLowerCase() ||
                  item.name.toLowerCase() == data.inventory_item2.toLowerCase() ||
                  item.name.toLowerCase() == data.inventory_item3.toLowerCase()
                  ) {
                  nHour += parseFloat(data.inventory_value)
                }
              })
            })
        }
      })
      this.resultList.push({
        cat: mainCat.cat,
        list_id: mainCat.list_id,
        name: mainCat.name,
        hour: nHour
      })
    })
    
    this.renderList = _.cloneDeep(this.resultList);
    console.log(this.renderList);

    this.cdRef.detectChanges();
  }

  goSubSummary(item) {
    console.log(item);
    localStorage.setItem('tutorMainSummary', JSON.stringify(item));
    this.router.navigateByUrl('/tutor-view-summary-sub')
  }

}
