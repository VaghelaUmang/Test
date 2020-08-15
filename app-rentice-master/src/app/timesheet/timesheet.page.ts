import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { forkJoin, interval } from 'rxjs'
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
  File
} from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

import { GlobalProvider } from '../services/global-provider';

declare var window;
declare var ga;

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.page.html',
  styleUrls: ['./timesheet.page.scss'],
})
export class TimesheetPage implements OnInit {

	data: any = {};
	user: any = {};
	timesheetList: any =[];
	addressList: any = [];
	AllTimesheetList: any = [];
  mainCategoryList: any = [];
  subCategoryList: any = [];
	totalCount: any = 0;
	logOb: any;
  exportList: any = [];
  pdf: any;
  exportLoading: any;
  userList: any = [];
  tableHtml: string = '';
  photoList: any;
  listCnt: any = 0;

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						public file: File,
              private storage: Storage,
  						private emailComposer: EmailComposer,
              private socialSharing: SocialSharing,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
    this.tableHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Photo1</th>\
        <th class="photo">Photo2</th>\
        <th class="photo">Photo3</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
        <th>StartTime/FinishTime</th>\
        <th>Date</th>\
      </tr></thead><tbody>';
  }

  async exportPDF() {
    this.pdf = new jspdf('l', 'px', 'a4'); // A4 size page of PDF
    this.exportLoading = await this.loadingController.create({
      message: 'Exporting as PDF...',
    });
    await this.exportLoading.present();
    this.tableHtml = '<thead><tr>\
        <th>Name</th>\
        <th>Photo1</th>\
        <th>Photo2</th>\
        <th>Photo3</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
        <th>StartTime/FinishTime</th>\
        <th>Date</th>\
      </tr></thead><tbody>';
    this.photoList = [];
    this.listCnt = 0;
    this.doExport(true);
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
      this.tableHtml += '</tbody>';

      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table-5',
            columnStyles: {
              0: {cellWidth: 50},
              1: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              2: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              3: {halign: 'center', minCellWidth:60, minCellHeight: 60}}, // Cells in first column centered and green
              4: {minCellWidth: 50, cellWidth: 50},
              5: {minCellWidth: 50},
              6: {cellWidth: 50},
              7: {minCellWidth: 40, cellWidth: 40},
              8: {minCellWidth: 50, cellWidth: 40},
            didDrawCell: data => {
              try {
                if(data.section === 'body') {
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
                }
              } catch(e) {
                console.log(e)
              }
            }
          });

        //this.pdf.autoTable({html: '#my-table2'});
        this.exportLoading.dismiss();
        let pdfName = "timesheet_" + new Date().getTime() + ".pdf";
        if(this.global.isCordova) {
          let pdfOutput = this.pdf.output();
          this.exportPDFCordova(pdfOutput, pdfName);
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

    /*this.pdf.text('Main Category: ' + mainCat, 10, 10)
    this.pdf.text('Sub Category: ' + subCat, 10, 20)
    this.pdf.text('Activity: ' + pdfItem.activity, 10, 30)
    this.pdf.text('Project: ' + pdfItem.address, 10, 40)
    this.pdf.text('Hours: ' + pdfItem.hours, 10, 50)
    this.pdf.text('Notes: ' + pdfItem.notes, 10, 60)
    this.pdf.text('Start Time: ' + pdfItem.starttime, 10, 75)
    this.pdf.text('Finish Time: ' + pdfItem.finishtime, 10, 85)
    this.pdf.text('Date: ' + pdfItem.date, 10, 95)*/

    let imageList = [];
    if(pdfItem.image && pdfItem.image.length > 0) {
      imageList.push(pdfItem.image);
    }
    if(pdfItem.image2 && pdfItem.image2.length > 0) {
      imageList.push(pdfItem.image2);
    }
    if(pdfItem.image3 && pdfItem.image3.length > 0) {
      imageList.push(pdfItem.image3);
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

            this.tableHtml += '<td>' + pdfItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
            this.tableHtml += '<td>' + pdfItem.address + '</td>';
            this.tableHtml += '<td>' + pdfItem.hours + '</td>';
            this.tableHtml += '<td><div>' + pdfItem.starttime + '</div><div>' + pdfItem.finishtime + '</div></td>';
            this.tableHtml += '<td>' + pdfItem.date + '</td>';
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

      this.tableHtml += '<td>' +  pdfItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
      this.tableHtml += '<td>' + pdfItem.address + '</td>';
      this.tableHtml += '<td>' + pdfItem.hours + '</td>';
      this.tableHtml += '<td><div>' + pdfItem.starttime + '</div><div>' + pdfItem.finishtime + '</div></td>';
      this.tableHtml += '<td>' + pdfItem.date + '</td>';
      this.tableHtml += '</tr>';
      this.listCnt++;
      this.exportList.shift();
      this.doExport();
    }

    /*if(imageList.length > 0) {
      for(let i=0;i<imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
         if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
           this.pdf.addPage();
           this.pdf.addImage(dataUrl, "JPG", 0, 0, width, height);
         }
         n++;
         if(n >= imageList.length) {
            this.exportList.shift();
            this.doExport();
         }
        });
      }   
    } else {
      this.exportList.shift();
      this.doExport();
    }*/
  }

	ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Time Sheet');
      } else {
        if(this.ga) {
          this.ga.trackView('Time Sheet');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
  	console.log("==time sheet page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    
		let date_to = new Date();
    let date_from = new Date();
    date_from.setDate(date_from.getDate() - 30);
    this.data = {
        user_id: '',
        main_category: '',
        sub_category: '',
        address: [],
        date_from: date_from.toISOString().substr(0, 10),
        date_to: date_to.toISOString().substr(0, 10),
        showDates: false,
        user: ''
    };
    
    this.loadUserData();
    this.getAddress();

    const bloadTimesheet = JSON.parse(localStorage.getItem("bloadTimesheet"));
    if(bloadTimesheet == true || bloadTimesheet == 'true' || bloadTimesheet == '1') {
        localStorage.removeItem("bloadTimesheet")
        this.loadTenTimesheet(true);
        return ;
    }
    
    this.loadTenTimesheet();
  }

	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;

    this.getUserList(this.data.user_id);
  }

	async getAddress() {
    if(this.global.allAddressList.length > 0 && this.global.bossAddressList.length > 0 && this.global.defaultAddressList.length > 0) {
      this.addressList = this.global.allAddressList;
      this.addressList = this.addressList.concat(this.global.bossAddressList);
      this.addressList = this.addressList.concat(this.global.defaultAddressList);
      this.addressList = this.addressList.filter((thing,index) => {
        return index === this.addressList.findIndex(obj => {
          return JSON.stringify(obj) === JSON.stringify(thing);
        });
      });
      return ;
    }
    let funcList = [];
    let url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
    funcList.push(this.http.get(url));
    url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=0";
    funcList.push(this.http.get(url));
    if(this.user.boss && this.user.boss.length > 0) {
      url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.user.boss;
      funcList.push(this.http.get(url));
    }

    this.addressList = [];
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    forkJoin(funcList).subscribe(data => {
      loading.dismiss();
      if(data && data.length > 0) {
        data.forEach(item => {
          this.addressList = this.addressList.concat(item.data);
        })
        this.addressList = this.addressList.filter((thing,index) => {
          return index === this.addressList.findIndex(obj => {
            return JSON.stringify(obj) === JSON.stringify(thing);
          });
        });
      }
    }, err => {
        loading.dismiss();
        console.log(err);
    });
  }

  async getUserList(user_id) {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_users_by_boss.php?boss=" + user_id;
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        console.log(resp.data);
        this.userList = resp.data;
    }, (err) => {
        loading.dismiss();
        console.log("there is an error while get tutorname");
    });
  }

  async loadTimesheets() {
    if(this.data.user == null || this.data.user == undefined) {
      return ;
    }
    let funcList = [];

    this.userList.forEach(item => {
      this.data.user.forEach(_user => {
        if(item.user_firstname == _user) {
          let url = "https://www.artisanideas.co.nz/api/app-rentice/get_timesheet_by_student.php?student=" + item.user_id;
          funcList.push(this.http.get(url));
        }
      })
    })

    if(funcList.length < 1) {
      this.loadTenTimesheet(true);
      return ;
    }

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
      console.log(results);
      results.forEach(item => {
        for(let i=0;i<this.userList.length;i++) {
          if(parseInt(item.user) == parseInt(this.userList[i].user_id)) {
            item.name = this.userList[i].user_firstname + " " + this.userList[i].user_lastname;
            break;
          }
        }
      });
      this.timesheetList = [];
      results.forEach((item) => {
          const d = new Date(item.date);
          const date_from = new Date(this.data.date_from);
          const date_to = new Date(this.data.date_to);
          if(!this.data.showDates || (d>=date_from || this.data.date_from == "") && (d<=date_to || this.data.date_to == "")) {
              this.data.address.forEach((addr) => {
                if(item.address.indexOf(addr) != -1) {
                  this.timesheetList.push(item);
                }
              });
              if(this.data.address.length < 1) {
                this.timesheetList.push(item);
              }
          }
      });
      this.exportList = _.cloneDeep(this.timesheetList);
      this.global.allTimesheetList = this.timesheetList;
    }, err => {
      loading.dismiss();
      console.log(err);
    });
  }

	async loadTenTimesheet(bReload  = false) {
      this.timesheetList = [];
      if(bReload == false) {
          let resultList = this.global.allTimesheetList;
          if(resultList.length > 0) {
            if(this.data.showDates) {
              resultList.forEach((item) => {
                  const d = new Date(item.date);
                  const date_from = new Date(this.data.date_from);
                  const date_to = new Date(this.data.date_to);
                  if(this.data.showDates && d>=date_from && d<=date_to) {
                      this.timesheetList.push(item);
                  }
              });
            } else {
              this.timesheetList = resultList;
            }

            this.timesheetList.forEach(item => {
              item.name = this.user.user_firstname + " " + this.user.user_lastname;
            });
            this.exportList = _.cloneDeep(this.timesheetList);
            return ;
          }
      }

      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_timesheet_by_student.php?student=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp.data);
          if(resp.error === true) {
              this.global.displayAlert("There is an error when get timesheet.");
              return ;
          }
          let resultList = [];
          let now : any = new Date();
          this.storage.set('allTimesheetList', JSON.stringify(resp.data));
          this.storage.set('allTimesheetDate', now.getTime());
          this.global.allTimesheetList = resp.data;

          resp.data.forEach(item => {
            item.name = this.user.user_firstname + " " + this.user.user_lastname;
          });
          if(this.data.showDates) {
            resp.data.forEach((item) => {
                const d = new Date(item.date);
                const date_from = new Date(this.data.date_from);
                const date_to = new Date(this.data.date_to);
                if(d>=date_from && d<=date_to) {
                    resultList.push(item);
                }
            });
          } else {
            resultList = resp.data;
          }

          this.AllTimesheetList = resultList;
          this.timesheetList = resultList;
          this.totalCount = this.AllTimesheetList.length;
          this.infiniteScroll.disabled = true;
          /*if(this.totalCount > 10) {
              this.timesheetList = this.AllTimesheetList.slice(0, 10);
          } else {
              this.timesheetList = this.AllTimesheetList;
          }*/
          this.exportList = _.cloneDeep(this.timesheetList);
          
          window.localStorage.setItem("timesheetDate", now.getTime());
          let data = JSON.stringify(this.timesheetList);
          window.localStorage.setItem("timesheet", data);
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get timesheet.");
      });
  }

	async showEntries() {
      this.timesheetList = [];
      let resultList = this.global.allTimesheetList;
      if(resultList.length > 0) {
        const loading = await this.loadingController.create({
          message: '',
        });
        await loading.present();
        resultList.forEach((item) => {
              const d = new Date(item.date);
              const date_from = new Date(this.data.date_from);
              const date_to = new Date(this.data.date_to);
              if(!this.data.showDates || (d>=date_from || this.data.date_from == "") && (d<=date_to || this.data.date_to == "")) {
                  this.data.address.forEach((addr) => {
                    if(item.address.indexOf(addr) != -1) {
                      this.timesheetList.push(item);
                    }
                  });
                  if(this.data.address.length < 1) {
                    this.timesheetList.push(item);
                  }
              }
          });
        this.exportList = _.cloneDeep(this.timesheetList);
        this.infiniteScroll.disabled = true;
        setTimeout(() => {
          loading.dismiss();
        }, 500);
        return ;
      }

      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_timesheet_by_student.php?student=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error === true) {
              this.global.displayAlert("There is an error when get timesheet.");
              return ;
          }
          let resultList = [];
          resp.data.forEach((item) => {
              const d = new Date(item.date);
              const date_from = new Date(this.data.date_from);
              const date_to = new Date(this.data.date_to);

              /*if(d>=date_from && d<=date_to && item.address.indexOf(this.data.address) != -1) {
                  resultList.push(item);
              }*/
              if(!this.data.showDates && (d>=date_from || this.data.date_from == "") && (d<=date_to || this.data.date_to == "")) {
                  this.data.address.forEach((addr) => {
                    if(item.address.indexOf(addr) != -1) {
                      resultList.push(item);
                    }
                  });
                  if(this.data.address.length < 1) {
                    resultList.push(item);
                  }
              }
          });
          
          console.log(resultList);
          this.AllTimesheetList = resultList;
          this.timesheetList = this.AllTimesheetList;
          this.totalCount = this.AllTimesheetList.length;
          this.infiniteScroll.disabled = false;
          this.exportList = _.cloneDeep(this.timesheetList);    
          /*if(this.totalCount > 10) {
              this.timesheetList = this.AllTimesheetList.slice(0, 10);
          } else {
              this.timesheetList = this.AllTimesheetList;
          }*/
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get timesheet.");
      });
  }

	loadMore(event) {
    //Load More 10 items
    if(this.timesheetList === null || this.timesheetList === undefined) {
        return ;
    }
    let nCount = this.timesheetList.length;
    let moreList = [];
    if(nCount+10>this.totalCount) {
        let n = this.totalCount - nCount;
        moreList = this.AllTimesheetList.slice(nCount, nCount+n);
    } else {
        moreList = this.AllTimesheetList.slice(nCount, nCount+10);
    }
    
    this.timesheetList = this.timesheetList.concat(moreList);
    this.infiniteScroll.disabled = false;
    if(this.timesheetList.length >= this.totalCount) {
        this.infiniteScroll.disabled = true;
    }
    this.exportList = _.cloneDeep(this.timesheetList);
    event.target.complete();
  }

  goTimesheetItem(item) {
    console.log(item);
    localStorage.setItem("currentTimesheet", JSON.stringify(item));
    this.router.navigateByUrl('/view-ts-entry');
  }

  exportEntries() {
      let dataDir = "";
      if (!window.device) {
        this.exportPDF();
      	return ;
      }

      if(this.platform.is('android') == true) {
          dataDir = this.file.externalDataDirectory;  
      } else {
          dataDir = this.file.dataDirectory;
      }

      let csvName = "timesheet_" + new Date().getTime() + ".csv";
      let csv = 'Name,Date,Start Time,Finish Time,Address,Hours,Notes,\n';
      for(let i=0;i<this.timesheetList.length;i++) {
          csv += this.timesheetList[i].name + ',';
          csv += this.timesheetList[i].date + ',';
          csv += this.timesheetList[i].starttime + ',';
          csv += this.timesheetList[i].finishtime + ',';
          csv += this.timesheetList[i].address + ',';
          csv += this.timesheetList[i].hours + ',';
          csv += this.timesheetList[i].notes + ',\n';
      }

      this.file.writeFile(dataDir, csvName, csv, {replace: true})
         .then(() => {
           let subject = 'Export Timesheet';
           /*body += '<table>
           body += ' <tr>
           body += '   <th>Company</th>
           body += '   <th>Contact</th>
           body += '   <th>Country</th>
           body += ' </tr>
           body += ' <tr>
              <td>Alfreds Futterkiste</td>
              <td>Maria Anders</td>
              <td>Germany</td>
            </tr>*/
            let body = '<html>';
            for(let i = 0;i < this.timesheetList.length;i++) {
                body += '<div>Name:' + this.timesheetList[i].name + '</div>';
                body += '<div>Date:' + this.timesheetList[i].date + '</div>';
                body += '<div>StartTime:' + this.timesheetList[i].starttime + '</div>';
                body += '<div>FinishTime:' + this.timesheetList[i].finishtime + '</div>';
                body += '<div>Address:' + this.timesheetList[i].address + '</div>';
                body += '<div>Hours:' + this.timesheetList[i].hours + '</div>';
                body += '<div>Notes:' + this.timesheetList[i].notes + '</div>';
                body += '<br/>'
            }
            body += "</html>";
            body = '<html><style>table{font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}td, th {\
                border: 1px solid #dddddd;\
                text-align: left;\
                padding: 8px;\
              }\</style><table>\
              <tr>\
                <th>Name</th>\
                <th>Date</th>\
                <th>Start time</th>\
                <th>Finish time</th>\
                <th>Address</th>\
                <th>Hours</th>\
                <th>Notes</th>\
              </tr>';
           for(let i = 0;i < this.timesheetList.length;i++) {
                body += '<tr><td>' + this.timesheetList[i].name + '</td>';
                body += '<td>' + this.timesheetList[i].date + '</td>';
                body += '<td>' + this.timesheetList[i].starttime + '</td>';
                body += '<td>' + this.timesheetList[i].finishtime + '</td>';
                body += '<td>' + this.timesheetList[i].address + '</td>';
                body += '<td>' + this.timesheetList[i].hours + '</td>';
                body += '<td>' + this.timesheetList[i].notes + '</td></tr>';
            }
            body += '</table></html>';
           let email = {
             to: 'artisan80@gmail.com',
             attachments: [
               dataDir + csvName
             ],
             subject: subject,
             body: body,
             isHtml: true
           };
           this.emailComposer.open(email);
         })
         .catch((err) => {
           console.error(err);
         });
  }

  clearFilter() {
    this.data.address = [];
    this.data.user = [];
    this.data.showDates = false;
    const date_to = new Date();
    const date_from = new Date();
    date_from.setDate(date_from.getDate() - 30);
    this.data.date_from = date_from.toISOString().substr(0, 10);
    this.data.date_to = date_to.toISOString().substr(0, 10);

    this.showEntries();
  }
}
