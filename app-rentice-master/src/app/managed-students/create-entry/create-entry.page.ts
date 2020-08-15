import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { forkJoin, interval } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

import { ImagesProvider } from '../../services/images.images';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

declare var window;
declare var navigator;
declare var ga;

import {
  File
} from '@ionic-native/file/ngx';

import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';

import { Camera } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-create-entry',
  templateUrl: './create-entry.page.html',
  styleUrls: ['./create-entry.page.scss'],
})
export class CreateEntryPage implements OnInit {

	data: any = {};
	user: any = {};
	mainCategory: any;
	subCategory: any;
	inventoryImg: any = null;
	inventoryData: any;
	subCategoryList: any = [];
	mainCategoryList: any = [];
	activities: any = [];
	addressList: any = [];
	myPopup: any;
	imgURL: string = "";
	localInventoryList: any;
	uploadLoading: any = null;
  isCordova: boolean = false;
  inventory_itemList: any = [];

  showSubCategory: boolean = false;
  showActivity: boolean = false;

  activityList: any = [];

  public image : string;
  public imageList: any = [];
  public isSelected : boolean     =  false;

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
              public actionSheetCtrl: ActionSheetController,
  						private http: HttpClient,
  						private router: Router,
              private cdRef: ChangeDetectorRef,
              private transfer: FileTransfer,
              public file: File,
              public camera: Camera,
              private storage: Storage,
              private ga: GoogleAnalytics,
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
      try {
        if(!window.device) {
          window.ga('send', 'pageview', 'Create Entry Page');
        } else {
          this.ga.trackView('Create Entry Page');
        }
      } catch(e) {
        console.log(e)
      }

      console.log(this.platform);
	  	this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
      var today = new Date();
      var time = today.getHours() + ":" + today.getMinutes();

      let itemList = [];
      let address = "";
      let notes = "Assessor created entry";
      let inventory_purchased: any;
      let inventory_value = '1';

      this.data = {
          inventory_id: '',
          provider: '',
          faculty: '',
          tutor: '',
          user_id: '',
          main_category: '',
          sub_category: '',
          inventory_item: '',
          inventory_itemList: itemList,
          address: address,
          inventory_value: inventory_value,
          inventory_purchased: new Date().toISOString().substr(0,10),
          notes: notes,
          inventory_image: '',
          savetimesheet: false,
          starttime: "08:00",
          finishtime: this.global.roundTime()
      };
      this.inventoryImg = null;
      if(this.inventoryData) {
          this.data = this.inventoryData;
      }
      this.isCordova = this.global.isCordova;
      this.imageList = [];
      this.image = null;
      
      this.loadData();
      this.getAllActivites();
      this.loadUserData();
      this.getAddress();
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

  changeActivity() {
    let selectPlaceholder: any  = document.querySelector(".main-activity").shadowRoot.querySelector(".select-text");
    selectPlaceholder.style.setProperty("white-space", "pre-wrap");
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
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.subCategoryList = resp.category;
          const now : any = new Date();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get subcategories.");
      });  
  }

  async changeMainCategory() {
      console.log(this.data.main_category);
      if(this.data.main_category.length < 1) {
        return ;
      }

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
          this.activityList = resp.data;
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get activities.");
      });
  }

  loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
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

  async getActivities() {
      let url = "https://www.artisanideas.co.nz/api/app-rentice/get_activities.php?subcategory=" + this.subCategory + "&faculty=" + this.user.faculty;
      const loading = await this.loadingController.create({
	      message: ''
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.activities = resp.data;
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("We could not retrieve the activities");
      });  
  }

  openCamera() {
    this.actionSheetCtrl.create({
      header: this.translate.instant('Select Image Source'),
      buttons: [
        {
          text: this.translate.instant('Take Picture'),
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: this.translate.instant('Choose from gallery'),
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel'
        }
      ]
    }).then((actionSheet) => {
      actionSheet.present();
    });
  }
    
  takePicture(sourceType) {
      if(this.imageList.length > 2) {
        this.global.displayAlert('You can upload up to 3 images.');
        return ;
      }
      let options = {
          quality: 75,
          destinationType: this.camera.DestinationType.DATA_URL,
          sourceType: sourceType,
          encodingType: this.camera.EncodingType.JPEG,
          allowEdit : false, 
          targetWidth: 400,
          targetHeight: 300,
          saveToPhotoAlbum: false,
          correctOrientation: true,
      };

      this.camera.getPicture(options).then((imageData) => {
        // Special handling for Android library
        this.inventoryImg = "data:image/jpeg;base64," + imageData;
        setTimeout(() => {
           this.inventoryImg = "data:image/jpeg;base64," + imageData;
        }, 100);

        this.imgURL = this.global.todayString() +".jpg";
        this.imageList.push({
           ext: 'jpeg',
           data: "data:image/jpeg;base64," + imageData,
           name: this.imgURL
        });
      }, (err) => {

      });
  }
   
  doSave() {
    if(this.data.main_category == "") {
      this.global.displayAlert("Please select Main Category");
      return ;
    }
    if(this.data.sub_category   == "") {
      this.global.displayAlert("Please select Sub Category");
      return ;
    }
    if(this.data.inventory_item == "") {
      this.global.displayAlert("Please select Activity");
      return ;
    }
    if(this.data.address == "") {
      this.global.displayAlert("Please select Project");
      return ;
    }
    if(this.imageList.length < 1) {
        this.saveData();
        return ;
    } else {
        this.doUploadImage();
        return ;
    }
  }

  async saveData () {
        console.log(this.data);

        let data = {
          provider: this.data.provider,
          faculty: this.data.faculty,
          tutor: this.data.tutor,
          user_id: this.data.user_id.toString(),
          main_category: this.data.main_category,
          sub_category: this.data.sub_category,
          inventory_item: this.data.inventory_item,
          inventory_item2: this.data.inventory_item2,
          inventory_item3: this.data.inventory_item3,
          address: this.data.address,
          inventory_value: this.data.inventory_value,
          inventory_purchased: this.data.inventory_purchased,
          notes: this.data.notes,
          inventory_image: this.imageList[0] ? this.imageList[0].name : "",
          inventory_image2: this.imageList[1] ? this.imageList[1].name : "",
          inventory_image3: this.imageList[2] ? this.imageList[2].name : "",
          tutor_check: "",
          tutor_notes: this.data.tutor_notes,
          approved: "",
          boss_check: "",
          boss_notes: ""
        };

        let url = "https://www.artisanideas.co.nz/api/app-rentice/add_inventory.php";
        const loading = await this.loadingController.create({
          message: 'Saving...',
        });
        await loading.present();
        this.http.post(url, data).subscribe((resp: any) => {
            loading.dismiss();
            console.log(resp);
            if(resp.error === true) {
                this.global.displayAlert("There is an error while save your entry on inventory table.");
                return ;
            }

            this.alertController.create({
              header: this.translate.instant('Great Success!'),
              message: this.translate.instant('Your entry has been successfully saved'),
              buttons: [{
                  text: 'Okay',
                  handler: () => {
                    console.log('Confirm Okay');
                    this.router.navigateByUrl('/student-menu');
                  }
                }
              ]
            }).then((alert) => {
              alert.present();
            });
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert("There is an error while save your entry on inventory table.");
        });
  }

  async doUploadImage(bReturn = false) {
    let n = 0;
    let uploadLoading = await this.loadingController.create({
      message: 'Uploading images...',
    });
    await uploadLoading.present();
    for(let i=0;i<this.imageList.length;i++) {

       this._IMAGES
       .uploadImageSelection(this.imageList[i].data,
                             this.imageList[i].name)
       .subscribe((res) =>
       {
          if(n>=this.imageList.length - 1) {
             this.saveData();
             uploadLoading.dismiss();
          }
          n++;
          console.log(res.success);
       },
       (error : any) =>
       {
          uploadLoading.dismiss();
          this.global.displayAlert("There is an error while uploading images, Try again.");
          console.log(error.success);
       });
    }
  }
  /**
   * @public
   * @method selectFileToUpload
   * @param event  {any}       The DOM event that we are capturing from the File input field
   * @description          Handles the selection of image files from the user's computer,
   *                       validates they are of the correct file type and displays the
   *              selected image in the component template along with an upload
   *               button
   * @return {none}
   */
   selectFileToUpload(event) : void {
     if(this.imageList.length > 2) {
       this.global.displayAlert('You can upload up to 3 images.');
       return ;
     }
     this._IMAGES
     .handleImageSelection(event)
     .subscribe((res) => {
        // Retrieve the file type from the base64 data URI string
        let _SUFFIX       = res.split(':')[1].split('/')[1].split(";")[0];

        // Do we have correct file type?
        if(this._IMAGES.isCorrectFileType(_SUFFIX)) {
           // Hide the file input field, display the image in the component template
           // and display an upload button
           this.isSelected   = true
           this.image       = res;
           let imgURL = this.global.todayString();

           this.imageList.push({
             ext: _SUFFIX,
             data: res,
             name: imgURL + "." + _SUFFIX
           });
        } else {
           this.global.displayAlert('You need to select an image file with one of the following types: jpg, gif or png');
        }
     }, (error) => {
        console.dir(error);
        console.log(error.message);
     });
  }
}
