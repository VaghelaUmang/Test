import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ActionSheetController, LoadingController } from '@ionic/angular';

import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
  File
} from '@ionic-native/file/ngx';

import * as jspdf from 'jspdf';
import * as _ from 'lodash';
import html2canvas from 'html2canvas';

declare var window;
declare var navigator;

@Component({
  selector: 'app-view-tutor-student-table',
  templateUrl: './view-tutor-student-table.page.html',
  styleUrls: ['./view-tutor-student-table.page.scss'],
})
export class ViewTutorStudentTablePage implements OnInit {

	data: any = {};
	user: any = {};
	mainCategoryList: any = [];
  subCategoryList: any = [];
  exportList: any = [];
  tableHtml: string = '';
  tablePortraitHtml: string = '';
  isCordova: boolean = false;
  photoList: any;
  listCnt: any = 0;

  pdf: any;
  exportLoading: any;

  constructor(private router: Router,
  						private cdRef: ChangeDetectorRef,
              private translate: TranslateService,
              private emailComposer: EmailComposer,
              private platform: Platform,
              public file: File,
              private socialSharing: SocialSharing,
              private loadingController: LoadingController,
              public actionSheetController: ActionSheetController,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
    console.log(this.user);
  	console.log("==view tutor student table page===");

    this.isCordova = this.global.isCordova;
		this.loadTableData();
  }

 	loadTableData() {
    this.tableHtml = '<thead><tr>\
        <th class="photo">Photo1</th>\
        <th class="photo">Photo2</th>\
        <th class="photo">Photo3</th>\
        <th>Category/Activity</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
        <th>Date</th>\
      </tr></thead><tbody>';
    if(!this.global.tutorStudentLog) {
      return ;
    }
    if(this.global.tutorStudentLog.length < 1) {
      return ;
    }
    this.global.tutorStudentLog.forEach(tableItem => {

      let mainCat = "";
      this.global.allMaincategoryList.forEach((item) => {
        if(item.cat == tableItem.main_category) {
          mainCat = item.name;
          return ;
        }
      });
      let subCat = "";
      this.global.allSubcategoryList.forEach((item) => {
        if(item.list_id == tableItem.sub_category) {
          subCat = item.name;
          return ;
        }
      });

      this.tableHtml += '<tr>';
      let dataUrl = '';
      if(tableItem.inventory_image.length > 0) {
        dataUrl = 'https://www.artisanideas.co.nz/itab/database/styled/' + tableItem.inventory_image;
        this.tableHtml += '<td><img style="max-width:80px" src="' + dataUrl + '" /></td>';
      } else {
        this.tableHtml += '<td></td>';
      }
      if(tableItem.inventory_image2 && tableItem.inventory_image2.length > 0) {
        dataUrl = 'https://www.artisanideas.co.nz/itab/database/styled/' + tableItem.inventory_image2;
        this.tableHtml += '<td><img style="max-width:80px" src="' + dataUrl + '" /></td>';
      } else {
        this.tableHtml += '<td></td>';
      }

      if(tableItem.inventory_image3 && tableItem.inventory_image3.length > 0) {
        dataUrl = 'https://www.artisanideas.co.nz/itab/database/styled/' + tableItem.inventory_image3;
        this.tableHtml += '<td><img style="max-width:80px" src="' + dataUrl + '" /></td>';
      } else {
        this.tableHtml += '<td></td>';
      }

      this.tableHtml += '<td><div>' + mainCat + '</div><div>' + subCat + '</div><div>';
      this.tableHtml += tableItem.inventory_item + '</div><div>' + tableItem.inventory_item2 + '</div><div>';
      this.tableHtml += tableItem.inventory_item3 + '</div><div></div><div></div></td>';
      this.tableHtml += '<td>' + tableItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
      this.tableHtml += '<td>' + tableItem.address + '</td>';
      this.tableHtml += '<td>' + tableItem.inventory_value + '</td>';
      this.tableHtml += '<td>' + tableItem.inventory_purchased + '</td>';
      this.tableHtml += '</tr>';
    });
  }

  async exportTable() {
    this.exportList = _.cloneDeep(this.global.tutorStudentLog);
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Export Mode',
      buttons: [{
        text: this.translate.instant('Portrait'),
        role: 'destructive',
        icon: 'phone-portrait',
        handler: () => {
          this.exportPDF("p");
        }
      }, {
        text: this.translate.instant('Landscape'),
        icon: 'phone-landscape',
        handler: () => {
          this.exportPDF("l");
        }
      }, {
        text: this.translate.instant('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async exportPDF(mode) {
    this.pdf = new jspdf(mode, 'px', 'a4'); // A4 size page of PDF
    this.exportLoading = await this.loadingController.create({
      message: this.translate.instant('Exporting as PDF...'),
    });
    await this.exportLoading.present();
    this.photoList = [];
    this.listCnt = 0;

    if(mode == 'l') {
      this.doExport(true);
    }
    else {
      //console.log(this.exportList)
      this.tablePortraitHtml = '<thead><tr>\
        <th class="photo">Photo1</th>\
        <th>Category/Activity</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
        <th>Date</th>\
      </tr></thead><tbody>';
      this.doPortraitExport(true);
    }
  }

  exportPDFCordova(pdfOutput, pdfName) {
    // using ArrayBuffer will allow you to put image inside PDF
    let buffer = new ArrayBuffer(pdfOutput.length);
    let array = new Uint8Array(buffer);
    for (var i = 0; i < pdfOutput.length; i++) {
        array[i] = pdfOutput.charCodeAt(i);
    }

    let directory = '';
    // For this, you have to use ionic native file plugin
    //const directory = this.file.externalApplicationStorageDirectory ;

    if(this.platform.is('android') == true) {
        directory = this.file.externalDataDirectory;  
    } else {
        directory = this.file.dataDirectory;
    }

    const fileName = pdfName;

    this.file.writeFile(directory, fileName, buffer)
    .then((success)=> {
      console.log("File created Succesfully" + JSON.stringify(success));
      this.socialSharing.share("This is Timesheet Pdf file for sharing", "timesheet pdf", directory + fileName, null);
    })
    .catch((error)=> {
      console.log("Cannot Create File " +JSON.stringify(error))
      this.global.displayAlert("Cannot create pdf file.");
    });
  }

  doExport(flag = false) {
    if(this.exportList.length < 1) {
      this.pdf.setFontSize(14);
      this.pdf.text(this.user.user_firstname + " " + this.user.user_lastname, 26, 22);
      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table6',
            columnStyles: {
              0: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              1: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              2: {halign: 'center', minCellWidth:60, minCellHeight: 60}
            },
            didDrawCell: data => {
              try {
                if(data.section === 'body') {
                  if (parseInt(data.column.index) === 0) {
                     var base64Img = this.photoList[data.row.index][0];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                  if (parseInt(data.column.index) === 1) {
                     var base64Img = this.photoList[data.row.index][1];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                  if (parseInt(data.column.index) === 2) {
                     var base64Img = this.photoList[data.row.index][2];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                }
              } catch(e) {
                console.log(e)
              }
            }
          });

          this.exportLoading.dismiss();
          let pdfName = "trainee_row_" + new Date().getTime() + ".pdf";
          if(this.global.isCordova) {
            let pdfOutput = this.pdf.output();
            this.exportPDFCordova(pdfOutput, pdfName);
          } else {
            this.pdf.save(pdfName);
          }
          return ;
      }, 500);
      
      return ;
    }

    let pdfItem = this.exportList[0];
    let mainCat = "";
    this.global.allMaincategoryList.forEach((item) => {
      if(item.cat == pdfItem.main_category) {
        mainCat = item.name;
        return ;
      }
    });
    let subCat = "";
    this.global.allSubcategoryList.forEach((item) => {
      if(item.list_id == pdfItem.sub_category) {
        subCat = item.name;
        return ;
      }
    });

    let imageList = [];
    if(pdfItem.inventory_image.length > 0) {
      imageList.push(pdfItem.inventory_image);
    }
    if(pdfItem.inventory_image2 && pdfItem.inventory_image2.length > 0) {
      imageList.push(pdfItem.inventory_image2);
    }
    if(pdfItem.inventory_image3 && pdfItem.inventory_image3.length > 0) {
      imageList.push(pdfItem.inventory_image3);
    }

    let n = 0;
    let width = this.pdf.internal.pageSize.getWidth();
    let height = this.pdf.internal.pageSize.getHeight();

    this.photoList[this.listCnt] = [];

    if(imageList.length > 0) {
      for(let i=0;i<imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
         if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
            this.photoList[this.listCnt].push(dataUrl);
         }  else {
             this.photoList[this.listCnt].push(null);
         }
         n++;
         if(n >= imageList.length) {
           for(let j=0;j<3-imageList.length;j++) {
                this.photoList[this.listCnt].push(null);
            }
            this.listCnt++;
            this.exportList.shift();
            this.doExport();
         }
        });
      }   
    } else {
      for(let j=0;j<3;j++) {
        if(this.photoList[this.listCnt])
            this.photoList[this.listCnt].push(null);
      }
      this.listCnt++;
      this.exportList.shift();
      this.doExport();
    }
  }

  doPortraitExport(flag = false) {
    if(this.exportList.length < 1) {
      this.tablePortraitHtml += '</tbody>';

      this.pdf.setFontSize(14);
      this.pdf.text(this.user.user_firstname + " " + this.user.user_lastname, 26, 22);
      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table7',
            columnStyles: {
              0: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              1: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              2: {halign: 'center', minCellWidth:60, minCellHeight: 60}
            },
            didDrawCell: data => {
              try {
                if(data.section == 'body') {
                  if (parseInt(data.column.index) === 0) {
                     var base64Img = this.photoList[data.row.index][0];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                }
              } catch(e) {
                console.log(e)
              }
            }
          });

          this.exportLoading.dismiss();
          let pdfName = "trainee_row_" + new Date().getTime() + ".pdf";
          if(this.global.isCordova) {
            let pdfOutput = this.pdf.output();
            this.exportPDFCordova(pdfOutput, pdfName);
          } else {
            this.pdf.save(pdfName);
          }
          return ;
      }, 2000);
      
      return ;
    }

    let pdfItem = this.exportList[0];
    let mainCat = "";
    this.global.allMaincategoryList.forEach((item) => {
      if(item.cat == pdfItem.main_category) {
        mainCat = item.name;
        return ;
      }
    });
    let subCat = "";
    this.global.allSubcategoryList.forEach((item) => {
      if(item.list_id == pdfItem.sub_category) {
        subCat = item.name;
        return ;
      }
    });

    let imageList = [];
    if(pdfItem.inventory_image.length > 0) {
      imageList.push(pdfItem.inventory_image);
    }

    let n = 0;
    let width = this.pdf.internal.pageSize.getWidth();
    let height = this.pdf.internal.pageSize.getHeight();
    this.tablePortraitHtml += '<tr>';
    this.photoList[this.listCnt] = [];

    if(imageList.length > 0) {
      for(let i=0;i<imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
         if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
          if(this.photoList[this.listCnt])
            this.photoList[this.listCnt].push(dataUrl);
          this.tablePortraitHtml += '<td><img style="min-width:80px" src="' + dataUrl + '" /></td>';
         }  else {
           if(this.photoList[this.listCnt])
             this.photoList[this.listCnt].push(null);
           this.tablePortraitHtml += '<td></td>';
         }
         n++;
         if(n >= imageList.length) {
           for(let j=0;j<1-imageList.length;j++) {
              this.tablePortraitHtml += '<td></td>';
              if(this.photoList[this.listCnt])
                this.photoList[this.listCnt].push(null);
            }
            this.tablePortraitHtml += '<td><div>' + mainCat + '</div><div>' + subCat + '</div><div>';
            this.tablePortraitHtml += pdfItem.inventory_item + '</div><div>' + pdfItem.inventory_item2 + '</div><div>';
            this.tablePortraitHtml += pdfItem.inventory_item3 + '</div><div></div><div></div></td>';

            this.tablePortraitHtml += '<td>' + pdfItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
            this.tablePortraitHtml += '<td>' + pdfItem.address + '</td>';
            this.tablePortraitHtml += '<td>' + pdfItem.inventory_value + '</td>';
            this.tablePortraitHtml += '<td>' + pdfItem.inventory_purchased + '</td>';
            this.tablePortraitHtml += '</tr>';
            this.listCnt++;
            this.exportList.shift();
            this.doPortraitExport();
         }
        });
      }   
    } else {
      for(let j=0;j<1;j++) {
        this.tablePortraitHtml += '<td></td>';
        if(this.photoList[this.listCnt])
            this.photoList[this.listCnt].push(null);
      }
      this.tablePortraitHtml += '<td><div>' + mainCat + '</div><div>' + subCat + '</div><div>';
      this.tablePortraitHtml += pdfItem.inventory_item + '</div><div>' + pdfItem.inventory_item2 + '</div><div>';
      this.tablePortraitHtml += pdfItem.inventory_item3 + '</div><div></div><div></div></td>';

      this.tablePortraitHtml += '<td>' +  pdfItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
      this.tablePortraitHtml += '<td>' + pdfItem.address + '</td>';
      this.tablePortraitHtml += '<td>' + pdfItem.inventory_value + '</td>';
      this.tablePortraitHtml += '<td>' + pdfItem.inventory_purchased + '</td>';
      this.tablePortraitHtml += '</tr>';
      this.listCnt++;
      this.exportList.shift();
      this.doPortraitExport();
    }
  }

  export() {
    let body = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><head><style>table {border-collapse: collapse;} td, th {border: 1px solid #ddd;padding: 8px;}</style></head>";
    body += '<body><table id="export-table">';
    body += this.tableHtml;
    body += '</table></body></html>'
    //console.log(body);
    if (!window.device) {
      //window.location = "mailto:artisan80@gmail.com?subject=hii&body="+body;
      //this.Export2Doc(body, 'test')
      if (navigator.share) {
        navigator.share({
            title: 'Web Fundamentals',
            text: 'Check out Web Fundamentals — it rocks!',
            url: 'https://developers.google.com/web',
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      }
    } else {
      let email = {
          to: 'artisan80@gmail.com',
          subject: "Tutor Record of Work",
          body: body,
          isHtml: true
      };
      this.emailComposer.open(email);
    }
  }
}
