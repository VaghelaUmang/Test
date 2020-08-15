import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-staff-view-summary-sub',
  templateUrl: './view-summary-sub.page.html',
  styleUrls: ['./view-summary-sub.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffViewSummarySubPage implements OnInit {

	data: any = {};
	user: any = {};

  isCordova: boolean = false;
  pdf: any;
  resultList: any = [];
  renderList: any = [];
  mainCat: any;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewDidEnter() {
    this.mainCat = JSON.parse(localStorage.getItem('staffMainSummary'));

    this.resultList = [];
    this.global.staffSubcategoryList.forEach(subCat => {
      if(parseInt(this.mainCat.cat) == parseInt(subCat.main)) {
          let activities = [];
          this.global.staffActivityList.forEach(item => {
            if(parseInt(item.sub_category) == parseInt(subCat.list_id) || 
              parseInt(item.sub_category) == parseInt(subCat.cat)) {
                activities.push(item)
            }
          })
          let nHour = 0;
          console.log(activities);
          activities.forEach(item => {
            this.global.staffInventoryList.forEach(data => {
              if(item.name.toLowerCase() == data.inventory_item.toLowerCase() ||
                item.name.toLowerCase() == data.inventory_item2.toLowerCase() ||
                item.name.toLowerCase() == data.inventory_item3.toLowerCase()
                ) {
                nHour += parseFloat(data.inventory_value)
              }
            })
          })
          this.resultList.push({
            cat: subCat.cat,
            list_id: subCat.list_id,
            name: subCat.name,
            hour: nHour
          })
      }
    })
    this.renderList = _.cloneDeep(this.resultList);
    console.log(this.renderList);
    this.cdRef.detectChanges();
  }

	goItem(item) {
    console.log(item);
    localStorage.setItem('staffSubSummary', JSON.stringify(item));
    this.router.navigateByUrl('/staff-view-summary-activity')
  }

  exportPDF() {
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    console.log(this.resultList)
    this.pdf.setFontSize(16)
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(20, 30, this.mainCat.name);
    this.pdf.setFontSize(15)
    this.pdf.setTextColor(56, 128, 255);
    this.pdf.text(20, 60, this.translate.instant('View_Summary_Text1'));
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(13)
    let pdfName = "Staff_Subcategory_Summary_" + new Date().getTime() + ".pdf";
    let yPos = 90;
    this.resultList.forEach(item => {
       this.pdf.text(20, yPos, item.name);
       this.pdf.text(170, yPos, item.hour.toString());
       yPos += 20;
    })
    if(this.global.isCordova) {
      let pdfOutput = this.pdf.output();
      this.global.exportPDFCordova(pdfOutput, pdfName);
    } else {
      this.pdf.save(pdfName);
    }
  }
}
