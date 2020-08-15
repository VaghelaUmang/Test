import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { GlobalProvider } from '../../services/global-provider';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-tutor-view-summary-activity',
  templateUrl: './view-summary-activity.page.html',
  styleUrls: ['./view-summary-activity.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorViewSummaryActivityPage implements OnInit {

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
  subCat: any;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public loadingController: LoadingController,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }


	ionViewDidEnter() {
    this.subCat = JSON.parse(localStorage.getItem('tutorSubSummary'));

    this.resultList = [];

    let activities = [];
    this.global.tutorActivityList.forEach(item => {
      if(parseInt(item.sub_category) == parseInt(this.subCat.list_id) || 
        parseInt(item.sub_category) == parseInt(this.subCat.cat)) {
          activities.push(item)
      }
    })

    console.log(activities);
    activities.forEach(item => {
      let nHour = 0;
      this.global.tutorInventoryList.forEach(data => {
        if(item.name.toLowerCase() == data.inventory_item.toLowerCase() ||
          item.name.toLowerCase() == data.inventory_item2.toLowerCase() ||
          item.name.toLowerCase() == data.inventory_item3.toLowerCase()
          ) {
          nHour += parseFloat(data.inventory_value)
        }
      })
      this.resultList.push({
        name: item.name,
        hour: nHour
      })
    })

    this.renderList = _.cloneDeep(this.resultList);
    console.log(this.renderList);

    this.cdRef.detectChanges();
  }

	goItem(item) {
    localStorage.setItem('tutorsummaryActivity', JSON.stringify(item));
    this.router.navigateByUrl('/tutor-view-summary-detail')
  }

  exportPDF() {
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    console.log(this.resultList)
    this.pdf.setFontSize(16)
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(20, 30, this.subCat.name);
    this.pdf.setFontSize(15)
    this.pdf.setTextColor(56, 128, 255);
    this.pdf.text(20, 60, this.translate.instant('View_Summary_Text1'));
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(13)
    let pdfName = "Trainee_Activity_Summary_" + new Date().getTime() + ".pdf";
    let yPos = 90;
    this.resultList.forEach(item => {
       let wrap_notes = this.pdf.splitTextToSize(item.name, 250, {});
       this.pdf.text(20, yPos, wrap_notes);
       this.pdf.text(270, yPos, item.hour.toString());
       if(item.name.length < 55) {
         yPos += 20;
       } else if(item.name.length < 110){
         yPos += 30;
       } else {
         yPos += 45;
       }
    })
    if(this.global.isCordova) {
      let pdfOutput = this.pdf.output();
      this.global.exportPDFCordova(pdfOutput, pdfName);
    } else {
      this.pdf.save(pdfName);
    }
  }
}
