import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonItemSliding } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { forkJoin, interval } from 'rxjs';
import { ImagesProvider } from '../../services/images.images';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { placeholderImg } from "../../services/placeholderImg";

declare var window;

@Component({
  selector: 'app-signoff-summary',
  templateUrl: './signoff-summary.page.html',
  styleUrls: ['./signoff-summary.page.scss'],
})
export class SignoffSummaryPage implements OnInit {

	data: any = {};
	user: any = {};
	maincategoryList: any = [];
	currentSignoffItem: any;
	existedList: any = [];
	recordWorkList: any = [];

	rowstatusList: any = [];
	unitSummary: any = [];
	allElementList: any = [];
	allUnitList: any = [];
	signedOffList: any = [];
	signedOff2List: any = [];

	photo1: any;
	photo2: any;
	tutor_notes: string = '';
	image1: string = '';
	image2: string = '';
	isReadonly: boolean = false;
	currentStatus: number = 0; //In Progress, Sent, Completed
  qualName: string = "";

  pdf: any;
  saveList: any = [];
  saveLoading: any;
  pdfListCnt: number = 0;
  yPos: number;

  elementList: any = [];

  constructor(private platform: Platform,
              private translate: TranslateService,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              private _IMAGES: ImagesProvider,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Trainee Signoff Summary page');
      } else {
        if(this.ga) {
          this.ga.trackView('Trainee Signoff Summary page');
        }
      }
    } catch(e) {
      console.log(e)
    }

    this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
    this.currentSignoffItem = JSON.parse(localStorage.getItem("currentSignoffItem"));

    this.maincategoryList = this.global.allMaincategoryList;
    this.tutor_notes = this.currentSignoffItem.tutor_notes? this.currentSignoffItem.tutor_notes: "";
    this.image1 = this.currentSignoffItem.photo1? this.currentSignoffItem.photo1: "";
    this.image2 = this.currentSignoffItem.photo2? this.currentSignoffItem.photo2: "";
    this.photo1 = null;
    this.photo2 = null;
    this.recordWorkList = [];
    this.unitSummary = [];

    this.isReadonly = false;

    switch (this.currentSignoffItem.status) {
    	case "In Progress":
    		this.currentStatus = 0;
    		this.isReadonly = true;
    		break;
    	case "Sent":
    		this.currentStatus = 1;
    		break;
    	case "Completed":
    		this.currentStatus = 2;
    		this.isReadonly = true;
    		break;
    	case "In Review":
    		this.currentStatus = 3;
    		break;
    	default:
    		this.currentStatus = 0;
    		break;
    }

    this.loadUserData()
    //this.loadRequestItemData()
    this.loadQualData()
    this.loadSignedOffData()
  }

  loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

  goRecordOfWork() {
    this.global.fromRequestPage = true;
    this.router.navigateByUrl('/view-tutor-student');
  }

  goQualification() {
    this.global.fromRequestPage = true;
    this.router.navigateByUrl('/view-tutor-unit-standard');
  }


  loadQualData() {
    this.global.allQualList.forEach(item => {
      if(item.list_id == this.currentSignoffItem.course_code) {
        this.qualName = item.name;
      }
    })
    if(this.qualName.length > 0) {
      return ;
    }
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_qual.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get courseList");
          return ;
        }

        resp.data.filter(item => {
          if(item.list_id == this.currentSignoffItem.course_code) {
            this.qualName = item.name;
          }
        })
    }, (err) => {
        console.log("there is an error while get courseList");
    });
  }

  loadElementData() {
    this.elementList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_elements.php?faculty=" + this.user.faculty + "&provider=" + this.user.provider;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get element data");
          return ;
        }
        
        this.elementList = resp.data;
        this.elementList.forEach(item => {
          item.status = "Not Assessed"
          this.signedOff2List.forEach(signedoff => {
            if(item.list_id == signedoff.element) {
              item.status = signedoff.status;
              item.signedoff2_id = signedoff.list_id;
            }
          })
        })
        //console.log("====element list======")
        //console.log(this.elementList)

    }, (err) => {
        console.log("there is an error while get element data");
    });
  }

  async loadRequestItemData() {
  	const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
  	this.existedList = [];
  	this.recordWorkList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_request_item.php?request_no=" + this.currentSignoffItem.list_id;
    this.http.get(url).subscribe((resp: any) => {
    		loading.dismiss();
        if(resp.error == true) {
          return ;
        }
        console.log("==existed request items====")
        console.log(resp.data)
        this.existedList = resp.data;

        let unitList = [];
        let elementList = [];
        resp.data.forEach(item => {
        	for(var i=0;i<this.rowstatusList.length;i++) {
        		if(item.row_entry == this.rowstatusList[i].list_id && item.status == this.currentStatus) {
        			this.recordWorkList.push(this.rowstatusList[i]);
        			break; 
        		}
        	}

        	for(let i=0;i<this.signedOffList.length;i++) {
        		if(item.row_entry.length<1 && item.status == this.currentStatus && item.element.length<1 && item.unit == this.signedOffList[i].list_id) {

              let unit;
              for(let j=0;j<this.allUnitList.length;j++) {
                if(this.signedOffList[i].unit == this.allUnitList[j].list_id) {
                  unit = this.allUnitList[j];
                  break;
                }
              }
        			unitList.push({
                signedoff_id: this.signedOffList[i].list_id,
                ...unit
              })
        			break;
        		}
        	}

        	for(let i=0;i<this.signedOff2List.length;i++) {
        		if(item.row_entry.length<1 && item.status == this.currentStatus  && item.element == this.signedOff2List[i].list_id) {

              let element;
              for(let j=0;j<this.allElementList.length;j++) {
                if(this.signedOff2List[i].element == this.allElementList[j].list_id) {
                  element = this.allElementList[j];
                  break;
                }
              }
        			elementList.push({
                signedoff2_id: this.signedOff2List[i].list_id,
                ...element
              })
        			break;
        		}
        	}
        })
        console.log("==record of work list==")
        console.log(this.recordWorkList)
        console.log("==unit list==")
        console.log(unitList)
        console.log("==element list==")
        console.log(elementList)

        let unitSummary = [];

		    unitList.forEach(unitItem => {
          unitItem.hasAllElement = false;
          let allElementCnt = 0;
          this.allElementList.forEach(ele => {
            if(unitItem.list_id == ele.unit) {
              allElementCnt++;
            }
          })
		      let eleList = [];
		      elementList.forEach(element => {
		        if(unitItem.list_id == element.unit) {
		          eleList.push({
                signedoff_id: unitItem.signedoff_id,
                ...element
              })
		        }
		      })
          if(allElementCnt == eleList.length) {
            unitItem.hasAllElement = true;
          }
		      if(eleList.length > 0) {
		      	unitSummary.push({
			        unit: unitItem,
			        element: eleList
			      })
		      }
		    })

		    console.log(" unit element summary")
		    console.log(unitSummary)
    		this.unitSummary = unitSummary;
    }, (err) => {
    		loading.dismiss();
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
    		loading.dismiss()
        if(resp.error == true) {
          return ;
        }
        resp.data.forEach(item => {
        	item.inventory_item = item.activity;
        	item.inventory_item2 = item.activity2;
        	item.inventory_item3 = item.activity3;
        	item.inventory_image = item.photo;
        	item.inventory_image2 = item.photo2;
        	item.inventory_image3 = item.photo3;
        	this.global.allMaincategoryList.forEach(cat => {
        		if(item.main_category == cat.cat) {
        			item.mainCat = cat.name;
        		}
        	})
      		this.rowstatusList.push(item)
        })
        console.log("===row status list===")
        console.log(this.rowstatusList)

        this.loadRequestItemData();
    }, (err) => {
    		loading.dismiss()
    });
  }

  async getAllMainCategory() {
      var url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory_by_provider_10.php?provider=" + this.user.provider + "&faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              return ;
          }
          this.maincategoryList = resp.category;
          this.loadRowStatus();
      }, (err) => {
      });
  }

  async loadUnitElementData() {
  	let funcList = [];
  	this.allElementList =[];
    this.allUnitList = [];
  	let url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_elements.php";
    url = "https://www.artisanideas.co.nz/api/app-rentice/get_elements.php?faculty=" + this.user.faculty + "&provider=" + this.user.provider;
    funcList.push(this.http.get(url));
    url = "https://www.artisanideas.co.nz/api/app-rentice/get_unit.php";
    funcList.push(this.http.get(url));
    const loading = await this.loadingController.create({
      message: ''
    });
    await loading.present();
    forkJoin(funcList).subscribe(data => {
      loading.dismiss();
      if(data && data.length > 0) {
        console.log(data)
        this.allElementList = data[0].data;
        this.allUnitList = data[1].data;

        this.allUnitList.forEach(item => {
          item.status = "Not Assessed"
          this.signedOffList.forEach(signedoff => {
            if(item.list_id == signedoff.unit) {
              item.status = signedoff.status
            }
          })
        })

        this.allElementList.forEach(item => {
          item.status = "Not Assessed"
          this.signedOff2List.forEach(signedoff => {
            if(item.list_id == signedoff.element) {
              item.status = signedoff.status
            }
          })
        })
      }

      if(this.maincategoryList.length < 1) {
	    	this.getAllMainCategory();
	    } else {
	    	this.loadRowStatus()
	    }
    }, err => {
      loading.dismiss();
      console.log(err);

      if(this.maincategoryList.length < 1) {
	    	this.getAllMainCategory();
	    } else {
	    	this.loadRowStatus()
	    }
    });
  }

  async loadSignedOffData() {
    this.signedOffList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_signedoff.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get signed off data");
          return ;
        }
        this.signedOffList = resp.data.filter(item => {
          return (parseInt(item.provider) == parseInt(this.user.provider) && 
            parseInt(item.faculty) == parseInt(this.user.faculty) && 
            parseInt(item.student) == parseInt(this.user.user_id))
        })
        console.log(this.signedOffList)
        this.loadSignedOff2Data();
    }, (err) => {
        console.log("there is an error while get signed off data");
    });
  }

  async loadSignedOff2Data() {
    this.signedOff2List = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_signedoff2.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get signed off data");
          return ;
        }
        this.signedOff2List = resp.data.filter(item => {
          return (parseInt(item.provider) == parseInt(this.user.provider) && 
            parseInt(item.faculty) == parseInt(this.user.faculty) && 
            parseInt(item.student) == parseInt(this.user.user_id))
        })
        console.log(this.signedOff2List)
        this.loadUnitElementData();
    }, (err) => {
        console.log("there is an error while get signed off data");
    });
  }

	selectFileToUpload(event, idx) : void {
     this._IMAGES
     .handleImageSelection(event)
     .subscribe((res) => {
        // Retrieve the file type from the base64 data URI string
        const _SUFFIX  = res.split(':')[1].split('/')[1].split(";")[0];

        if(this._IMAGES.isCorrectFileType(_SUFFIX)) {
           const imgURL = this.global.todayString();

           if(idx == 1) {
							this.photo1 = {
	             ext: _SUFFIX,
	             data: res,
	             name: imgURL + "." + _SUFFIX
	           };
           } else {
           		this.photo2 = {
	             ext: _SUFFIX,
	             data: res,
	             name: imgURL + "." + _SUFFIX
	            };
           }
        } else {
           this.global.displayAlert('You need to select an image file with one of the following types: jpg, gif or png');
        }
     }, (error) => {
        console.dir(error);
        console.log(error.message);
     });
  }

	async doUploadImage(bReturn = false) {
		let imageList = [];
		if(this.photo1 && this.photo1.data) {
			imageList.push(this.photo1)
		}
		if(this.photo2 && this.photo2.data) {
			imageList.push(this.photo2)
		}

		if(imageList.length < 1) {
			this.saveData();
			return ;
		}
    let n = 0;
    let uploadLoading = await this.loadingController.create({
      message: 'Uploading images...',
    });
    await uploadLoading.present();
    for(let i=0;i<imageList.length;i++) {

       this._IMAGES
       .uploadImageSelection(imageList[i].data,
                             imageList[i].name)
       .subscribe((res) =>
       {
          if(n>=imageList.length - 1) {
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

  saveNotePhoto() {
  	this.doUploadImage();
  }

	async saveData(bReturn = false) {
      let data = {
          list_id: this.currentSignoffItem.list_id,
          photo1: this.photo1 ? this.photo1.name : "",
          photo2: this.photo2 ? this.photo2.name : "",
          tutor_notes: this.tutor_notes
      };
      
      let url = "https://www.artisanideas.co.nz/api/app-rentice/update_requestlist_photo_note.php";
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
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error while save your entry on inventory table.");
      });
  }

  async changeStatus(slidingItem: IonItemSliding, item, status) {
      console.log(item);
      console.log(status);
      if(slidingItem) 
        slidingItem.close();

      const data = {
          list_id: item.list_id,
          status: status
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_rowstatus.php";
      const loading = await this.loadingController.create({
        message: 'Updating status...',
      });
      await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error == true) {
              this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
              return ;
          }
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when save status. Please try again later.");
      });
  }

  selectAll(item) {
    console.log(item)
    this.global.currentUnit_Element = item;
    this.global.currentElement = null;
    this.global.currentUnit = item.unit;
    this.global.currentElementList = item.element;
    this.router.navigateByUrl('/signoff-qual-update');
  }

  goUpdatePage(item, subitem) {
    if(this.isReadonly) {
      return ;
    }
    this.global.currentUnit_Element = item;
    this.global.currentUnit = item.unit;
    this.global.currentElement = subitem;
    this.global.currentElementList = [];
    this.router.navigateByUrl('/signoff-qual-update');
  }

  async exportPDF() {
    if(this.isReadonly) {
      this.createPdf();
    } else {
      const alert = await this.alertController.create({
        header: 'Alert',
        message: 'Mark as Completed',
        buttons: [
          {
            text: 'NO',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
              this.createPdf()
            }
          }, {
            text: 'YES',
            handler: () => {
              console.log('Confirm Okay');
              this.saveContinue(2, 1);
            }
          }
        ]
      });
      await alert.present();
    }
  }

  async createPdf() {
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    this.pdf.setFontSize(13)
    /*this.pdf.text(10, 20, "Trainee Name: " + this.user.user_firstname + " " + this.user.user_lastname);
    this.pdf.text(10, 35, "Qualification: " + this.qualName);
    this.pdf.text(10, 50, "Assessor: " + this.user.tutorName);
    this.pdf.text(10, 65, "Assessor: " + this.data.date);
    const wrap_notes = this.pdf.splitTextToSize('Notes: ' + this.data.notes, 400, {});
    this.pdf.text(10, 80, wrap_notes);*/
    this.pdf.text(10, 20, "Assessor Name: " + this.user.user_firstname + " " + this.user.user_lastname);
    this.pdf.text(10, 35, "Qualification: " + this.qualName);
    this.pdf.text(10, 50, "Date: " + this.currentSignoffItem.created.substr(0, 10));
    this.pdf.text(10, 65, "Signoff Status: " + this.currentSignoffItem.status);
    const wrap_notes = this.pdf.splitTextToSize('Notes: ' + this.currentSignoffItem.notes, 400, {});
    this.pdf.text(10, 80, wrap_notes);

    this.pdf.setFontSize(14)
    this.pdf.text(10, 120, "Qualification");
    this.pdf.setFontSize(11)
    let yPos = 140;
    let cnt = 0;
    this.unitSummary.forEach(item => {
      let wrap_notes = this.pdf.splitTextToSize(item.unit.unit + " - " + item.unit.name, 400, {});
      this.pdf.text(10, yPos, wrap_notes)
      yPos += 20;
      item.element.forEach(ele => {
        let wrap_notes = this.pdf.splitTextToSize(ele.name, 390, {});
        this.pdf.text(25, yPos, wrap_notes)
        yPos += 20;
      })
      cnt++;
      if(cnt % 30==0) {
        this.pdf.addPage();
      }
    })
    this.pdf.addPage();
    this.pdf.setFontSize(14)
    this.pdf.text(10, 30, "Record of Work Entries");
    this.pdf.setFontType("normal")
    this.pdf.setFontSize(11)
    this.saveList = _.cloneDeep(this.recordWorkList);

    this.pdfListCnt = 0;
    this.saveLoading = await this.loadingController.create({
      message: this.translate.instant('Exporting as PDF...'),
    });
    await this.saveLoading.present();

    this.addPdfRecordWork();
  }

  addPdfRecordWork() {
    if(this.saveList.length < 1) {
      this.saveLoading.dismiss()

      let pdfName = "Signoff_Summary_" + new Date().getTime() + ".pdf";
      if(this.global.isCordova) {
        let pdfOutput = this.pdf.output();
        this.global.exportPDFCordova(pdfOutput, pdfName);
      } else {
        this.pdf.save(pdfName);
      }
      return ;
    }
    const record = this.saveList[0];
    if(record.photo.length > 0) {
      this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + record.photo, (dataUrl) => {
          if(dataUrl != null && dataUrl.indexOf("data:image") > -1) {
            if(this.pdfListCnt == 0) {
                this.yPos = 70;
            } else if(this.pdfListCnt > 4) {
                if(this.pdfListCnt % 5 == 0) {
                  this.pdf.addPage()
                  this.yPos = 30;
                }
            }
            this.pdf.addImage(dataUrl, "JPG", 10, this.yPos, 100, 75);
            this.pdf.text(120, this.yPos + 5, record.mainCat);
            this.pdf.text(120, this.yPos + 17, record.sub);
            let activity = [];
            activity.push(record.activity)
            if(record.activity2.length>0) 
              activity.push(record.activity2)
            if(record.activity3.length>0) 
              activity.push(record.activity3)
            this.pdf.text(120, this.yPos + 29, activity.join(",") );
            this.pdf.text(120, this.yPos + 41, record.address );
            this.pdf.text(120, this.yPos + 53, record.created );
            this.pdf.text(120, this.yPos + 65, record.notes );
            this.yPos += 90;
          }

          this.pdfListCnt++;
          this.saveList.shift();
          this.addPdfRecordWork();
        });
    } else {
        if(this.pdfListCnt == 0) {
            this.yPos = 70;
        } else if(this.pdfListCnt > 4) {
            if(this.pdfListCnt % 5 == 0) {
              this.pdf.addPage()
              this.yPos = 30;
            }
        }
        this.pdf.addImage(placeholderImg, "JPG", 10, this.yPos, 105, 75);
        this.pdf.text(120, this.yPos + 5, record.mainCat);
        this.pdf.text(120, this.yPos + 17, record.sub);
        let activity = [];
        activity.push(record.activity)
        if(record.activity2.length>0) 
          activity.push(record.activity2)
        if(record.activity3.length>0) 
          activity.push(record.activity3)
        this.pdf.text(120, this.yPos + 29, activity.join(",") );
        this.pdf.text(120, this.yPos + 41, record.address );
        this.pdf.text(120, this.yPos + 53, record.created );
        this.pdf.text(120, this.yPos + 65, record.notes );
        this.yPos += 90;

        this.pdfListCnt++;
        this.saveList.shift();
        this.addPdfRecordWork();
    }
  }

  async saveContinue(status = 0, bExport = 0, bLeave = false) {
    this.saveList = [];
    this.recordWorkList.forEach(row => {
      let flag = true;
      for(let i=0;i<this.existedList.length;i++) {
        if(row.list_id == this.existedList[i].row_entry && status == this.existedList[i].status) {
          flag = false;
          break;
        }
      }
      if(flag) {
        this.saveList.push(row);
      }
    })
    console.log(this.saveList);
    this.saveLoading = await this.loadingController.create({
      message: 'Saving Data'
    })
    await this.saveLoading.present()
    this.saveRecordWork(status, bExport, bLeave);
  }

  saveRecordWork(status, bExport, bLeave) {
    if(this.saveList.length < 1) {
      let saveList = []
      this.saveList = [];
      this.unitSummary.forEach(item => {
        let flag = true;
        for(let i=0;i<this.existedList.length;i++) {
          if(item.unit.signedoff_id == this.existedList[i].unit && status == this.existedList[i].status) {
            flag = false;
            break;
          }
        }
        if(flag) {
          saveList.push(item.unit)
        }

        item.element.forEach(ele => {
          flag = true
          for(let i=0;i<this.existedList.length;i++) {
            if(ele.signedoff_id == this.existedList[i].unit && ele.signedoff2_id == this.existedList[i].element && status == this.existedList[i].status) {
              flag = false;
              break;
            }
          }

          if(flag) {
            saveList.push(ele)
          }
        })
      })
      console.log(saveList)
      this.saveList = saveList;
      this.saveQualData(status, bExport, bLeave)
      return ;
    }

    const record = this.saveList[0];
    let funcList = [];
    let url = "https://www.artisanideas.co.nz/api/app-rentice/add_request_item.php";
    let data = {
      request_no: this.currentSignoffItem.list_id,
      row_entry: record.list_id,
      unit: '',
      element: '',
      status: status
    };
    funcList.push(this.http.post(url, data));

    let data1 = {
        list_id: record.list_id,
        status: 'Assessor Checked'
    };
    
    url = "https://www.artisanideas.co.nz/api/app-rentice/update_rowstatus.php";
    funcList.push(this.http.post(url, data1));

    forkJoin(funcList).subscribe(data => {
        this.saveList.shift()
        this.saveRecordWork(status, bExport, bLeave);
    }, err => {
        this.saveLoading.dismiss();
        this.global.displayAlert("There is an error when update information.");
    });
  }

  saveQualData(status, bExport, bLeave) {
    if(this.saveList.length < 1) {
      this.saveLoading.dismiss();

      this.isReadonly = false;

      switch (status) {
        case 0:
          this.currentSignoffItem.status = "In Progress";
          this.isReadonly = true;
          break;
        case 1:
          this.currentSignoffItem.status = "Sent";
          break;
        case 2:
          this.currentSignoffItem.status = "Completed";
          this.isReadonly = true;
          break;
        case 3:
          this.currentSignoffItem.status = "In Review";
          break;
        default:
          break;
      }
      
      localStorage.setItem("currentSignoffItem", JSON.stringify(this.currentSignoffItem))
      this.currentStatus = status;

      this.loadRequestItemData();

      if(status != 0) {
        this.updateRequestListStatus(bLeave, bExport);
      } else {
        if(bLeave) {
          this.router.navigateByUrl("/signoff")
        }
      }
      return ;
    }

    const record = this.saveList[0];
    let funcList = [];
    let url = "https://www.artisanideas.co.nz/api/app-rentice/add_request_item.php";
    let data = {
      request_no: this.currentSignoffItem.list_id,
      row_entry: '',
      unit: record.signedoff_id,
      element: record.element ? record.signedoff2_id: '',
      status: status
    };
    funcList.push(this.http.post(url, data));

    if(record.element) {
      if(record.status == "Finished") {
          let data1 = {
              list_id: record.signedoff2_id,
              status: 'Completed'
          };
          url = "https://www.artisanideas.co.nz/api/app-rentice/update_signedoff2.php";
          funcList.push(this.http.post(url, data1));
      }
    } else {
      if(record.hasAllElement) {
        let data1 = {
            list_id: record.signedoff_id,
            status: 'Completed'
        };
        url = "https://www.artisanideas.co.nz/api/app-rentice/update_signedoff.php";
        funcList.push(this.http.post(url, data1));
      }
    }
    
    forkJoin(funcList).subscribe(data => {
        this.saveList.shift()
        this.saveQualData(status, bExport, bLeave);
    }, err => {
        this.saveLoading.dismiss();
        this.global.displayAlert("There is an error when update information.");
    });
  }

  async updateRequestListStatus(bLeave = false, bExport) {
    let data = {
      list_id: this.currentSignoffItem.list_id,
      status: 'Completed'
    };
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();

    let url = "https://www.artisanideas.co.nz/api/app-rentice/update_request_list.php";
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss()
        console.log(resp);

        if(bExport) {
          this.createPdf();
        }
        if(bLeave) {
          this.router.navigateByUrl("/signoff")
        }
    }, (err) => {
        loading.dismiss()
        if(bExport) {
          this.createPdf();
        }
        console.log(err)
        if(bLeave) {
          this.router.navigateByUrl("/signoff")
        }
    });
  }

  async notifyUser() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Completing the sign off will notify the trainee and you will no longer be able to edit items.',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'YES',
          handler: async () => {
            console.log('Confirm Okay');
            let data = {
              user_id: this.user.tutor
            };
            const loading = await this.loadingController.create({
              message: '',
            });
            await loading.present();

            setTimeout(() => {
              loading.dismiss();
              this.saveContinue(2);
            }, 5000)
            let url = "https://www.artisanideas.co.nz/api/app-rentice/notify_requestreview.php";
            this.http.post(url, data).subscribe((resp: any) => {
                loading.dismiss()
                console.log(resp);
            }, (err) => {
                loading.dismiss()
                console.log(err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async returnPage() {
    if(this.isReadonly) {
      this.router.navigateByUrl("/signoff")
      return ;
    }
    const alert = await this.alertController.create({
        header: 'Alert',
        message: 'You are leaving page, do you want save before leave page?',
        buttons: [
          {
            text: 'NO',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              this.router.navigateByUrl("/signoff")
            }
          }, {
            text: 'YES',
            handler: () => {
              this.saveContinue(2, 0, true)
            }
          }
        ]
      });
      await alert.present();
  }
}
