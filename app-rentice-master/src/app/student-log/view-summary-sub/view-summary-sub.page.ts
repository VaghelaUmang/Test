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
  selector: 'app-view-summary-sub',
  templateUrl: './view-summary-sub.page.html',
  styleUrls: ['./view-summary-sub.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSummarySubPage implements OnInit {

	data: any = {};
	user: any = {};
  isCordova: boolean = false;
  resultList: any = [];
  renderList: any = [];
  mainCat: any;

  exportList: any = [];
  pdf: any;

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
  	console.log("==student view summary page===");
  	this.user = JSON.parse(localStorage.getItem("user"));

    this.mainCat = JSON.parse(localStorage.getItem('mainSummary'));

    this.resultList = [];
    this.global.allSubcategoryList.forEach(subCat => {
      if(parseInt(this.mainCat.cat) == parseInt(subCat.main)) {
        let activities = [];
        this.global.allActivityList.forEach(item => {
          if(parseInt(item.sub_category) == parseInt(subCat.list_id) || 
            parseInt(item.sub_category) == parseInt(subCat.cat)) {
              activities.push(item)
          }
        })

        let nHour = 0;
        activities.forEach(item => {
          this.global.allStudentLogList.forEach(data => {
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
      /*if(parseInt(this.mainCat.cat) == parseInt(subCat.main)) {
          let nHour = 0;
          this.global.allStudentLogList.forEach(data => {
            if((parseInt(subCat.list_id) == parseInt(data.sub_category) 
                || parseInt(subCat.cat) == parseInt(data.sub_category))) {
              nHour += parseFloat(data.inventory_value)
            }
          })
          this.resultList.push({
            cat: subCat.cat,
            list_id: subCat.list_id,
            name: subCat.name,
            hour: nHour
          })
      }*/
    })
    this.renderList = _.cloneDeep(this.resultList);
    console.log(this.renderList);

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
    localStorage.setItem('subSummary', JSON.stringify(item));
    this.router.navigateByUrl('/view-summary-activity')
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
    let pdfName = "Subcategory_Summary_" + new Date().getTime() + ".pdf";
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

  async exportPDF_FromHTML() {
    this.exportList = _.cloneDeep(this.resultList);
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    
    let self = this;
    this.pdf.fromHTML(window.document.getElementById("sub-summary"), 15, 15, {
      'width': 320
    }, function(a) {
      let pdfName = "Subcategory_Summary_" + new Date().getTime() + ".pdf";
      if(self.global.isCordova) {
        let pdfOutput = self.pdf.output();
        self.global.exportPDFCordova(pdfOutput, pdfName);
      } else {
        self.pdf.save(pdfName);
      }
    });
  }
}
