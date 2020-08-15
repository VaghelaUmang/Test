import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { ViewChild } from '@angular/core';
import { Platform, ToastController, AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ImagesProvider } from '../../services/images.images';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard'
import { Storage } from '@ionic/storage';

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
  selector: 'app-request-view-sl-entry',
  templateUrl: './view-sl-entry.page.html',
  styleUrls: ['./view-sl-entry.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestViewSlEntryPage implements OnInit {

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

  mainCatList: any = [];
  allSubCatList: any = [];
  allActivityList: any = [];

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
              public toastController: ToastController,
  						private http: HttpClient,
  						private router: Router,
              private storage: Storage,
  						private cdRef: ChangeDetectorRef,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
              private socialSharing: SocialSharing,
  						public actionSheetCtrl: ActionSheetController,
              private sanitizer: DomSanitizer,
              private _IMAGES   : ImagesProvider,
              private _clipboardService: ClipboardService,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  async exportPDF() {
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF

    const loading = await this.loadingController.create({
      message: 'Exporting as PDF...',
    });
    await loading.present();
    this.pdf.text('Main Category: ' + this.data.main_category, 10, 20)
    this.pdf.text('Sub Category: ' + this.data.sub_category, 10, 35)
    this.pdf.text('Activity: ' + this.data.inventory_itemList.join(","), 10, 50)
    this.pdf.text('Project: ' + this.data.address, 10, 65)
    this.pdf.text('Hours: ' + this.data.inventory_value, 10, 80)
    this.pdf.text('Date: ' + this.data.date, 10, 95)
    this.pdf.text('Notes: ' + this.data.notes, 10, 110)
    this.pdf.text('Employer Notes: ' + this.data.boss_notes, 10, 135)
    this.pdf.text('Tutor Notes: ' + this.data.tutor_notes, 10, 170)
    
    
    let pdfName = "student_log_" + new Date().getTime() + ".pdf";

    let width = this.pdf.internal.pageSize.getWidth();
    let height = this.pdf.internal.pageSize.getHeight();
    let n = 0;

    console.log(width + ", " + height)

    for(let i=0;i<this.imageList.length;i++){
      this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + this.imageList[i].name, (dataUrl) => {
       //console.log(dataUrl);
       let yPos = 0;
       if(n == 0) {
         yPos = 200;
       } else if(n == 1) {
         yPos = 400;
       } else {
         yPos = 10;
       }
       if(n == 2) {
         this.pdf.addPage();
       }
       
       this.pdf.addImage(dataUrl, "JPG", 10, yPos, 240, 170);
       n++;
       if(n >= this.imageList.length) {
         loading.dismiss();
         //this.pdf.save(pdfName);
         this.doSave(pdfName);
       }
      });
    }
    
    if(this.imageList.length < 1) {
      loading.dismiss();
      this.doSave(pdfName);
    }
  }

  doSave(pdfName) {
      if(this.global.isCordova) {
        let pdfOutput = this.pdf.output();
        this.global.exportPDFCordova(pdfOutput, pdfName);
      } else {
        //debugger;
        this.pdf.save(pdfName);
        let pdfOutput = this.pdf.output('blob');
        //URL.createObjectURL(pdfOutput)

        this.pdfData = URL.createObjectURL(pdfOutput);//this.sanitizer.bypassSecurityTrustUrl(pdfOutput);
        this.pdfData = this.sanitizer.bypassSecurityTrustUrl(this.pdfData);
        let buffer = new ArrayBuffer(pdfOutput.length);
        this.cdRef.detectChanges();
        let array = new Uint8Array(buffer);
        for (var i = 0; i < pdfOutput.length; i++) {
            array[i] = pdfOutput.charCodeAt(i);
        }
        console.log(buffer);
        console.log(array);
        //window.open("http://www.google.com", "_blank");
        //window.open(pdfOutput, '_blank');
      }
  }

	ionViewDidEnter() {
  	console.log("==request entry view page===");
  	this.user = JSON.parse(localStorage.getItem("user"));

	  this.currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    console.log(this.currentStudent);

    const date = new Date(this.currentStudent.inventory_purchased);
    this.data = {
        inventory_id: this.currentStudent.inventory_id,
        user_id: '',
        main_category: '',
        sub_category: '',
        inventory_item: this.currentStudent.inventory_item,
        inventory_item2: this.currentStudent.inventory_item2,
        inventory_item3: this.currentStudent.inventory_item3,
        address: this.currentStudent.address,
        inventory_value: this.currentStudent.inventory_value,
        notes: this.currentStudent.notes,
        date: this.currentStudent.inventory_purchased,
        inventory_image: this.currentStudent.inventory_image,
        inventory_image2: this.currentStudent.inventory_image2,
        inventory_image3: this.currentStudent.inventory_image3,
        boss_notes: this.currentStudent.boss_notes,
        tutor_notes: this.currentStudent.tutor_notes,
        inventory_itemList: ""
    };

    this.imageList = [];
    this.imageNewList = [];
    this.isCordova = this.global.isCordova;

    if(this.data.inventory_image.length > 0) {
      this.imageList.push({
         data: this.data.inventory_image,
         name: this.data.inventory_image
      });
    }
    if(this.data.inventory_image2.length > 0) {
      this.imageList.push({
         data: this.data.inventory_image2,
         name: this.data.inventory_image2
      });
    }
    if(this.data.inventory_image3.length > 0) {
      this.imageList.push({
         data: this.data.inventory_image3,
         name: this.data.inventory_image3
      });
    }
    this.studentImg = null;

    if(!this.data.inventory_image || this.data.inventory_image === '') {
        this.showButton = true;
    } else {
        this.showButton = false;
    }

    if(this.imageList.length < 1) {
        this.showButton = true;
    } else {
        this.showButton = false;
    }
    

    let inventory_itemList = []
    if(this.data.inventory_item.length > 0) {
      inventory_itemList.push(this.data.inventory_item)
    }
    if(this.data.inventory_item2.length > 0) {
      inventory_itemList.push(this.data.inventory_item)
    }
    if(this.data.inventory_item3.length > 0) {
      inventory_itemList.push(this.data.inventory_item)
    }
    this.data.inventory_itemList = inventory_itemList.join(",")

    this.bFirstLoad = true;

    this.loadUserData();
    this.loadPrevData();

    setTimeout(() => {
      this.loadData();
      this.cdRef.detectChanges();
    }, 1500)
  }

	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

  loadPrevData() {
    this.mainCatList = this.global.allMaincategoryList;
      if(this.mainCatList.length < 1) {
        this.storage.get('maincategory').then((maincategory) => {
          if(maincategory !== null && maincategory !== undefined && maincategory !== "") {
              try {
                  this.global.allMaincategoryList = JSON.parse(maincategory);
              } catch(e) {
                  this.global.allMaincategoryList = [];
              }
              this.mainCatList = this.global.allMaincategoryList;
          }
        });
      }
    this.allSubCatList = this.global.allSubcategoryList;
    if(this.allSubCatList.length < 1) {
      this.storage.get('allSubCategory').then((subCat) => {
        if(subCat !== null && subCat !== undefined && subCat !== "") {
            try {
                this.global.allSubcategoryList = JSON.parse(subCat);
            } catch(e) {
                this.global.allSubcategoryList = [];
            }
            this.allSubCatList = this.global.allSubcategoryList;
        }
      });
    }
    this.allActivityList = this.global.allActivityList;
    if(this.allActivityList.length < 1) {
      this.storage.get('allactivity').then((activity) => {
        if(activity !== null && activity !== undefined && activity !== "") {
            try {
                this.global.allActivityList = JSON.parse(activity);
            } catch(e) {
                this.global.allActivityList = [];
            }
            this.allActivityList = this.global.allActivityList;
        }
      });
    }
    //this.loadData();
  }

	loadData() {
      this.mainCategoryList = [];
      this.subCategoryList = [];
      this.activities = [];
      
      let mainCategoryList = this.global.allMaincategoryList;

      if(mainCategoryList) {
        mainCategoryList.forEach((item) => {
          if(item.cat == this.currentStudent.main_category) {
            this.data.main_category =  item.name;
          }
        });
      }

      this.mainCategoryList = mainCategoryList;

      const allSubcategoryList = this.global.allSubcategoryList;
      let subCategoryList = [];
      for(let i=0;i<allSubcategoryList.length;i++) {
        if(parseInt(allSubcategoryList[i].list_id) == parseInt(this.currentStudent.sub_category) || 
          parseInt(allSubcategoryList[i].cat) == parseInt(this.currentStudent.sub_category)) {
          this.data.sub_category = allSubcategoryList[i].name;
          break;
        }
      }
  }

  doRemove() {
  	this.alertController.create({
      header: 'Hold Up',
      message: 'Are you sure to remove this entry?',
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
						    inventory_id: this.data.inventory_id
						};
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_student.php";
            this.loadingController.create({
				      message: 'Covering with No More Gaps...',
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                //console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert('There is an error when removing the entry');
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Great Success!'),
						      message: this.translate.instant('The Entry has been removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            localStorage.setItem('bLoadStudentLog', '1');
						            this.router.navigateByUrl('/student-log');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });                
            }, (err) => {
                this.loading.dismiss();
                this.global.displayAlert('There is an error when removing the entry');
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });
  }

	async doUpdate() {
    this.router.navigateByUrl('/edit-sl-entry');
  }

  downloadImage(imageUrl) {
    let url = "https://www.artisanideas.co.nz/itab/database/styled/" + imageUrl
    this.http.get(url, {observe: 'response', responseType: 'blob'})
      .subscribe((res) => {
        //console.log(res)
        let resp = new Blob([res.body], {type: res.headers.get('Content-Type')});
        //console.log(resp)
        const a = document.createElement('a');
        a.href = URL.createObjectURL(resp);
        a.download = imageUrl;
        document.body.appendChild(a);
        a.click();
      })
  }

  async copyText(text) {
    this._clipboardService.copyFromContent(text)
    const toast = await this.toastController.create({
      message: 'Text has been copied to clipboard',
      duration: 1000,
      position: 'top'
    });
    toast.present();
  }

  async copyTextClipboard() {
    let text = 'Main Category: ' + this.data.main_category;
    text += '\nSub Category: ' + this.data.sub_category;
    text += '\nActivity: ' + this.data.inventory_itemList;
    text += '\nProject: ' + this.data.address;
    text += '\nHours: ' + this.data.inventory_value;
    text += '\nNotes: ' + this.data.notes;
    text += '\nDate: ' + this.data.date;
    text += '\nEmployer Notes: ' + this.data.boss_notes;
    text += '\nTutor Notes: ' + this.data.tutor_notes;
    console.log(this.data)

    this._clipboardService.copyFromContent(text)
    const toast = await this.toastController.create({
      message: 'Text has been copied to clipboard',
      duration: 1000,
      position: 'top'
    });
    toast.present();
  }
}
