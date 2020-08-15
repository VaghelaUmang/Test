import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, IonInfiniteScroll, AlertController, IonItemSliding } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { forkJoin, interval } from 'rxjs'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
  File
} from '@ionic-native/file/ngx';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { GlobalProvider } from '../services/global-provider';
import { saveAs } from 'file-saver';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { IonSelect } from '@ionic/angular';

declare var window;
declare var ga;

@Component({
  selector: 'app-student-log',
  templateUrl: './student-log.page.html',
  styleUrls: ['./student-log.page.scss'],
})
export class StudentLogPage implements OnInit {

	data: any = {};
	user: any = {};
	noMoreItemsAvailable: boolean = true;
	inventoryList: any = [];
	AllInventoryList: any = [];
  renderAllInventoryList: any = [];
	totalCount: any = 0;
	mainCategoryList: any = [];
  subCategoryList: any = [];
  activities: any = [];
  activityList: any = [];
  addressList: any = [];

  exportList: any = [];
  pdf: any;
  exportLoading: any;
  bFirstLoad: boolean = true;
  searchTxt: string = '';
  tableHtml: string = '';
  photoList: any;
  listCnt: any = 0;

  userList: any = [];
  showSubCategory: boolean = false;
  showActivity: boolean = false;

  bShowSummary: boolean = false;
  summaryList: any = [];

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  tableSummaryHtml: string = '';
  exportSummaryList: any = [];
  pdfSummary: any;
  exportSummaryLoading: any;

  rowstatusList: any = []
  portfolioList: any = []

  @ViewChild('select1') select1: IonSelect;
  selectedPortfolio: any;
  selectedItem: any;

  bShowSelectAll: boolean = false;
  changeStatusList: any = [];
  saveloading: any;
  fromRequestPage: boolean = false;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              public file: File,
              private storage: Storage,
              private socialSharing: SocialSharing,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
    this.tableHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Photo1</th>\
        <th class="photo">Photo2</th>\
        <th class="photo">Photo3</th>\
        <th>Category/Activity</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
        <th>Date</th>\
      </tr></thead><tbody>';

    this.tableSummaryHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Hours</th>\
      </tr></thead><tbody>';
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Record of Work');
      } else {
        if(this.ga) {
          this.ga.trackView('Record of Work');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
    console.log("==student log page===");
    this.user = JSON.parse(localStorage.getItem("user"));

    let date_to = new Date().toISOString().substr(0, 10);
    let date_from = new Date();
    date_from.setDate(date_from.getDate() - 30);
    this.data = {
        searchKey: '',
        user_id: '',
        main_category: '',
        sub_category: '',
        inventory_item: '',
        address: '',
        date_from: date_from.toISOString().substr(0, 10),
        date_to: date_to,
        showDates: false,
        user: [],
        status: '',
        selectAll: false
    };
    this.searchTxt = '';

    this.bFirstLoad = true;

    this.showSubCategory = false;
    this.showActivity = false;

    this.noMoreItemsAvailable = true;

    if(this.global.fromRequestPage) {
      this.fromRequestPage = true
    } else {
      this.fromRequestPage = false;
    }
    this.loadUserData();
    this.loadData();

    this.getAllActivites();
    this.getAddress();
    this.loadTenStudent();
    this.loadPortfolios();
  }

  async exportCSV() {
    let result = [];
    this.exportList.forEach(item => {
      let mainCat = "";
      this.mainCategoryList.forEach((cat) => {
        if(cat.cat == item.main_category) {
          mainCat = cat.name;
          return ;
        }
      });
      let subCat = "";
      this.global.allSubcategoryList.forEach((cat) => {
        if(parseInt(cat.list_id) == parseInt(item.sub_category) ||
          parseInt(cat.cat) == parseInt(item.sub_category)) {
          subCat = cat.name;
          return ;
        }
      });
      result.push({
        name: item.name,
        main_cat: mainCat,
        sub_cat: subCat,
        inventory_item: item.inventory_item,
        inventory_item2: item.inventory_item2,
        inventory_item3: item.inventory_item3,
        notes: item.notes,
        address: item.address,
        hours: item.inventory_value,
        date: item.inventory_purchased
      })
    })
     
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      headers: ["Name", "Main Category", "Sub Category", "Activity1", "Activity2", "Activity3", "Notes", "Address/Projects", "Hours", "Date"],
      nullToEmptyString: true,
    };

    let csvName = "studentlog_" + new Date().getTime();
    let csvdata: any  = new Angular5Csv(result, csvName, options);
    //console.log(csvdata);

   if (!window.device) {
      return ;
    }
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    let dataDir = "";
      if(this.platform.is('android') == true) {
          dataDir = this.file.externalDataDirectory;  
      } else {
          dataDir = this.file.dataDirectory;
      }
      csvName += ".csv";
    this.file.writeFile(dataDir, csvName, csvdata.csv, {replace: true})
     .then(() => {
       loading.dismiss();
       this.socialSharing.share("This is a backcosting csv file for sharing", "backcosting csv", dataDir + csvName, null);
     })
     .catch((err) => {
       loading.dismiss();
       console.error(err);
       this.global.displayAlert("Cannot create csv file.");
     });
  }

  async exportCSV_Mobile() {
      let dataDir = "";
      if(this.platform.is('android') == true) {
          dataDir = this.file.externalDataDirectory;  
      } else {
          dataDir = this.file.dataDirectory;
      }

      let csvName = "studentlog_" + new Date().getTime() + ".csv";
      let csv = 'Name,Main Category,Sub Category,Activity1,Activity2,Activity3,Notes,Address/Projects,Hours,Date,\n';
      for(let i=0;i<this.exportList.length;i++) {
          let mainCat = "";
          this.mainCategoryList.forEach((cat) => {
            if(cat.cat == this.exportList[i].main_category) {
              mainCat = cat.name;
              return ;
            }
          });
          let subCat = "";
          this.global.allSubcategoryList.forEach((cat) => {
            if(parseInt(cat.list_id) == parseInt(this.exportList[i].sub_category) ||
              parseInt(cat.cat) == parseInt(this.exportList[i].sub_category)) {
              subCat = cat.name;
              return ;
            }
          });
          csv += this.exportList[i].name + ',';
          csv += mainCat + ',';
          csv += subCat + ',';
          csv += this.exportList[i].inventory_item + ',';
          csv += this.exportList[i].inventory_item2 + ',';
          csv += this.exportList[i].inventory_item3 + ',';
          csv += this.exportList[i].notes + ',';
          csv += this.exportList[i].address + ',';
          csv += this.exportList[i].inventory_value + ',';
          csv += this.exportList[i].inventory_purchased + ',\n';
      }

      this.file.writeFile(dataDir, csvName, csv, {replace: true})
         .then(() => {
           this.socialSharing.share("This is a backcosting csv file for sharing", "backcosting csv", dataDir + csvName, null);
         })
         .catch((err) => {
           console.error(err);
           this.global.displayAlert("Cannot create csv file.");
         });
  }

  async exportPDF() {
    if(this.bShowSummary) {
      this.exportPDFSummary();
      return ;
    }
    this.exportList = _.cloneDeep(this.inventoryList);
    this.pdf = new jspdf('l', 'px', 'a4'); // A4 size page of PDF
    this.exportLoading = await this.loadingController.create({
      message: this.translate.instant('Exporting as PDF...'),
    });
    await this.exportLoading.present();
    this.tableHtml = '<thead><tr>\
        <th>Name</th>\
        <th>Photo 1</th>\
        <th>Photo 2</th>\
        <th>Photo 3</th>\
        <th>Category/Activity</th>\
        <th>Notes</th>\
        <th>Project</th>\
        <th>Hrs</th>\
        <th>Date</th>\
      </tr></thead><tbody>';
    this.photoList = [];
    this.listCnt = 0;
    this.doExport(true);
  }

  async exportPDFSummary() {
    this.exportSummaryList = _.cloneDeep(this.summaryList);
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    this.exportLoading = await this.loadingController.create({
      message: this.translate.instant('Exporting as PDF...'),
    });
    await this.exportLoading.present();
    this.tableSummaryHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Hours</th>\
      </tr></thead><tbody>';
    this.doSummaryExport(true);
  }

  doExport(flag = false) {
    if(this.exportList.length < 1) {
      this.tableHtml += '</tbody>';

      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table',
            columnStyles: {
              0: {cellWidth: 50},
              1: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              2: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              3: {halign: 'center', minCellWidth:60, minCellHeight: 60}}, // Cells in first column centered and green
              4: {cellWidth: 50},
              5: {minCellWidth: 50},
              6: {cellWidth: 50},
              7: {minCellWidth: 40, cellWidth: 40},
              8: {minCellWidth: 50, cellWidth: 40},
            didDrawCell: data => {
              //console.log(data);
              if(data.section === 'body') {
                //console.log(data.cell);
                try {
                  if (parseInt(data.column.index) === 1) {
                     var base64Img = this.photoList[data.row.index][0];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                  if (parseInt(data.column.index) === 2) {
                     var base64Img = this.photoList[data.row.index][1];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                  if (parseInt(data.column.index) === 3) {
                     var base64Img = this.photoList[data.row.index][2];
                     if(base64Img)
                       this.pdf.addImage(base64Img, 'JPG', data.cell.x + 2, data.cell.y + 2, 60, 60);
                  }
                } catch(e) {

                }
              }
            }
          });

        this.exportLoading.dismiss();
        let pdfName = "ROW_" + new Date().getTime() + ".pdf";
        if(this.global.isCordova) {
          let pdfOutput = this.pdf.output();
          this.global.exportPDFCordova(pdfOutput, pdfName);
        } else {
          this.pdf.save(pdfName);
          //let pdfOutput = this.pdf.output('bloburl');
          //window.open(pdfOutput, '_blank');
        }
        return ;
      }, 0);
      return ;
    }
    if(flag != true) {
      //this.pdf.addPage();
    }
    let pdfItem = this.exportList[0];
    let mainCat = "";
    this.mainCategoryList.forEach((item) => {
      if(item.cat == pdfItem.main_category) {
        mainCat = item.name;
        return ;
      }
    });
    let subCat = "";
    this.global.allSubcategoryList.forEach((item) => {
      if(parseInt(item.list_id) == parseInt(pdfItem.sub_category) ||
        parseInt(item.cat) == parseInt(pdfItem.sub_category)) {
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

    this.tableHtml += '<tr>';
    this.tableHtml += '<td>' + pdfItem.name + '</td>';
    this.photoList[this.listCnt] = [];
    if(imageList.length > 0) {
      for(let i=0;i<imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
         //console.log(dataUrl);
         if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
           //this.pdf.addPage();
           //this.pdf.addImage(dataUrl, "JPG", 0, 0, width, height);
           if(this.photoList[this.listCnt])
             this.photoList[this.listCnt].push(dataUrl);
           this.tableHtml += '<td><img style="min-width:80px" src="' + dataUrl + '" /></td>';
         } else {
           if(this.photoList[this.listCnt])
             this.photoList[this.listCnt].push(null);
           this.tableHtml += '<td><img src="https://www.google.com/logos/doodles/2016/user-birthday-5656109189693440.4-s.png" /></td>';
         }
         n++;
          
         if(n >= imageList.length) {
            for(let j=0;j<3-imageList.length;j++) {
              this.tableHtml += '<td><img src="https://www.google.com/logos/doodles/2016/user-birthday-5656109189693440.4-s.png" /></td>';
              if(this.photoList[this.listCnt])
                this.photoList[this.listCnt].push(null);
            }
            this.tableHtml += '<td><div>' + mainCat + '</div><div>' + subCat + '</div><div>';
            this.tableHtml += pdfItem.inventory_item + '</div><div>' + pdfItem.inventory_item2 + '</div><div>';
            this.tableHtml += pdfItem.inventory_item3 + '</div><div></div><div></div></td>';

            this.tableHtml += '<td>' + pdfItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
            this.tableHtml += '<td>' + pdfItem.address + '</td>';
            this.tableHtml += '<td>' + pdfItem.inventory_value + '</td>';
            this.tableHtml += '<td>' + pdfItem.inventory_purchased + '</td>';
            this.tableHtml += '</tr>';
            this.listCnt++;
            this.exportList.shift();
            this.doExport();
         }
        });
      }   
    } else {
      for(let j=0;j<3;j++) {
        this.tableHtml += '<td><img src="https://www.google.com/logos/doodles/2016/user-birthday-5656109189693440.4-s.png" /></td>';
        if(this.photoList[this.listCnt])
            this.photoList[this.listCnt].push(null);
      }
      this.tableHtml += '<td><div>' + mainCat + '</div><div>' + subCat + '</div><div>';
      this.tableHtml += pdfItem.inventory_item + '</div><div>' + pdfItem.inventory_item2 + '</div><div>';
      this.tableHtml += pdfItem.inventory_item3 + '</div><div></div><div></div></td>';

      this.tableHtml += '<td>' +  pdfItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
      this.tableHtml += '<td>' + pdfItem.address + '</td>';
      this.tableHtml += '<td>' + pdfItem.inventory_value + '</td>';
      this.tableHtml += '<td>' + pdfItem.inventory_purchased + '</td>';
      this.tableHtml += '</tr>';
      this.listCnt++;
      this.exportList.shift();
      this.doExport();
    }
  }

  doSummaryExport(flag = false) {
    if(this.exportSummaryList.length < 1) {
      this.tableSummaryHtml += '</tbody>';

      this.pdf.setFontSize(14);
      this.pdf.text(this.user.user_firstname + " " + this.user.user_lastname, 26, 22);

      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table13',
            columnStyles: {
              0: {minCellWidth:60, minCellHeight: 35}, 
              1: {minCellWidth:60, minCellHeight: 35}
            },
            didDrawCell: data => {
              //console.log(data);
              if(data.section == 'body') {
              }
            }
          });
          let pdfName = "ROW" + new Date().getTime() + ".pdf";
          if(this.global.isCordova) {
            let pdfOutput = this.pdf.output();
            this.global.exportPDFCordova(pdfOutput, pdfName);
          } else {
            this.pdf.save(pdfName);
          }

          setTimeout(() => {
            this.exportLoading.dismiss();
          }, 2000)
          return ;
      }, 0);
      
      return ;
    }

    let pdfItem = this.exportSummaryList[0];

    try {
      this.tableSummaryHtml += '<tr>';
      this.tableSummaryHtml += '<td>' + pdfItem.name + '</td>';
      this.tableSummaryHtml += '<td>' + pdfItem.hour + '</td>';
      this.tableSummaryHtml += '</tr>';
    } catch(e) {
      this.tableSummaryHtml += '<tr>';
      this.tableSummaryHtml += '<td></td>';
      this.tableSummaryHtml += '<td></td>';
      this.tableSummaryHtml += '</tr>';
    }

    this.exportSummaryList.shift();
    this.doSummaryExport();
  }

 	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;

      this.getUserList(this.data.user_id);
  }

  loadData() {
      this.mainCategoryList = [];
      this.subCategoryList = [];
      this.activities = [];

      if(this.global.allMaincategoryList.length > 0) {
        this.mainCategoryList =  this.global.allMaincategoryList;
      } else {
        this.getMainCategory();
      }
  }

  onKeyPressed(event) {
    if(event.keyCode == 13) {
      this.showEntries();
    }
  }

  async getUserList(user_id) {
    const loading = await this.loadingController.create({
      message: ''
    });
    await loading.present();
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_users_by_boss.php?boss=" + user_id;
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        this.userList = resp.data;
    }, (err) => {
        loading.dismiss();
        console.log("there is an error while get tutorname");
    });
  }

  async loadRowStatus() {
    this.rowstatusList = []
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_rowstatus.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        this.rowstatusList = resp.data;
        this.showEntries(!this.bShowSummary)
    }, (err) => {
        console.log("there is an error while get tutorname");
    });
  }

	async loadTenStudent() {
    this.inventoryList = [];

    localStorage.removeItem("bLoadStudentLog")
    
    let url = "https://www.artisanideas.co.nz/api/app-rentice/search_inventory_by_student.php?student=" + this.data.user_id;
    const loading = await this.loadingController.create({
      message: ''
    });
    await loading.present();
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss();
        //console.log(resp.data);
        if(resp.error == true) {
            this.global.displayAlert("There is an error when search inventory.");
            return ;
        }
        
        resp.data.forEach(item => {
          item.name = this.user.user_firstname + " " + this.user.user_lastname;
        });
        this.AllInventoryList = resp.data;
        this.renderAllInventoryList = _.cloneDeep(resp.data);
        this.totalCount = this.AllInventoryList.length;

        let now: any = new Date();
        window.localStorage.setItem("allStudentLogDate", now.getTime());
        let data = JSON.stringify(resp.data);
        this.storage.set('allStudentLogList', data);
        this.global.allStudentLogList = resp.data;

        // if(this.totalCount > 10) {
        //     this.inventoryList = this.AllInventoryList.slice(0, 10);
        // } else {
        //     this.inventoryList = this.AllInventoryList;
        // }
        // //this.inventoryList = this.AllInventoryList;
        // if(this.infiniteScroll)
        //   this.infiniteScroll.disabled = false;
        // this.exportList = _.cloneDeep(this.inventoryList);

        // this.cdRef.detectChanges();

        this.loadRowStatus();
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert("There is an error when search inventory.");
    });
  }

  async loadStudentLog() {
    if(this.bFirstLoad) {
      this.bFirstLoad = false;
      return ;
    }

    let funcList = [];

    this.userList.forEach(item => {
      this.data.user.forEach(_user => {
        if(item.user_firstname == _user) {
          let url = "https://www.artisanideas.co.nz/api/app-rentice/search_inventory_by_student.php?student=" + item.user_id;
          funcList.push(this.http.get(url));
        }
      })
    })

    if(funcList.length < 1) {
      this.loadTenStudent();
      return ;
    }

    this.bShowSelectAll = true;

    let results = [];
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    forkJoin(funcList).subscribe(data => {
      loading.dismiss();
      //console.log(data);
      if(data && data.length > 0) {
        data.forEach(item => {
          results = results.concat(item.data);
        })
      }
      //console.log(results);

      results.forEach(item => {
        for(let i=0;i<this.userList.length;i++) {
          if(parseInt(item.student) == parseInt(this.userList[i].user_id)) {
            item.name = this.userList[i].user_firstname + " " + this.userList[i].user_lastname;
            break;
          }
        }
      });
      this.renderAllInventoryList = results;
      this.AllInventoryList = results;
      this.showEntries();
    }, err => {
        loading.dismiss();
        console.log(err);
    });
  }

  async showEntries(bList = true) {
      this.bShowSummary = !bList;
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      //console.log(this.AllInventoryList);
      let list = _.cloneDeep(this.AllInventoryList);
      list.map((item) => {
        this.mainCategoryList.forEach((cat) => {
          if(parseInt(item.main_category) == parseInt(cat.cat)) {
            item.mainCatVal = cat.name;
          }
        });
        this.subCategoryList.forEach((cat) => {
          if(parseInt(item.sub_category) == parseInt(cat.list_id)) {
            item.subCatVal = cat.name;
          }
        });
        this.rowstatusList.forEach(row => {
          if(item.inventory_id == row.entry) {
            item.status = row.status;
          }
        })
      });
      
      let AllInventoryList = [];

      let subCatList = [];
      this.global.allSubcategoryList.forEach(subcat => {
       if(subcat.keywords) {
         let keywords = subcat.keywords.toLowerCase();
         if(keywords.indexOf(this.searchTxt.toLowerCase()) > -1) {
           subCatList.push(subcat.list_id);
         }
       }
      });

      list.forEach((item) => {
        if(this.data.status == "" || this.data.status == item.status) {
          if(this.data.main_category == "" || this.data.main_category == item.main_category) {
            if(this.data.sub_category == "" || this.data.sub_category == item.sub_category) {
              if(this.data.address == "" || this.data.address == item.address) {
               if(this.data.inventory_item == "" || 
                 this.data.inventory_item == item.inventory_item ||
                 this.data.inventory_item == item.inventory_item2 || 
                 this.data.inventory_item == item.inventory_item3) {
                 let from_date = new Date(this.data.date_from).getTime();
                 let to_date = new Date(this.data.date_to).getTime();
                 let date = new Date(item.inventory_purchased).getTime();
                 if(!this.data.showDates || (date>=from_date && date<=to_date)) {
                   
                   if(this.searchTxt.length < 0) {
                     AllInventoryList.push(item);
                   } else {
                     let flag = false;
                     for (var idx in item) {
                       let _item = item[idx].toString();
                       _item = _item.toLowerCase();
                       if(_item.indexOf(this.searchTxt.toLowerCase()) > -1) {
                         flag = true;
                         break;
                       }
                     }

                     subCatList.forEach(subcat => {
                       if(parseInt(item.sub_category) == parseInt(subcat)) {
                         flag = true;
                       }
                     })

                     if(flag) {
                       AllInventoryList.push(item);
                     }
                   }
                 }
               }
              }
            }
          }
          }
      });

      this.renderAllInventoryList = _.cloneDeep(AllInventoryList);
      this.totalCount = AllInventoryList.length;
      if(this.totalCount > 10) {
          this.inventoryList = AllInventoryList.slice(0, 10);
      } else {
          this.inventoryList = _.cloneDeep(AllInventoryList);
      }

      if(this.infiniteScroll)
        this.infiniteScroll.disabled = false;

      this.exportList = _.cloneDeep(this.inventoryList);

      //console.log(this.renderAllInventoryList)
      setTimeout(() => {
        loading.dismiss();
      }, 500);

      ////Processing Summary Result
      if(bList == false) {//bList = false: Summary
        this.viewSummary()
      }
  }

	async getMainCategory() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory.php?faculty=" + this.user.faculty;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.mainCategoryList = resp.category;
          let now: any = new Date();
          window.localStorage.setItem("categoryDate", now.getTime());
          const data = JSON.stringify(this.mainCategoryList);
          window.localStorage.setItem("maincategory", data);
          this.storage.set('maincategory', data);
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get categories.");
      });  
  }

	async getSubCategory() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory.php?faculty=" + this.user.faculty;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.subCategoryList = resp.category;
          const now : any = new Date();
          window.localStorage.setItem("categoryDate", now.getTime());
          const data = JSON.stringify(this.subCategoryList);
          window.localStorage.setItem("subcategory", data);
          this.storage.set('allSubCategory', data);
          this.storage.set('allSubCategoryDate', now.getTime());
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get subcategories.");
      });  
  }

  async getAllActivites() {
      let date: any = window.localStorage.getItem("activityDate");
      this.activityList = this.global.allActivityList;
      if(this.activityList.length > 0) {
        return ;
      }
        
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_allactivities.php?faculty=" + this.user.faculty;
      this.activityList = [];
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          let activityList = resp.data;
          let now: any = new Date();
          window.localStorage.setItem("activityDate", now.getTime());
          let data = JSON.stringify(activityList);
          window.localStorage.setItem("allactivity", data);
          this.activityList = activityList;
          this.storage.set('allactivity', data);
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get activities.");
      });
  }

  async getAddress() {
      this.addressList = this.global.allAddressList;
      if(this.addressList.length > 0) {
        return ;
      }
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
      this.addressList = [];
      this.http.get(url).subscribe((resp: any) => {
          this.addressList = resp.data;
      }, (err) => {
          this.global.displayAlert("There is an error when get address.");
      });
  }

  loadMore(event) {
      //Load More 10 items
      if(this.inventoryList === null || this.inventoryList === undefined) {
          return ;
      }
      let nCount = this.inventoryList.length;
      let moreList = [];
      if(nCount+10>this.totalCount) {
          let n = this.totalCount - nCount;
          moreList = this.renderAllInventoryList.slice(nCount, nCount+n);
      } else {
          moreList = this.renderAllInventoryList.slice(nCount, nCount+10);
      }
      
      this.inventoryList = this.inventoryList.concat(moreList);
      this.infiniteScroll.disabled = false;
      if(this.inventoryList.length >= this.totalCount) {
          this.noMoreItemsAvailable = true;
          this.infiniteScroll.disabled = true;
      }
      event.target.complete();
      this.exportList = _.cloneDeep(this.inventoryList);
  }

  async changeMainCategory() {
      if(this.data.main_category.length < 1) {
        return ;
      }

      this.bShowSelectAll = true;

      this.showSubCategory = true;
      const allSubcategoryList = this.global.allSubcategoryList;
      let subCategoryList = [];
      for(let i=0;i<allSubcategoryList.length;i++) {
        if(allSubcategoryList[i].main == this.data.main_category) {
          subCategoryList.push(allSubcategoryList[i]);
        }
      }
      this.subCategoryList = subCategoryList;

      this.data.sub_category = "";
      this.data.inventory_item = "";

      this.showEntries(!this.bShowSummary);
  }

  changeSubCategory() {
      let dataList = this.activityList;
      this.activities = [];
      for (let i = 0; i < dataList.length; i++) {
          if (dataList[i].sub_category == this.data.sub_category) {
              this.activities.push(dataList[i]);
              continue;
          }
      }
      this.data.inventory_item = "";
      this.showActivity = true;
      this.cdRef.detectChanges();

      this.showEntries(!this.bShowSummary);
  }

  changeProject() {
    if(this.data.address.length < 1) {
      return ;
    }
    this.bShowSelectAll = true;
    this.showEntries(!this.bShowSummary);
  }

  changeFilterStatus() {
    if(this.data.status.length < 1) {
      return ;
    }
    this.bShowSelectAll = true;
    this.showEntries(!this.bShowSummary);
  }

  clearFilter() {
    this.data.status = "";
    this.data.main_category = "";
    this.data.user = [];
    this.data.sub_category = "";
    this.data.inventory_item = "";
    this.data.address = "";
    this.data.showDates = false;
    this.searchTxt = '';
    let date_to = new Date().toISOString().substr(0, 10);
		let date_from = new Date();
		date_from.setDate(date_from.getDate() - 30);
    this.data.date_from = date_from.toISOString().substr(0, 10);
    this.data.date_to = date_to;
    this.showSubCategory = false;
    this.showActivity = false;
    this.bShowSelectAll = false;

    this.showEntries();
  }

  goStudentItem(slidingItem: IonItemSliding, item) {
    if(slidingItem)
        slidingItem.close();
    localStorage.setItem("currentStudent", JSON.stringify(item));
    console.log(item);  
    this.router.navigateByUrl('/view-sl-entry');
  }

  statusFilter(item) {
    return this.data.status == '' || item.status == this.data.status
  }

  async changeStatus(slidingItem: IonItemSliding, item, status) {
      if(slidingItem)
        slidingItem.close();

      let subCat = item.sub_category;
      const allSubcategoryList = this.global.allSubcategoryList;
      let subCategoryList = [];
      for(let i=0;i<allSubcategoryList.length;i++) {
        if(parseInt(allSubcategoryList[i].list_id) == parseInt(item.sub_category) || 
          parseInt(allSubcategoryList[i].cat) == parseInt(item.sub_category)) {
          subCat = allSubcategoryList[i].name;
          break;
        }
      }
      const data = {
          added: this.user.user_id,
          student: item.student,
          faculty: this.user.faculty,
          provider: this.user.provider,
          sub: subCat,
          activity: item.inventory_item,
          activity2: item.inventory_item2,
          activity3: item.inventory_item3,
          photo: item.inventory_image,
          photo2: item.inventory_image2,
          photo3: item.inventory_image3,
          status: status,
          notes: item.notes,
          entry: item.inventory_id
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/save_rowstatus.php";
      const loading = await this.loadingController.create({
        message: this.translate.instant('Saving status...')
      });
      await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error == true) {
              this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
              return ;
          }

          this.loadRowStatus();
          //this.global.displayAlert("Status has been saved.")
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when save status. Please try again later.");
      });
  }

 addPortfolio(slidingItem: IonItemSliding, item, status) {
      slidingItem.close();
      this.selectedItem = item;
      this.saveToPortfolio()
  }

  async loadPortfolios() {
      this.portfolioList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_portfolio.php";
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get portfolio list.");
              return ;
          }
          resp.data.forEach(item => {
            if(item.user_id == this.user.user_id) {
              this.portfolioList.push(item)
            }
          })
          if(this.portfolioList.length > 0) {
            this.selectedPortfolio = this.portfolioList[0].list_id;
          }
          
      }, (err) => {
          this.global.displayAlert("There is an error when get portfolio list.");
      }); 
  }

  selectPortfolio(slidingItem: IonItemSliding, item, status) {
    slidingItem.close();
    this.selectedItem = item;
    this.select1.open();
  }

  selPortfolio() {
    this.saveToPortfolio()
  }

  async saveToPortfolio() {
      if(!this.selectedItem) {
        return ;
      }

      const item = this.selectedItem;
      const data = {
          list_no: this.selectedPortfolio,
          name: item.name,
          added: this.user.user_id,
          student: this.user.tutor,
          provider: this.user.provider,
          faculty: this.user.faculty,
          main: item.main_category,
          sub: item.sub_category,
          activity: item.inventory_item,
          activity2: item.inventory_item2,
          activity3: item.inventory_item3,
          photo: item.inventory_image,
          photo2: item.inventory_image2,
          photo3: item.inventory_image3,
          purchased: item.inventory_purchased,
          status: item.status ? item.status: "",
          notes: item.notes,
          value: item.inventory_value,
          address: item.address,
          entry: ""
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/save_portfolio_item.php";
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error === true) {
              this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
              return ;
          }
          this.global.displayAlert("Portfolio Item is added.")
          //this.loadPortfolios();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
      });
  }

  async viewSummary() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.bShowSummary = true;
    this.bShowSelectAll = false;

    //this.router.navigateByUrl('/view-summary');
    let mainCatList = [], subCatList = [], activityList = [];

    this.summaryList = [];
    if(this.data.main_category.length < 1) {
      mainCatList = this.mainCategoryList
    } else {
      this.mainCategoryList.forEach(item => {
        if(item.cat == this.data.main_category) {
            mainCatList.push(item)
        }
      })
    }

    if(this.data.sub_category.length < 1) {
      subCatList = this.subCategoryList
    } else {
      this.subCategoryList.forEach(item => {
        if(item.cat == this.data.sub_category) {
            subCatList.push(item)
        }
      })
    }

    if(this.data.inventory_item.length < 1) {
      activityList = this.activityList
    } else {
      this.activities.forEach(item => {
        if(item.name == this.data.inventory_item) {
            activityList.push(item)
        }
      })
    }

    // mainCatList.forEach(mainCat => {
    //   let nHour = 0;
    //   this.inventoryList.forEach(item => {
    //     if(item.main_category == mainCat.cat)
    //       nHour += parseFloat(item.inventory_value)
    //   })
    //   this.summaryList.push({
    //     cat: mainCat.cat,
    //     name: mainCat.name,
    //     hour: nHour
    //   })
    // });

    mainCatList.forEach(mainCat => {
      let nHour = 0;
      this.global.allSubcategoryList.forEach(subCat => {
        if(parseInt(mainCat.cat) == parseInt(subCat.main)) {
          let activities = [];
          this.global.allActivityList.forEach(item => {
            if(parseInt(item.sub_category) == parseInt(subCat.list_id) || 
              parseInt(item.sub_category) == parseInt(subCat.cat)) {
                activities.push(item)
            }
          })

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

          // if(this.activities.length < 1) {
          //   this.inventoryList.forEach(item => {
          //       nHour += parseFloat(item.inventory_value)
          //   })
          // } else {
          //   this.activities.forEach(item => {
          //     this.inventoryList.forEach(data => {
          //       if(item.name.toLowerCase() == data.inventory_item.toLowerCase() ||
          //         item.name.toLowerCase() == data.inventory_item2.toLowerCase() ||
          //         item.name.toLowerCase() == data.inventory_item3.toLowerCase()
          //         ) {
          //         nHour += parseFloat(data.inventory_value)
          //       }
          //     })
          //   })
          // }
        }
      })

      this.summaryList.push({
        cat: mainCat.cat,
        name: mainCat.name,
        hour: nHour
      })
    })

    setTimeout(() => {
      loading.dismiss();
    }, 500)
  }

  viewTable() {
    this.global.tutorStudentLog = this.inventoryList;
    this.router.navigateByUrl('/student-log-table');
  }

  goSubSummary(item) {
    //console.log(item);
    localStorage.setItem('mainSummary', JSON.stringify(item));
    this.router.navigateByUrl('/view-summary-sub')
  }

  async selectAll() {
    const alert = await this.alertController.create({
      header: 'Update Status',
      cssClass: 'select-all-alert',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: this.translate.instant('Self Check'),
          value: 'Self Check',
          checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: this.translate.instant('Review Requested'),
          value: 'Review Requested'
        }
      ],
      message: 'Swipe left on activities to update individual activities.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.data.selectAll = false;
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Update',
          handler: async (value) => {
            this.data.selectAll = false;
            this.changeStatusList = _.cloneDeep(this.renderAllInventoryList);
            if(this.changeStatusList.length > 0) {
              this.saveloading = await this.loadingController.create({
                message: this.translate.instant('Saving status...')
              });
              await this.saveloading.present();
              this.changeMultiStatus(value)
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async changeMultiStatus(value) {
    if(this.changeStatusList.length < 1) {
      this.saveloading.dismiss();
      this.loadRowStatus();
      return ;
    }

    const item = this.changeStatusList[0];

    let subCat = item.sub_category;
      const allSubcategoryList = this.global.allSubcategoryList;
      let subCategoryList = [];
      for(let i=0;i<allSubcategoryList.length;i++) {
        if(parseInt(allSubcategoryList[i].list_id) == parseInt(item.sub_category) || 
          parseInt(allSubcategoryList[i].cat) == parseInt(item.sub_category)) {
          subCat = allSubcategoryList[i].name;
          break;
        }
      }
      const data = {
          added: this.user.user_id,
          student: item.student,
          faculty: this.user.faculty,
          provider: this.user.provider,
          sub: subCat,
          activity: item.inventory_item,
          activity2: item.inventory_item2,
          activity3: item.inventory_item3,
          photo: item.inventory_image,
          photo2: item.inventory_image2,
          photo3: item.inventory_image3,
          status: value,
          notes: item.notes,
          entry: item.inventory_id
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/save_rowstatus.php";

      this.http.post(url, data).subscribe((resp: any) => {
          if(resp.error == true) {
              this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
              return ;
          }

          this.changeStatusList.shift();
          this.changeMultiStatus(value);
      }, (err) => {
          this.saveloading.dismiss();
          this.global.displayAlert("There is an error when save status. Please try again later.");
      });
  }
}
