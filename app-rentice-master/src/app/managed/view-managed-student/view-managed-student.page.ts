import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-managed-student',
  templateUrl: './view-managed-student.page.html',
  styleUrls: ['./view-managed-student.page.scss'],
})
export class ViewManagedStudentPage implements OnInit {

	data: any = {};
	inventoryList: any = [];
	mainCategoryList: any = [];
  subCategoryList: any = [];
  activities: any = [];
  activityList: any = [];
  addressList: any = [];
  currentManagedStudent: any = {};
  studentImg: any;
  loading: any;
  imgURL: any;
  uploadLoading: any;
  showButton: boolean = false;
  main_category: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private translate: TranslateService,
              public global: GlobalProvider,
  						private cdRef: ChangeDetectorRef,
  						public actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==view managed student page===");

	  this.currentManagedStudent = JSON.parse(localStorage.getItem("currentManagedStudent"));
    console.log(this.currentManagedStudent);

    this.data = {
        inventory_id: this.currentManagedStudent.inventory_id,
        user_id: '',
        main_category: '',
        sub_category: '',
        inventory_item: this.currentManagedStudent.inventory_item,
        address: this.currentManagedStudent.address,
        inventory_value: this.currentManagedStudent.inventory_value,
        notes: this.currentManagedStudent.notes,
        tutor_notes: this.currentManagedStudent.tutor_notes,
        date: this.currentManagedStudent.inventory_purchased,
        image: this.currentManagedStudent.inventory_image,
        boss_notes: this.currentManagedStudent.boss_notes,
        boss_check: parseInt(this.currentManagedStudent.boss_check) > 0 ? true: false
    };
    
    this.studentImg = null;

    this.loadData();
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	async loadData() {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory_info.php?cat=" + this.currentManagedStudent.main_category + "&faculty=" + this.currentManagedStudent.faculty;
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
      });
      this.getSubCategory();
  }

  async getSubCategory () {
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_info.php?cat=" + this.currentManagedStudent.sub_category + "&faculty=" + this.currentManagedStudent.faculty;
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
      });
  }

	async doUpdate() {

      let data = {
          inventory_id: this.data.inventory_id,
          boss_notes: this.data.boss_notes,
          boss_check: this.data.boss_check ? "1": "0"
      };

      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_managed_student.php";
      const loading = await this.loadingController.create({
	      message: this.translate.instant('Updating...'),
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
			      header: this.translate.instant('Success'),
			      message: this.translate.instant('Student has been updated successfully'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            console.log('Confirm Okay');
			            this.router.navigateByUrl('/managed-student-log');
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
}
