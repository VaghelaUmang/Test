import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Platform, AlertController, LoadingController, IonInfiniteScroll } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../services/global-provider';
import { IonItemSliding } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import {
  File
} from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TranslateService } from '@ngx-translate/core';
import { ImagesProvider } from '../services/images.images';

import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

declare var ga;
declare var window;

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortfolioPage implements OnInit {

	data: any = {};
	user: any = {};
	bLoadPortfolio: any;
	portfolioList: any = [];
	totalCount: any = 0;
	AllPortfolioList: any = [];
  portfolioItemList: any;
  AllPortfolioItemList: any = [];
  currentPortfolio: any;
  bLoaded: boolean = false;

  tableHtml: string = '';
  photoList: any;
  listCnt: any = 0;
  exportList: any = [];
  pdf: any;
  exportLoading: any;
  yPos: number = 50;

  loading: any;

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

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
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Portfolio Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Portfolio Page');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
    this.bLoaded = false;
  	console.log("==portfolio page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
    this.currentPortfolio = JSON.parse(localStorage.getItem("currentPortfolio"));

    this.infiniteScroll.disabled = false;
    this.loadUserData();
    this.data.status = 'All';

    this.loadPortfolioItems();
 	}

  async exportPDF() {
    this.exportList = _.cloneDeep(this.portfolioItemList);
    console.log(this.portfolioItemList);
    console.log(this.exportList);
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    this.pdf.setFontType("bold");
    this.pdf.text(10, 20, "Name: " + this.currentPortfolio.name);
    var wrap_notes = this.pdf.splitTextToSize('Notes: ' + this.currentPortfolio.notes1, 400, {});
    this.pdf.text(10, 35, wrap_notes);
    this.pdf.setFontType("normal")
    this.pdf.setFontSize(13)
    console.log(this.pdf.internal.pageSize.getWidth());
    console.log(this.pdf.internal.pageSize.getHeight());
    this.exportLoading = await this.loadingController.create({
      message: this.translate.instant('Exporting as PDF...'),
    });
    await this.exportLoading.present();
    this.yPos = 50;
    this.photoList = [];
    this.listCnt = 0;
    this.doExport(true);
  }

  async exportPDF_FromHTML() {
    this.exportList = _.cloneDeep(this.portfolioItemList);
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    
    let self = this;
    this.pdf.fromHTML(window.document.getElementById("export"), 15, 15, {
      'width': 320
    }, function(a) {
      let pdfName = "Portfolio_Item_" + new Date().getTime() + ".pdf";
      if(self.global.isCordova) {
        let pdfOutput = self.pdf.output();
        self.global.exportPDFCordova(pdfOutput, pdfName);
      } else {
        self.pdf.save(pdfName);
      }
    });
  }

  doExport(flag = false) {
    if(this.exportList.length < 1) {
      //debugger
      setTimeout(() => {
        this.exportLoading.dismiss();
        let pdfName = "Portfolio_Item_" + new Date().getTime() + ".pdf";
        if(this.global.isCordova) {
          let pdfOutput = this.pdf.output();
          this.global.exportPDFCordova(pdfOutput, pdfName);
        } else {
          this.pdf.save(pdfName);
        }
        return ;
      }, 0);
      return ;
    }
    let width = this.pdf.internal.pageSize.getWidth();
    let height = this.pdf.internal.pageSize.getHeight();
    //console.log(height)

    console.log(this.listCnt);
    if(this.listCnt != 0 && this.listCnt%2 == 0) {
      this.pdf.addPage();
      this.yPos = 50;
    }

    let pdfItem = this.exportList[0];
    let imageList = [];
    if(pdfItem.photo.length > 0) {
      imageList.push(pdfItem.photo);
    }
    //this.yPos = 50;
    console.log(imageList)
    let xPos = 140;
    if(imageList.length < 1) {
      xPos = 10;
    }

    let deltaY = 20;
    if(!pdfItem.hide_activity) {
      this.pdf.text('Activity: ' + pdfItem.activity, 10, this.yPos)
    }
    if(!pdfItem.hide_main) {
      this.yPos += deltaY;
      this.pdf.text('Main Category: ' + pdfItem.mainCat, xPos, this.yPos)
    }
    if(!pdfItem.hide_sub) {
      this.yPos += deltaY;
      this.pdf.text('Sub Category: ' + pdfItem.subCat, xPos, this.yPos)
    }
    if(!pdfItem.hide_project) {
      this.yPos += deltaY;
      this.pdf.text('Project: ' + pdfItem.address, xPos, this.yPos)
    }
    if(!pdfItem.hide_duration) {
      this.yPos += deltaY;
      this.pdf.text('Duration: ' + pdfItem.value, xPos, this.yPos)
    }
    if(!pdfItem.hide_date) {
      this.yPos += deltaY;
      this.pdf.text('Date: ' + pdfItem.created, xPos, this.yPos)
    }
    if(!pdfItem.hide_notes) {
      var wrap_notes = this.pdf.splitTextToSize('Notes: ' + pdfItem.notes, 400, {});
      let _yPos = 180;
      if(this.listCnt%2 == 0) {
        if(imageList.length < 1) {
          _yPos = 170;
        } else {
         _yPos = 200;
        }
      } else {
         if(imageList.length < 1) {
            _yPos = 370;
         } else {
           _yPos = 400;
         }
      }
      if(this.listCnt < 2) {
        if(this.listCnt%2 == 0) {
          if(imageList.length < 1) {
            _yPos = 170;
          } else {
           _yPos = 200;
          }
        } else {
           if(imageList.length < 1) {
              _yPos = 380;
           } else {
             _yPos = 420;
           }
        }
      }
      this.pdf.text(10, _yPos, wrap_notes)
    }


    let n = 0;

    this.photoList[this.listCnt] = [];
    if(imageList.length > 0) {
      for(let i=0;i<imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
         if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
           let _yPos = 70;
           if(this.listCnt%2 == 0) {
             _yPos = 70;
           } else {
             _yPos = 280;
           }
           this.pdf.addImage(dataUrl, "JPG", 10, _yPos, 110, 90);
           this.yPos = 240;
         } 
         n++;
         
         this.yPos += 20;
         if(n >= imageList.length) {
            this.listCnt++;
            this.exportList.shift();
            this.doExport();
         }
        });
      }   
    } else {
      this.yPos = 260;
      this.listCnt++;
      this.exportList.shift();
      this.doExport();
    }
  }

 	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

	statusFilter(item) {
    console.log(item.status);
    return this.data.status == 'All' || item.status == this.data.status
  }

  async loadPortfolioItems() {
      this.portfolioItemList = [];
      this.AllPortfolioItemList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_portfolio_item.php" ;
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          this.bLoaded = true;
          loading.dismiss();
          console.log(resp.data);
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get portfolio.");
              return ;
          }
          
          resp.data.forEach(item => {
            item.name = this.user.user_firstname + " " + this.user.user_lastname;
            item.mainCat = item.main;
            item.subCat = item.sub;
            this.global.allMaincategoryList.forEach((cat) => {
            if(cat.cat == item.main) {
                item.mainCat = cat.name;
                return ;
              }
            });
            this.global.allSubcategoryList.forEach((cat) => {
              if(parseInt(cat.list_id) == parseInt(item.sub) ||
                parseInt(cat.cat) == parseInt(item.sub)) {
                item.subCat = cat.name;
                return ;
              }
            });
          });
          resp.data.forEach(item => {
            if(item.list_no == this.currentPortfolio.list_id) {
              this.AllPortfolioItemList.push(item)
            }
          })
          this.totalCount = this.AllPortfolioItemList.length;
          if(this.infiniteScroll)
            this.infiniteScroll.disabled = false;
          // if(this.totalCount > 10) {
          //     this.portfolioList = this.AllPortfolioItemList.slice(0, 10);
          // } else {
          //     this.portfolioList = this.AllPortfolioItemList;
          // }
          console.log(this.AllPortfolioItemList)
          
          this.portfolioItemList = this.AllPortfolioItemList;
      }, (err) => {
          this.bLoaded = true;
          loading.dismiss();
          this.global.displayAlert("There is an error when get todo list.");
      }); 
  }

	loadMore(event) {
    //Load More 10 items
    if(this.portfolioList === null || this.portfolioList === undefined) {
        return ;
    }
    var nCount = this.portfolioList.length;
    var moreList = [];
    if(nCount+10>this.totalCount) {
        var n = this.totalCount - nCount;
        moreList = this.AllPortfolioList.slice(nCount, nCount+n);
    } else {
        moreList = this.AllPortfolioList.slice(nCount, nCount+10);
    }
    
    this.portfolioList = this.portfolioList.concat(moreList);
    this.infiniteScroll.disabled = false;
    if(this.portfolioList.length >= this.totalCount) {
        this.infiniteScroll.disabled = true;
    }
    event.target.complete();
  }

  goPortfolioItem(item, filter) {
    this.global.portfolioFilter = filter;
    localStorage.setItem("currentPortfolioItem", JSON.stringify(item));
  	console.log(item);
   	this.router.navigateByUrl('/edit-portfolio');
  }

  async removeItem(slidingItem: IonItemSliding, item) {
      console.log(slidingItem);
      console.log(item);
      slidingItem.close();

      this.alertController.create({
      header: this.translate.instant('Alert'),
      message: this.translate.instant('Are you sure to remove this item?'),
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            let data = {
                id: item.list_id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_portfolio_item.php";
            this.loadingController.create({
              message: this.translate.instant('Removing...'),
            }).then((loading) => {
              this.loading = loading;
              loading.present();
            });
            
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert('There is an error when remove portfolio item.');
                    return ;
                }
                this.loadPortfolioItems();
            }, (err) => {
                this.loading.dismiss();
                this.global.displayAlert('There is an error when remove portfolio item.');
            });
          }
        }
      ]
    }).then((alert) => {
      alert.present();
    });
  }

  selectFileToUpload(event, item) : void {
     console.log(event)
     console.log(item)
     this._IMAGES
     .handleImageSelection(event)
     .subscribe(async(res) => {
        // Retrieve the file type from the base64 data URI string
        let _SUFFIX       = res.split(':')[1].split('/')[1].split(";")[0];

        if(this._IMAGES.isCorrectFileType(_SUFFIX)) {
           let imgURL = this.global.todayString();

           let uploadLoading = await this.loadingController.create({
              message: 'Uploading image...',
            });
            await uploadLoading.present();
           this._IMAGES
           .uploadImageSelection(res,
                                 imgURL + "." + _SUFFIX)
           .subscribe((res) =>
           {
              uploadLoading.dismiss();
              this.updatePhoto(item, imgURL + "." + _SUFFIX);
              console.log(res.success);
           },
           (error : any) =>
           {
              uploadLoading.dismiss();
              this.global.displayAlert("There is an error while uploading images, Try again.");
              console.log(error.success);
           });
        } else {
           this.global.displayAlert('You need to select an image file with one of the following types: jpg, gif or png');
        }
     }, (error) => {
        console.dir(error);
        console.log(error.message);
     });
  }

  async updatePhoto(item, imgUrl) {
      const data = {
          list_id: item.list_id.toString(),
          photo: imgUrl
      };
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_portfolio_photo.php";
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
          this.loadPortfolioItems();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
      });
  }
}
