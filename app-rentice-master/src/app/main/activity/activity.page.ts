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
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit {

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

  bShowResourceBtn: boolean = false;

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
              private ga: GoogleAnalytics,
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
      try {
        if(!window.device) {
          window.ga('send', 'pageview', 'Enter Activity Page');
        } else {
          this.ga.trackView('Enter Activity Page');
        }
      } catch(e) {
        console.log(e)
      }

      let subCatInfo = JSON.parse(localStorage.getItem("subCatInfo"));
      if(subCatInfo.link == null || subCatInfo.link == undefined) {
        this.bShowResourceBtn = false
      } else {
        this.bShowResourceBtn = true;
      }
      console.log(this.platform);
	  	console.log("==enter activity===");
	  	this.user = JSON.parse(localStorage.getItem("user"));
  		this.mainCategory = localStorage.getItem("mainCategoryIdx");
  		this.subCategory = localStorage.getItem("subCategoryIdx");
      var today = new Date();
      var time = today.getHours() + ":" + today.getMinutes();

      let lastEntry: any = localStorage.getItem("lastEntry");

      if(lastEntry && lastEntry.length > 1) {
        lastEntry = JSON.parse(lastEntry);
      }

      let itemList = [];
      let address = "";
      let notes = "";
      let inventory_purchased: any;
      let inventory_value = '1';
      console.log(lastEntry);
      if(lastEntry) {
        if(lastEntry.inventory_item && lastEntry.inventory_item.length > 1) {
          itemList.push(lastEntry.inventory_item);
        }
        if(lastEntry.inventory_item2 && lastEntry.inventory_item2.length > 1) {
          itemList.push(lastEntry.inventory_item2);
        }
        if(lastEntry.inventory_item3 && lastEntry.inventory_item3.length > 1) {
          itemList.push(lastEntry.inventory_item3);
        }

        if(lastEntry.address && lastEntry.address.length > 0) {
          address = lastEntry.address;
        }

        if(lastEntry.notes && lastEntry.notes.length > 0) {
          notes = lastEntry.notes;
        }

        //if(lastEntry.inventory_purchased && lastEntry.inventory_purchased.length > 0) {
        //  inventory_purchased = lastEntry.inventory_purchased;
        //}

        if(lastEntry.inventory_value && lastEntry.inventory_value.length > 0) {
          inventory_value = lastEntry.inventory_value;
        }
      } else {
        let inventory_item: any = localStorage.getItem("inventory_item");
        if(inventory_item != null && inventory_item != undefined)
          itemList.push(inventory_item);
      }

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
      
      localStorage.removeItem("lastEntry");
      localStorage.removeItem("inventory_item");
      //this.checkLocalData();
      this.getAllActivites();
      this.loadUserData();
      this.getAddress();

  }

  changeActivity() {
    let selectPlaceholder: any  = document.querySelector(".main-activity").shadowRoot.querySelector(".select-text");
    selectPlaceholder.style.setProperty("white-space", "pre-wrap");
  }


  openResources() {
    let subCatInfo = JSON.parse(localStorage.getItem("subCatInfo"));
    console.log(subCatInfo);
    if(subCatInfo.link == null || subCatInfo.link == undefined) {
      return ;
    }
    let url = subCatInfo.link.replace(/\/\/|.+\/\//, '');
    url = "https://" + url;
    window.open(url,  '_blank', 'location=yes');
  }

  async checkLocalData() {
        let localData = window.localStorage.getItem("inventory");
        let inventoryList = [];
        if(localData != null && localData != undefined && localData != "") {
          inventoryList = JSON.parse(localData);
        }
        if(inventoryList.length > 0) {
          let len = inventoryList.length;
        	const alert = await this.alertController.create({
				      header: 'Yay!',
				      message: 'Network is available. There are ' + len + ' entries saved to your device, do you want to upload?',
				      buttons: [{
				          text: this.translate.instant('Cancel'),
				          role: 'cancel',
				          cssClass: 'secondary',
				          handler: (blah) => {
				            console.log('Confirm Cancel: blah');
				          }
				        }, {
				          text: 'Okay',
				          handler: () => {
				            console.log('Confirm Okay');
				            this.uploadInventoryList(inventoryList);
				          }
				        }
				      ]
				    });

				    await alert.present();
        }        
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
          this.activities = [];
          for(let i=0;i<activityList.length;i++) {
              if(activityList[i].sub_category == this.subCategory) {
                  this.activities.push(activityList[i]);
              }
          }

          let itemList = [];
          let lastEntry: any = localStorage.getItem("lastEntry");

          if(lastEntry && lastEntry.length > 1) {
            lastEntry = JSON.parse(lastEntry);
          } else {
            return ;
          }

          if(lastEntry.inventory_item && lastEntry.inventory_item.length > 1) {
            itemList.push(lastEntry.inventory_item);
          }
          if(lastEntry.inventory_item2 && lastEntry.inventory_item2.length > 1) {
            itemList.push(lastEntry.inventory_item2);
          }
          if(lastEntry.inventory_item3 && lastEntry.inventory_item3.length > 1) {
            itemList.push(lastEntry.inventory_item3);
          }

          this.data.inventory_itemList = itemList;
          this.inventory_itemList = itemList;
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
          let itemList = [];
          let lastEntry: any = localStorage.getItem("lastEntry");

          if(lastEntry && lastEntry.length > 1) {
            lastEntry = JSON.parse(lastEntry);
          } else {
            return ;
          }

          if(lastEntry.inventory_item && lastEntry.inventory_item.length > 1) {
            itemList.push(lastEntry.inventory_item);
          }
          if(lastEntry.inventory_item2 && lastEntry.inventory_item2.length > 1) {
            itemList.push(lastEntry.inventory_item2);
          }
          if(lastEntry.inventory_item3 && lastEntry.inventory_item3.length > 1) {
            itemList.push(lastEntry.inventory_item3);
          }

          this.data.inventory_itemList = itemList;
          this.inventory_itemList = itemList;
          this.cdRef.detectChanges();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("We could not retrieve the activities list");
      });
  }

  loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
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
      message: this.translate.instant('Loading...'),
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
    
  doSave () {
        console.log(this.data);
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

        let data = {
            provider: this.data.provider,
            faculty: this.data.faculty,
            tutor: this.data.tutor,
            user_id: this.data.user_id.toString(),
            main_category: this.data.main_category,
            sub_category: this.data.sub_category,
            main_category_name: this.data.main_category_name,
            sub_category_name: this.data.sub_category_name,
            inventory_itemList: this.data.inventory_itemList,
            inventory_item: this.data.inventory_itemList[0],
            inventory_item2: this.data.inventory_itemList[1] ? this.data.inventory_itemList[1]: "",
            inventory_item3: this.data.inventory_itemList[2] ? this.data.inventory_itemList[2]: "",
            address: this.data.address,
            inventory_value: this.data.inventory_value,
            inventory_purchased: this.data.inventory_purchased.substr(0,10),
            notes: this.data.notes,
            inventory_image: this.imgURL,
            imageList: this.imageList,
            savetimesheet: this.data.savetimesheet,
            starttime: this.data.starttime,
            finishtime: this.data.finishtime
        };
        this.global.inventoryData = data;
        this.global.inventoryImg = this.inventoryImg;
        this.inventoryData = data;
        this.inventoryImg = this.inventoryImg;
        this.router.navigateByUrl('/confirm-entry');
  }

    /*this.$on('no-network', function(event, args) {
        // do what you want to do
    });
    
    this.$on('yes-network', function(event, args) {
        // do what you want to do
        this.checkLocalData();
    });*/
    
    uploadInventoryList(inventoryList) {
       this.localInventoryList = inventoryList;
       this.uploadImagefromLocal();
    }
    
    async uploadDataFromLocal() {
        let data = this.localInventoryList[0];
        let url = "https://www.artisanideas.co.nz/api/app-rentice/add_inventory.php";
        const loading = await this.loadingController.create({
		      message: '',
		    });
		    await loading.present();
        this.http.post(url, data).subscribe((resp: any) => {
            loading.dismiss();
            console.log(resp);
            if(resp.error === true) {
                this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
                return ;
            }
            this.localInventoryList.splice(0, 1);
            let saveData = JSON.stringify(this.localInventoryList);
            window.localStorage.setItem("inventory", saveData);
            if(this.localInventoryList.length < 1) {
                this.global.displayAlert('Entry has been uploaded successfully.')
                return ;
            }
            this.uploadImagefromLocal();
            
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
        });
    }
    
    async uploadImagefromLocal() {
      if(!this.localInventoryList[0].img_data) {
          this.uploadDataFromLocal();
          return ;
      }
      let imageData = this.localInventoryList[0].img_data;
      let imgURL = this.localInventoryList[0].inventory_image;

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

      let uploadLoading = await this.loadingController.create({
	      message: '',
	    });
	    await this.uploadLoading.present();
      const url = "https://www.artisanideas.co.nz/api/app-rentice/inventory_imgUpload.php";
      fileTransfer.upload(imageData, encodeURI(url), option).then(data => {
        if(uploadLoading) {
          uploadLoading.dismiss();
        }
        this.doSave();
      }, err => {
        if(uploadLoading) {
          uploadLoading.dismiss();
        }
        console.log("An error has occurred: Code = " + err.code);
        this.global.displayAlert('We could not upload your photo, please try again later.');
      });

      fileTransfer.onProgress((progressEvent) => {
        console.log(progressEvent);
        if (progressEvent.lengthComputable) {
          let perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
        } else {
        }
      });
    }
    
    changeTimesheet() {
      console.log(this.data.savetimesheet);
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
