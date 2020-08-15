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
  selector: 'app-view-summary-activity',
  templateUrl: './view-summary-activity.page.html',
  styleUrls: ['./view-summary-activity.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSummaryActivityPage implements OnInit {

	data: any = {};
	user: any = {};
  activities: any = [];
  activityList: any = [];
  loading: any;

  isCordova: boolean = false;

  resultList: any = [];
  renderList: any = [];
  subCat: any;
  exportList: any = [];
  pdf: any;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public loadingController: LoadingController,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }


	ionViewDidEnter() {
  	console.log("==view summary activity page===");
  	this.user = JSON.parse(localStorage.getItem("user"));

    this.subCat = JSON.parse(localStorage.getItem('subSummary'));

    console.log(this.global.allMaincategoryList);
    console.log(this.global.allSubcategoryList);
    console.log(this.global.allStudentLogList);
    console.log(this.global.allActivityList);
    this.resultList = [];

    let activities = [];
    this.global.allActivityList.forEach(item => {
      if(parseInt(item.sub_category) == parseInt(this.subCat.list_id) || 
        parseInt(item.sub_category) == parseInt(this.subCat.cat)) {
          activities.push(item)
      }
    })

    console.log(activities);
    activities.forEach(item => {
      let nHour = 0;
      this.global.allStudentLogList.forEach(data => {
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

    this.cdRef.detectChanges();

    this.loadUserData();
  }

	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

	goItem(item) {
    console.log(item);
    localStorage.setItem('summaryActivity', JSON.stringify(item));
    this.router.navigateByUrl('/view-summary-detail')
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
    let pdfName = "Activity_Summary_" + new Date().getTime() + ".pdf";
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
