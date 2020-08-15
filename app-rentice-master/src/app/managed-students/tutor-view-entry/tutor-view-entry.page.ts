import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-tutor-view-entry',
  templateUrl: './tutor-view-entry.page.html',
  styleUrls: ['./tutor-view-entry.page.scss'],
})
export class TutorViewEntryPage implements OnInit {

	data: any = {};
	inventoryList: any = [];
	mainCategoryList: any = [];
  subCategoryList: any = [];
  activities: any = [];
  activityList: any = [];
  addressList: any = [];
  currentTutorStudent: any = {};
  studentImg: any;
  loading: any;
  imgURL: any;
  uploadLoading: any;
  showButton: boolean = false;
  main_category: any;
  imageList: any = [];
  isCordova: boolean = false;
  pdf: any;
  pdfData: any;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
              private sanitizer: DomSanitizer,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==view tutor student page===");

	  this.currentTutorStudent = JSON.parse(localStorage.getItem("currentTutorStudent"));
    console.log(this.currentTutorStudent);

    this.data = {
        inventory_id: this.currentTutorStudent.inventory_id,
        user_id: '',
        main_category: '',
        sub_category: '',
        inventory_item: this.currentTutorStudent.inventory_item,
        inventory_item2: this.currentTutorStudent.inventory_item2,
        inventory_item3: this.currentTutorStudent.inventory_item3,
        address: this.currentTutorStudent.address,
        inventory_value: this.currentTutorStudent.inventory_value,
        notes: this.currentTutorStudent.notes,
        boss_notes: this.currentTutorStudent.boss_notes,
        date: this.currentTutorStudent.inventory_purchased,
        image: this.currentTutorStudent.inventory_image,
        inventory_image: this.currentTutorStudent.inventory_image,
        inventory_image2: this.currentTutorStudent.inventory_image2,
        inventory_image3: this.currentTutorStudent.inventory_image3,
        tutor_notes: this.currentTutorStudent.tutor_notes,
        tutor_check: parseInt(this.currentTutorStudent.tutor_check) > 0 ? true: false,
        inventory_itemList: []
    };
    
    this.studentImg = null;
    this.imageList = [];
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

    if(this.data.inventory_item.length > 0) {
      this.data.inventory_itemList.push(this.data.inventory_item)
    }
    if(this.data.inventory_item2.length > 0) {
      this.data.inventory_itemList.push(this.data.inventory_item2)
    }
    if(this.data.inventory_item3.length > 0) {
      this.data.inventory_itemList.push(this.data.inventory_item3)
    }

    this.loadData();
  }

	async loadData() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory_info.php?cat=" + this.currentTutorStudent.main_category + "&faculty=" + this.currentTutorStudent.faculty;
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          let mainCategoryList = resp.category;

          if(mainCategoryList && mainCategoryList.length > 0) {
            this.data.main_category = mainCategoryList[0].name;
          }
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when get load data.')
      });
      this.getSubCategory();
  }

  async getSubCategory () {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_info.php?cat=" + this.currentTutorStudent.sub_category + "&faculty=" + this.currentTutorStudent.faculty;
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          let subCategoryList = resp.category;

          if(subCategoryList && subCategoryList.length > 0) {
            this.data.sub_category = subCategoryList[0].name;
          }
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when get load data.')
      });
  }

	async doUpdate() {

      let data = {
          inventory_id: this.data.inventory_id,
          tutor_notes: this.data.tutor_notes,
          tutor_check: this.data.tutor_check ? "1": "0"
      };

      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_tutor_student.php";
      const loading = await this.loadingController.create({
	      message: 'Updating...',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp.data);
          if(resp.error === true) {
              this.global.displayAlert('There is an error when update student.')
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Success!'),
			      message: this.translate.instant('Student has been updated successfully.'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
			            this.router.navigateByUrl('/view-tutor-student');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when update student.')
      });        
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
    
    let pdfName = "trainee_" + new Date().getTime() + ".pdf";

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
}
