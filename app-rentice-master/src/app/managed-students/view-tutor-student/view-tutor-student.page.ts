import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, IonInfiniteScroll, AlertController, IonItemSliding } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import {
  File
} from '@ionic-native/file/ngx';

import { GlobalProvider } from '../../services/global-provider';

declare var ga, window;

@Component({
  selector: 'app-view-tutor-student',
  templateUrl: './view-tutor-student.page.html',
  styleUrls: ['./view-tutor-student.page.scss'],
})
export class ViewTutorStudentPage implements OnInit {

	data: any = {};
	user: any = {};
	currentStaff: any = {};
	inventoryList: any = [];
	AllInventoryList: any = [];
	totalCount: any = 0;
	mainCategoryList: any = [];
  subCategoryList: any = [];
  allSubCategoryList: any = [];
  activities: any = [];
  activityList: any = [];
  addressList: any = [];
  currentStudent: any = {};

  exportList: any = [];
  pdf: any;
  exportLoading: any;
  bFirstLoad: boolean = true;
  tableHtml: string = '';
  photoList: any;
  listCnt: any = 0;
  searchTxt: string = '';

  showSubCategory: boolean = false;
  showActivity: boolean = false;

  bShowSummary: boolean = false;
  summaryList: any = [];

  tableSummaryHtml: string = '';
  exportSummaryList: any = [];
  pdfSummary: any;
  exportSummaryLoading: any;

  rowstatusList: any = [];

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              public file: File,
              private socialSharing: SocialSharing,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
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

    this.tableSummaryHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Hours</th>\
      </tr></thead><tbody>';
  }

  onKeyPressed(event) {
      if(event.keyCode == 13) {
        console.log(this.searchTxt);
        this.showEntries();
      }
  }

  viewTable() {
    this.global.tutorStudentLog = this.inventoryList;
    this.router.navigateByUrl('/view-tutor-student-table');
  }

  async exportPDF() {
    if(this.bShowSummary) {
      this.exportPDFSummary();
      return ;
    }
    console.log(this.AllInventoryList);
    console.log(this.inventoryList);
    this.exportList = _.cloneDeep(this.inventoryList);
    this.pdf = new jspdf('l', 'px', 'a4'); // A4 size page of PDF
    this.exportLoading = await this.loadingController.create({
      message: 'Exporting as PDF...',
    });
    await this.exportLoading.present();
    this.tableHtml = '<thead><tr>\
        <th>Photo1</th>\
        <th>Photo2</th>\
        <th>Photo3</th>\
        <th>Category/Activity</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
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
      message: 'Exporting as PDF...',
    });
    await this.exportLoading.present();
    this.tableSummaryHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Hours</th>\
      </tr></thead><tbody>';
    this.doSummaryExport(true);
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

      this.pdf.setFontSize(14);
      this.pdf.text(this.user.user_firstname + " " + this.user.user_lastname, 26, 22);

      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table3',
            columnStyles: {
              0: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              1: {halign: 'center', minCellWidth:60, minCellHeight: 60}, 
              2: {halign: 'center', minCellWidth:60, minCellHeight: 60}}, // Cells in first column centered and green
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
    this.subCategoryList.forEach((item) => {
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
    this.tableHtml += '<tr>';
    this.photoList[this.listCnt] = [];

    if(imageList.length > 0) {
      for(let i=0;i<imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
         if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
          if(this.photoList[this.listCnt])
            this.photoList[this.listCnt].push(dataUrl);
          this.tableHtml += '<td><img style="min-width:80px" src="' + dataUrl + '" /></td>';
         }  else {
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
          this.pdf.autoTable({html: '#my-table12',
            columnStyles: {
              0: {minCellWidth:60, minCellHeight: 35}, 
              1: {minCellWidth:60, minCellHeight: 35}
            },
            didDrawCell: data => {
              //console.log(data);
              if(data.section == 'body' && data.row.index != 0) {
              }
            }
          });
          let pdfName = "trainee_row_summary_" + new Date().getTime() + ".pdf";
          if(this.global.isCordova) {
            let pdfOutput = this.pdf.output();
            this.exportPDFCordova(pdfOutput, pdfName);
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

	ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Managed Student Log Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Managed Student Log Page');
        }
      }
    } catch(e) {
      console.log(e)
    }

  	console.log("==view tutor student page===");
  	this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
  	console.log(this.user);

		let date_to = new Date().toISOString().substr(0, 10);
		let date_from = new Date();
		date_from.setDate(date_from.getDate() - 30);
		this.data = {
        status: '',
		    searchKey: '',
		    user_id: '',
		    main_category: '',
		    sub_category: '',
		    inventory_item: '',
		    address: '',
		    date_from: date_from.toISOString().substr(0, 10),
        date_to: date_to,
        showDates: false
		};
    this.searchTxt = '';

    this.showSubCategory = false;
    this.showActivity = false;
    this.bShowSummary = false;

		this.loadUserData();
		this.loadData();

		this.getAllActivites();
		this.getAddress();
		this.loadTenStudent();
  }

 	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

	async loadTenStudent() {
      console.log(this.data);
      let data = {
          student: this.data.user_id
      };
      
      this.inventoryList = [];
      let url = "https://www.artisanideas.co.nz/api/app-rentice/search_inventory_by_student.php?student=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          //console.log(resp.data);
          if(resp.error === true) {
              this.global.displayAlert("There is an error when search inventory.");
              return ;
          }
          
          this.AllInventoryList = resp.data;
          this.totalCount = this.AllInventoryList.length;

          this.loadRowStatus();
          // if(this.totalCount > 10) {
          //     this.inventoryList = this.AllInventoryList.slice(0, 10);
          // } else {
          //     this.inventoryList = this.AllInventoryList;
          // }
          // this.exportList = _.cloneDeep(this.inventoryList);
          // if(this.infiniteScroll)
          //   this.infiniteScroll.disabled = false;
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when search inventory.");
      });
  }

  async showEntries(bList = true) {
      this.bShowSummary = !bList;
      const loading = await this.loadingController.create({
        message: ''
      });
      await loading.present();
      console.log(this.AllInventoryList);
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

      this.totalCount = AllInventoryList.length;
      if(this.totalCount > 10) {
          this.inventoryList = AllInventoryList.slice(0, 10);
      } else {
          this.inventoryList = _.cloneDeep(AllInventoryList);
      }

      if(this.infiniteScroll)
        this.infiniteScroll.disabled = false;

      this.exportList = _.cloneDeep(this.inventoryList);

      setTimeout(() => {
        loading.dismiss();
      }, 500);

      ////Processing Summary Result
      if(bList == false) {//bList = false: Summary
        this.viewSummary()
      }
  }

	loadData() {
      this.mainCategoryList = [];
      this.subCategoryList = [];
      this.activities = [];
      this.getMainCategory();
      this.getSubCategory();
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
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get categories.");
      });  
  }

	async getSubCategory() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory.php?faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          this.subCategoryList = resp.category;
          this.allSubCategoryList = resp.category;
      }, (err) => {
          this.global.displayAlert("There is an error when get subcategories.");
      });  
  }

  async getAllActivites() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_allactivities.php?faculty=" + this.user.faculty;
      this.activityList = [];
      this.http.get(url).subscribe((resp: any) => {
          let activityList = resp.data;
          this.activityList = activityList;
      }, (err) => {
          this.global.displayAlert("There is an error when get activities.");
      });
  }

  async getAddress() {
        const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address.php";
        this.addressList = [];
        const loading = await this.loadingController.create({
		      message: '',
		    });
		    await loading.present();
        this.http.get(url).subscribe((resp: any) => {
            loading.dismiss();
            this.addressList = resp.data;
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert("There is an error when get address.");
        });
  }

  loadMore(event) {
      if(this.inventoryList === null || this.inventoryList === undefined) {
          return ;
      }
      let nCount = this.inventoryList.length;
      let moreList = [];
      if(nCount+10>this.totalCount) {
          let n = this.totalCount - nCount;
          moreList = this.AllInventoryList.slice(nCount, nCount+n);
      } else {
          moreList = this.AllInventoryList.slice(nCount, nCount+10);
      }
      
      this.inventoryList = this.inventoryList.concat(moreList);
      this.infiniteScroll.disabled = false;
      if(this.inventoryList.length >= this.totalCount) {
          this.infiniteScroll.disabled = true;
      }
      this.exportList = _.cloneDeep(this.inventoryList);
      event.target.complete();
  }

  async changeMainCategory() {
      console.log(this.data.main_category);
      if(parseInt(this.data.main_category) < 1) {
        return ;
      }
      if(this.data.main_category.length < 1) {
        return ;
      }
      this.data.sub_category = "";
      this.showSubCategory = true;
      let url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_by_main.php?main_cat="+ this.data.main_category + "&faculty=" + this.user.faculty;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.subCategoryList = resp.category;

          this.showEntries(!this.bShowSummary);
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get category.");
      });        
  }

  changeSubCategory() {
      this.data.inventory_item = "";
      let subCatId;
      this.subCategoryList.forEach(item => {
         if(item.cat == this.data.sub_category) {
           subCatId = item.list_id;
         }
      })
      this.showActivity = true;
      let dataList = this.activityList;
      this.activities = [];
      for(let i=0;i<dataList.length;i++) {
          if(parseInt(dataList[i].sub_category) == parseInt(this.data.sub_category) || 
            parseInt(dataList[i].sub_category) == parseInt(subCatId))
           {
              this.activities.push(dataList[i]);
              continue;
          }
      }
      console.log(this.activities);
      this.cdRef.detectChanges();

      this.showEntries(!this.bShowSummary);
  }

  goStudentItem(slidingItem: IonItemSliding, item) {
    if(slidingItem)
        slidingItem.close();
    localStorage.setItem("currentTutorStudent", JSON.stringify(item));
    console.log(item);  
    this.router.navigateByUrl('/tutor-view-entry');
  }

  statusFilter(item) {
    console.log(item.status);
    return this.data.status == '' || item.status == this.data.status
  }

  async changeStatus(slidingItem: IonItemSliding, item, status) {
      console.log(item);
      console.log(status);
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
      let addedUser = JSON.parse(localStorage.getItem("user"));
      const data = {
          added: addedUser.user_id,
          student: this.user.user_id,
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
        message: 'Saving status...',
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

  async loadRowStatus() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.rowstatusList = []
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_rowstatus.php";
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss();
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        console.log(resp.data);
        this.rowstatusList = resp.data;

        this.showEntries(!this.bShowSummary)
    }, (err) => {
        loading.dismiss();
        console.log("there is an error while get tutorname");
    });
  }

  clearFilter() {
    this.data.status = "";
    this.data.main_category = "";
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
    this.showEntries();
  }

  async viewSummary() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.bShowSummary = true;
    this.global.tutorMaincategoryList = this.mainCategoryList;
    this.global.tutorSubcategoryList = this.subCategoryList;
    this.global.tutorActivityList = this.activityList;
    this.global.tutorInventoryList = this.AllInventoryList;

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

    mainCatList.forEach(mainCat => {
      let nHour = 0;
      this.global.tutorSubcategoryList.forEach(subCat => {
        if(parseInt(mainCat.cat) == parseInt(subCat.main)) {
            let activities = [];
            activityList.forEach(item => {
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

            // if(this.activities.length < 1) {
            //   this.inventoryList.forEach(item => {
            //     if(parseInt(item.main_category) == parseInt(mainCat.cat) && 
            //       (parseInt(item.sub_category) == parseInt(subCat.cat) || 
            //         parseInt(item.sub_category) == parseInt(subCat.list_id))) {
            //       nHour += parseFloat(item.inventory_value)
            //     }
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
        list_id: mainCat.list_id,
        name: mainCat.name,
        hour: nHour
      })
    })

    setTimeout(() => {
      loading.dismiss()
    }, 500);
  }

  goSubSummary(item) {
    console.log(item);
    localStorage.setItem('tutorMainSummary', JSON.stringify(item));
    this.router.navigateByUrl('/tutor-view-summary-sub')
  }
}
