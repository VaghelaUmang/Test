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
import { ImagesProvider } from '../../services/images.images';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

declare var window;

import {
  File
} from '@ionic-native/file/ngx';

import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';

import { Camera } from '@ionic-native/camera/ngx';

import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-edit-sl-entry',
  templateUrl: './edit-sl-entry.page.html',
  styleUrls: ['./edit-sl-entry.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditSlEntryPage implements OnInit {

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

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
  						private transfer: FileTransfer,
  						public file: File,
  						public camera: Camera,
              private translate: TranslateService,
  						public actionSheetCtrl: ActionSheetController,
              private _IMAGES   : ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  async exportPDF() {
    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF

    let mainCat = "";
    this.mainCategoryList.forEach((item) => {
      if(item.cat == this.data.main_category) {
        mainCat = item.name;
        return ;
      }
    });
    let subCat = "";
    this.subCategoryList.forEach((item) => {
      if(item.list_id == this.data.sub_category) {
        subCat = item.name;
        return ;
      }
    });
    let inventory_item = "";
    this.activities.forEach((item) => {
      if(item.idx == this.data.inventory_item) {
        inventory_item = item.name;
        return ;
      }
    });
    let project = "";
    this.addressList.forEach((item) => {
      if(item.list_id == this.data.address) {
        project = item.address;
        return ;
      }
    });

    const loading = await this.loadingController.create({
      message: 'Exporting as PDF...',
    });
    await loading.present();
    pdf.text('Main Category: ' + mainCat, 10, 10)
    pdf.text('Sub Category: ' + subCat, 10, 20)
    pdf.text('Activity: ' + inventory_item, 10, 30)
    pdf.text('Project: ' + project, 10, 40)
    pdf.text('Hours: ' + this.data.inventory_value, 10, 50)
    pdf.text('Notes: ' + this.data.notes, 10, 60)
    pdf.text('Employer Notes: ' + this.data.boss_notes, 10, 70)
    pdf.text('Tutor Notes: ' + this.data.tutor_notes, 10, 80)
    pdf.text('Date: ' + this.data.date, 10, 90)
    
    let pdfName = new Date().getTime() + ".pdf";

    let width = pdf.internal.pageSize.getWidth();
    let height = pdf.internal.pageSize.getHeight();
    let n = 0;

    if(this.imageNewList.length < 1) {
      for(let i=0;i<this.imageList.length;i++){
        this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + this.imageList[i].name, (dataUrl) => {
         //console.log(dataUrl);
         pdf.addPage();
         pdf.addImage(dataUrl, "JPG", 0, 0, width, height);
         n++;
         if(n >= this.imageList.length) {
           loading.dismiss();
           pdf.save(pdfName);
         }
        });
      }
      
      if(this.imageList.length < 1) {
        loading.dismiss();
        pdf.save(pdfName);
      }    
    } else {
      for(let i=0;i<this.imageNewList.length;i++){
         pdf.addPage();
         pdf.addImage(this.imageNewList[i].data, "JPG", 0, 0, width, height);
      }
      loading.dismiss();
       pdf.save(pdfName);
    }
  }

	ionViewDidEnter() {
  	console.log("==student edit page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

	  this.currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    console.log(this.currentStudent);

    const date = new Date(this.currentStudent.inventory_purchased);
    this.data = {
        inventory_id: this.currentStudent.inventory_id,
        user_id: '',
        main_category: '',
        sub_category: '',
        inventory_item: this.currentStudent.inventory_item,
        address: this.currentStudent.address_id ? this.currentStudent.address_id.toString() : this.currentStudent.address,
        inventory_value: this.currentStudent.inventory_value,
        notes: this.currentStudent.notes,
        date: this.currentStudent.inventory_purchased,
        inventory_image: this.currentStudent.inventory_image,
        inventory_image2: this.currentStudent.inventory_image2,
        inventory_image3: this.currentStudent.inventory_image3,
        boss_notes: this.currentStudent.boss_notes,
        tutor_notes: this.currentStudent.tutor_notes
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

    this.bFirstLoad = true;

    this.loadUserData();
    this.loadData();
    this.getAllActivites();
    this.getAddress();
  }

	replaceAll(str, search, replacement) {
      return str.replace(new RegExp(search, 'g'), replacement);
  }

	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

	loadData() {
      this.mainCategoryList = [];
      this.subCategoryList = [];
      this.activities = [];
      
      let mainCategoryList = this.global.allMaincategoryList;

      if(mainCategoryList) {
        mainCategoryList.forEach((item) => {
          item.cat = item.cat.toString();
          item.list_id = item.list_id.toString();
        });
      }

      this.mainCategoryList = mainCategoryList;
  
      setTimeout(() => {
				this.data.main_category = this.currentStudent.main_category;
	      this.data.sub_category = this.currentStudent.sub_category;
	      this.cdRef.detectChanges();
      }, 100);
      //this.data.main_category = this.currentStudent.main_category;
      //this.data.sub_category = this.currentStudent.sub_category;

      this.getSubCategory();
  }

  getSubCategory() {
      const allSubcategoryList = this.global.allSubcategoryList;
      let subCategoryList = [];
      for(let i=0;i<allSubcategoryList.length;i++) {
        if(allSubcategoryList[i].main == this.currentStudent.main_category) {
          subCategoryList.push(allSubcategoryList[i]);
        }
      }

      if(subCategoryList) {
        subCategoryList.forEach((item) => {
          item.cat = item.cat.toString();
          item.list_id = item.list_id.toString();
        });
      }
      this.subCategoryList = subCategoryList;
      if(this.subCategoryList.length < 1)
        this.loadSubCategory();
  }

  async loadSubCategory () {
      let url = "https://www.artisanideas.co.nz/api/app-rentice/get_subcategory_by_main.php?main_cat=" + this.currentStudent.main_category + "&faculty=" + this.user.faculty;
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.subCategoryList = resp.category;
          let data = JSON.stringify(this.subCategoryList);

          if(this.subCategoryList) {
            this.subCategoryList.forEach((item) => {
              item.cat = item.cat.toString();
              item.list_id = item.list_id.toString();
            });
          }
          window.localStorage.setItem("subcategoryByMain_" + this.currentStudent.main_category, data);
          let now: any = new Date();
          window.localStorage.setItem("subcategoryDateByMain_" + this.currentStudent.main_category, now.getTime());
          setTimeout(() => {
            this.data.main_category = this.currentStudent.main_category;
            this.data.sub_category = this.currentStudent.sub_category;
            this.cdRef.detectChanges();
          }, 100);
          this.cdRef.detectChanges();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("We could not connect to the server, Please turn on network to get subcategory");
      });
  }

  getAllActivites() {
      this.activityList = this.global.allActivityList;
      
      this.changeSubCategory();
  }

  getAddress() {
      this.addressList = this.global.allAddressList;
      setTimeout(() => {
        if(!this.currentStudent.address_id) {
          this.addressList.forEach((item) => {
            if(item.address == this.currentStudent.address) {
              this.data.address = parseInt(item.list_id);
            }
          });
        } else {
          this.data.address = parseInt(this.currentStudent.address_id);
        }
        this.cdRef.detectChanges();
     }, 1000);
     this.cdRef.detectChanges();
  }

	changeMainCategory() {
      if(this.bFirstLoad) {
        this.bFirstLoad = false;
        return ;
      }
	    console.log(this.data.main_category);
	    if(this.data.main_category.length < 1) {
	    	return ;
	    }

      const allSubcategoryList = this.global.allSubcategoryList;
      let subCategoryList = [];
      for(let i=0;i<allSubcategoryList.length;i++) {
        if(allSubcategoryList[i].main == this.data.main_category) {
          subCategoryList.push(allSubcategoryList[i]);
        }
      }
      this.subCategoryList = subCategoryList;
	}

  changeSubCategory() {
      let dataList = this.activityList;
      this.activities = [];
      this.currentActivityIdx = "0";
      let activityList = [];
      let n = 0;
      for(let i=0;i<dataList.length;i++) {
          if(dataList[i].sub_category == this.data.sub_category) {
              n++;
              this.activities.push({
                ...dataList[i],
                idx: n.toString() 
              });
              if(dataList[i].name == this.currentStudent.inventory_item) {
                this.currentActivityIdx = n.toString();
              }
          }
      }

      if(this.currentStudent.inventory_item.length > 0) {
        activityList.push(this.currentStudent.inventory_item);
      }

      if(this.currentStudent.inventory_item2.length > 0) {
        activityList.push(this.currentStudent.inventory_item2);
      }

      if(this.currentStudent.inventory_item3.length > 0) {
        activityList.push(this.currentStudent.inventory_item3);
      }
      console.log(this.activities);
      console.log(this.currentActivityIdx);
      setTimeout(() => {
        this.data.inventory_itemList = activityList;//this.currentActivityIdx;
        this.cdRef.detectChanges();
      }, 100);
      this.cdRef.detectChanges();
      this.getAddress();
  }
    
  doRemove() {
  	this.alertController.create({
      header: 'Hold Up',
      message: 'Are you sure to remove this item?',
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
				      message: 'Sweeping it under the mat...',
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert('There was a problem removing the entry.')
                    return ;
                }

                this.alertController.create({
						      header: 'Woo Hoo!',
						      message: 'The Entry was removed',
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
                this.global.displayAlert('There was a problem removing the entry.')
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });
  }

  async doSaveData() {
      console.log(this.data);
      console.log(this.imageList);
      console.log(this.imageNewList);
      let inventoryItem = "";
      this.activities.forEach((item) => {
        if(item.idx == this.data.inventory_item) {
          inventoryItem = item.name;
          return ;
        }
      });

      let address = "";
      this.addressList.forEach((item) => {
        if(item.list_id == this.data.address) {
          address = item.address;
          return ;
        }
      })
      let data = {};
      if(this.imageNewList.length > 0) {
        data = {
            inventory_id: this.data.inventory_id,
            main_category: this.data.main_category,
            sub_category: this.data.sub_category,
            inventory_item: this.data.inventory_itemList[0],
            inventory_item2: this.data.inventory_itemList[1] ? this.data.inventory_itemList[1]: "",
            inventory_item3: this.data.inventory_itemList[2] ? this.data.inventory_itemList[2]: "",
            address: address,
            inventory_value: this.data.inventory_value,
            notes: this.data.notes,
            date: this.data.date,
            image: this.imageNewList[0] ? this.imageNewList[0].name : "",
            image2: this.imageNewList[1] ? this.imageNewList[1].name : "",
            image3: this.imageNewList[2] ? this.imageNewList[2].name : ""
        };
      } else {
        data = {
          inventory_id: this.data.inventory_id,
          main_category: this.data.main_category,
          sub_category: this.data.sub_category,
          inventory_item: this.data.inventory_itemList[0],
          inventory_item2: this.data.inventory_itemList[1] ? this.data.inventory_itemList[1]: "",
          inventory_item3: this.data.inventory_itemList[2] ? this.data.inventory_itemList[2]: "",
          address: address,
          inventory_value: this.data.inventory_value,
          notes: this.data.notes,
          date: this.data.date,
        };
      }

      this.inventoryList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_student.php";
      const loading = await this.loadingController.create({
	      message: '',
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
                  localStorage.setItem('bLoadStudentLog', '1');
			            this.router.navigateByUrl('/student-log');
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
				this.studentImg = "data:image/jpeg;base64," + imageData;
	      setTimeout(() => {
	         this.studentImg = "data:image/jpeg;base64," + imageData;
	      }, 100);
	      let now = new Date();
	      let today: any  = now.toISOString().substr(0, 19);
	      today = this.replaceAll(today, "-", "");
	      today = this.replaceAll(today, "T", "_");
	      today = this.replaceAll(today, ":", "");
	      let imgURL = today + "_" + now.getTime();
	      this.imgURL = imgURL+".jpg"; 
	    }, (err) => {
	      
	    });
  }

	async doUpdate() {
    /*if(!this.studentImg) {
        this.doSaveData();
        return ;
    }*/
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
    if(this.imageNewList.length < 1) {
        this.doSaveData();
        return ;
    } else {
        this.doUploadImage();
        return ;
    }
    let imageData = this.studentImg;
    let imgURL = this.imgURL;

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
    const url = "https://www.artisanideas.co.nz/api/app-rentice/record_imgUpload.php";
    fileTransfer.upload(imageData, encodeURI(url), option).then(data => {
			if(this.uploadLoading) {
    		this.uploadLoading.dismiss();
    	}
      this.doSaveData();
    }, err => {
    	if(this.uploadLoading) {
    		this.uploadLoading.dismiss();
    	}
      console.log("An error has occurred: Code = " + err.code);
      this.global.displayAlert('We could not upload your photo, please try again later.')
    });

		fileTransfer.onProgress((progressEvent) => {
      console.log(progressEvent);
      if (progressEvent.lengthComputable) {
        let perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
      } else {
      }
    });
  }


  async doUploadImage() {
    let n = 0;
    let uploadLoading = await this.loadingController.create({
      message: 'Uploading images...',
    });
    await uploadLoading.present();
    for(let i=0;i<this.imageNewList.length;i++) {

       this._IMAGES
       .uploadImageSelection(this.imageNewList[i].data,
                             this.imageNewList[i].name)
       .subscribe((res) =>
       {
          if(n>=this.imageNewList.length - 1) {
             this.doSaveData();
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
     if(this.imageNewList.length > 2) {
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
           let now = new Date();
           let today = now.toISOString().substr(0, 19);
            today = this.replaceAll(today, "-", "");
            today = this.replaceAll(today, "T", "_");
            today = this.replaceAll(today, ":", "");
            let imgURL = today + "_" + now.getTime();

           this.imageNewList.push({
             ext: _SUFFIX,
             data: res,
             name: imgURL + "." + _SUFFIX
           });
           this.cdRef.detectChanges();
        } else {
           this.global.displayAlert('You need to select an image file with one of the following types: jpg, gif or png');
        }
     }, (error) => {
        console.dir(error);
        console.log(error.message);
     });
  }
}
