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
  selector: 'app-view-summary-detail',
  templateUrl: './view-summary-detail.page.html',
  styleUrls: ['./view-summary-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSummaryDetailPage implements OnInit {

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
  activity: any;
  renderGroups: any = [];

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
  	console.log("==student view summary detail page===");
    this.user = JSON.parse(localStorage.getItem("user"));
    console.log(this.user);
    this.activity = JSON.parse(localStorage.getItem('summaryActivity'));
    this.resultList = [];
    this.global.allStudentLogList.forEach(data => {
      if(this.activity.name.toLowerCase() == data.inventory_item.toLowerCase() ||
        this.activity.name.toLowerCase() == data.inventory_item2.toLowerCase() ||
        this.activity.name.toLowerCase() == data.inventory_item3.toLowerCase()
        ) {
        this.resultList.push(data);
      }
    })

    //this.renderList = _.cloneDeep(this.resultList);
    //console.log(this.renderList);

    this.doSearch();
    this.cdRef.detectChanges();
  }

  async doSearch() {

    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    //debugger
    let results = this.resultList;
    let mainCatList = this.global.allMaincategoryList;
    let allSubCatList = this.global.allSubcategoryList.filter(item => item.faculty == this.user.faculty);

    results.forEach(item => {
      allSubCatList.forEach(subCat => {
        if(parseInt(item.sub_category) == parseInt(subCat.list_id) ||
          parseInt(item.sub_category) == parseInt(subCat.cat)){
          item.subCatName = subCat.name
        }
      })
    })
    console.log(results);
    console.log(allSubCatList);
    const groups = new Set(results.map(item => item.main_category));
    console.log(groups);
    let _result = [];

    groups.forEach((g: any) => {
      let data: any;
      data = results.filter(i => i.main_category === g); 
      const _groups = new Set(data.map(item => item.subCatName));
      let _result1 = [];
      let mainCatName = "";
      for(let i = 0 ;i<mainCatList.length;i++) {
        if(parseInt(g) == parseInt(mainCatList[i].cat)) {
          mainCatName = mainCatList[i].name;
        }
      }

      _groups.forEach((_g: any) => {
        let subCatName = "";
        let link = "";
        for(let i = 0 ;i<allSubCatList.length;i++) {
          /*if(parseInt(_g) == parseInt(allSubCatList[i].list_id) || 
            parseInt(_g) == parseInt(allSubCatList[i].cat)) {
            subCatName = allSubCatList[i].name;
            link = allSubCatList[i].link;
          }*/
          if(_g == allSubCatList[i].name) {
            subCatName = allSubCatList[i].name;
            link = allSubCatList[i].link;
          }
        }
        let data1: any;
        data1 = data.filter(i => i.subCatName === _g);
        _result1.push({
          id: _g,
          link: link,
          name: subCatName,
          values: data1
        });
      });

      _result.push({
        id: g,
        name: mainCatName,
        values: _result1
      });

    });

    this.renderGroups = Object.assign([], _result);
    console.log(this.renderGroups);
    this.cdRef.detectChanges();
    setTimeout(() => {
      loading.dismiss();
    }, 500);
  }

  goItem(item) {

  }
}
