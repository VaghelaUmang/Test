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
import { TranslateService } from '@ngx-translate/core';

import { ImagesProvider } from '../../services/images.images';
import { GlobalProvider } from '../../services/global-provider';

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
  selector: 'app-another-entry',
  templateUrl: './another-entry.page.html',
  styleUrls: ['./another-entry.page.scss'],
})
export class AnotherEntryPage implements OnInit {

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

  /**
   * @name image
   * @type String
   * @public
   * @description              Will store the selected image file data (in the form of a base64 data URI)
   */
  public image : string;
  
  public imageList: any = [];

  /**
   * @name isSelected
   * @type Boolean
   * @public
   * @description              Used to switch DOM elements on/off depending on whether an image has been selected
   */
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
              private _IMAGES: ImagesProvider,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
      try {
        if(!window.device) {
          window.ga('send', 'pageview', 'Another Entry Page');
        } else {
          if(this.ga) {
            this.ga.trackView('Another Entry Page');
          }
        }
      } catch(e) {
        console.log(e)
      }
      
	  	console.log("==enter another entry ===");
	  	this.user = JSON.parse(localStorage.getItem("user"));
	  	this.mainCategory = localStorage.getItem("mainCategoryIdx");
  		this.subCategory = localStorage.getItem("subCategoryIdx");
      this.data = {
          inventory_id: '',
          provider: '',
          faculty: '',
          tutor: '',
          user_id: '',
          main_category: this.mainCategory,
          main_category_name: localStorage.getItem("mainCategoryName"),
          sub_category: this.subCategory,
          sub_category_name: localStorage.getItem("subCategoryName"),
          inventory_item: '',
          inventory_itemList: [],
          address: '',
          inventory_value: '2',
          inventory_purchased: new Date().toISOString().substr(0, 10),
          notes: '',
          inventory_image: '',
          starttime: '',
          finishtime: ''
      };

      this.isCordova = this.global.isCordova;
      this.imageList = [];

      this.loadUserData();
      this.getAllActivites();
      this.getAddress();

      const inventoryData = this.global.inventoryData;
      if(inventoryData) {
      		this.inventoryData = inventoryData;
          this.data = inventoryData;
      }
      this.inventoryImg = null;
  }

  changeActivity() {
    //debugger
    let selectPlaceholder: any  = document.querySelector(".another-activity").shadowRoot.querySelector(".select-text");
    setTimeout(() => {
      selectPlaceholder.style.setProperty("white-space", "pre-wrap");
    }, 500);
  }

  loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

  async getAllActivites() {
      let date = window.localStorage.getItem("activityDate");
      let bReload = false;
      
      if(date === null || date === undefined || date === "") {
          bReload = true;
      } else {
          let now = new Date();
          let timeDiff = Math.abs(parseInt(date) - now.getTime());
          let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
          if(diffDays > 30) {
              bReload = true;
          }
      }
      
      if(bReload === false) {
          let activityList = this.global.allActivityList;
          for(let i=0;i<activityList.length;i++) {
              if(activityList[i].sub_category == this.subCategory) {
                  this.activities.push(activityList[i]);
              }
          }

          setTimeout(() => {
		        this.data.inventory_itemList = this.inventoryData.inventory_itemList;
		        this.cdRef.detectChanges();
		      }, 1000);
		      this.cdRef.detectChanges();

          return ;
      }

      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_activities.php?faculty=" + this.user.faculty + "&subcategory=" + this.subCategory;
      this.activities = [];
      const loading = await this.loadingController.create({
	      message: this.translate.instant('Loading...'),
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          let activityList = resp.data;
          this.activities = activityList;
          setTimeout(() => {
		        this.data.inventory_itemList = this.inventoryData.inventory_itemList;
		        this.cdRef.detectChanges();
		      }, 1000);
		      this.cdRef.detectChanges();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("We could not retrieve the activities list");
      });        
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
      this.addressList = this.addressList.filter(item => {
        return item.completed != '1' || item.completed != 1
      })
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
        this.addressList = this.addressList.filter(item => {
          return item.completed != '1' || item.completed != 1
        })
      }
    }, err => {
        loading.dismiss();
        console.log(err);
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

        let imgURL = this.global.todayString();
        this.imgURL = imgURL+".jpg";
        this.imageList.push({
           ext: 'jpeg',
           data: imageData,
           name: imgURL + ".jpg"
        });
      }, (err) => {

      });
  }
    
	async doSave(bReturn = false) {
      if(this.data.inventory_itemList.length < 1) {
        this.global.displayAlert("Please select Activity");
        return ;
      }
      if(this.data.inventory_itemList.length > 3) {
        this.global.displayAlert("You can add up to 3 activities.");
        return ;
      }
      if(this.data.address == "") {
        this.global.displayAlert("Please select Project");
        return ;
      }
      if(this.imageList.length < 1) {
          this.saveData(bReturn);
          return ;
      } else {
          this.doUploadImage(bReturn);
          return ;
      }
      let imageData = this.inventoryImg;
      let imgURL = this.global.todayString();
      
      this.imgURL = imgURL+".jpg";

      let option: FileUploadOptions = {
          fileKey: 'file',
          fileName: imgURL,
          httpMethod: 'post',
          chunkedMode: false,
          mimeType: 'image/jpeg',
          params: {
              'value1': imgURL,
              'value2' : "param"
          }
      };

      const fileTransfer: FileTransferObject = this.transfer.create();

      this.uploadLoading = await this.loadingController.create({
	      message: '',
	    });
	    await this.uploadLoading.present();
      let url = "https://www.artisanideas.co.nz/api/app-rentice/inventory_imgUpload.php";

      fileTransfer.upload(imageData, encodeURI(url), option).then(data => {
				if(this.uploadLoading) {
	    		this.uploadLoading.dismiss();
	    	}
	      this.saveData();
      }, err => {
      	if(this.uploadLoading) {
	    		this.uploadLoading.dismiss();
	    	}
	      console.log("An error has occurred: Code = " + err.code);
      });

      fileTransfer.onProgress((progressEvent) => {
	      if (progressEvent.lengthComputable) {
	        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
	        //status.innerHTML = perc + "% loaded...";
	      } else {
	      }
	    });
  }

  doSaveAndAnother() {
    this.doSave(true);
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

  async saveData(bReturn = false) {
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
          tutor_notes: "",
          approved: "",
          boss_check: "",
          boss_notes: ""
      };
      
      let url = "https://www.artisanideas.co.nz/api/app-rentice/add_inventory.php";
      const loading = await this.loadingController.create({
	      message: 'Saving Data...',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error == true) {
              this.global.displayAlert("There is an error while save your entry on inventory table.");
              return ;
          }
          
          if(this.data.savetimesheet == true) {
              this.saveTimesheet();
              return ;
          }

          this.global.allStudentLogList.unshift(data);

          this.sendNotification();

          this.alertController.create({
			      header: this.translate.instant('Great Success!'),
			      message: this.translate.instant('Your entry has been successfully saved'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            this.inventoryImg = null;
			            localStorage.setItem("inventoryImg", null);
                  localStorage.setItem("bLoadStudentLog", '1');
                  if(bReturn == false) {
                    this.router.navigateByUrl('/main');
                  } else {
                    this.resetForm();
                  }
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

  resetForm() {
      this.mainCategory = localStorage.getItem("mainCategoryIdx");
      this.subCategory = localStorage.getItem("subCategoryIdx");
      this.data = {
          inventory_id: '',
          provider: '',
          faculty: '',
          tutor: '',
          user_id: '',
          main_category: this.mainCategory,
          main_category_name: localStorage.getItem("mainCategoryName"),
          sub_category: this.subCategory,
          sub_category_name: localStorage.getItem("subCategoryName"),
          inventory_item: '',
          inventory_itemList: [],
          address: '',
          inventory_value: '2',
          inventory_purchased: new Date().toISOString().substr(0, 10),
          notes: '',
          inventory_image: '',
          starttime: '',
          finishtime: ''
      };

      this.imageList = [];
      this.inventoryImg = null;

      this.loadUserData();
      this.getAllActivites();
      this.getAddress();
  }

    
  async saveTimesheet() {
      let data = {
          user_id: this.data.user_id.toString(),
          main_category: this.data.main_category,
          sub_category: this.data.sub_category,
          activity: this.data.inventory_item,
          address: this.data.address,
          hours: this.data.inventory_value,
          date: this.data.inventory_purchased,
          notes: this.data.notes,
          image: this.imgURL,
          starttime: this.data.starttime,
          finishtime: this.data.finishtime
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/add_timesheet_from_inventory.php";
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error == true) {
              this.global.displayAlert("There is an error while save your entry on timesheet table.");
              return ;
          }

          this.alertController.create({
			      header: this.translate.instant('Great Success!'),
			      message: this.translate.instant('Your entry has been successfully saved'),
			      buttons: [{
			          text: 'Okay',
			          handler: () => {
			            this.inventoryImg = null;
			            localStorage.setItem("inventoryImg", null);
                  localStorage.setItem("bloadTimesheet", '1');
			            //localStorage.removeItem("inventoryImg");
              		//$state.go("anotherEntry");
                  this.router.navigateByUrl('/home');
			          }
			        }
			      ]
			    }).then((alert) => {
			    	alert.present();
			    });
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error while save your entry on timesheet table.");
      });        
  }

  sendNotification() {
    let data = {
      user_id: this.data.user_id.toString(),
      type: "studentlog"
    };
    let url = "https://www.artisanideas.co.nz/api/app-rentice/notify_studentlog.php";
    this.http.post(url, data).subscribe((resp: any) => {
        console.log(resp);
    }, (err) => {
    });
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
        const _SUFFIX       = res.split(':')[1].split('/')[1].split(";")[0];

        // Do we have correct file type?
        if(this._IMAGES.isCorrectFileType(_SUFFIX)) {
           // Hide the file input field, display the image in the component template
           // and display an upload button
           this.isSelected   = true
           this.image       = res;
           const imgURL = this.global.todayString();

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
