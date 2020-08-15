import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonItemSliding } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Storage } from '@ionic/storage';
import { forkJoin, interval } from 'rxjs';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { placeholderImg } from "../../services/placeholderImg";

declare var window;

@Component({
  selector: 'app-request-summary',
  templateUrl: './request-summary.page.html',
  styleUrls: ['./request-summary.page.scss'],
})
export class RequestSummaryPage implements OnInit {

	data: any = {};
	user: any = {};
	currentRequestItem: any;
	qualName: string = '';
	created: string = '';
	rowstatusList: any = [];
	loading: any;

	signedOffList: any = [];
	signedOff2List: any = [];
	unitRenderList: any = [];
	unitList: any = [];
	elementList: any = [];
	unitSummary: any = [];
	maincategoryList: any = [];

	pdf: any;

	saveList: any = [];
	saveLoading: any;
	pdfListCnt: number = 0;
	yPos: number;

  existedList: any = [];
  isReadonly: boolean = false;
  currentStatus: number = 0;

  isSelfComplete: boolean = false;

  constructor(private platform: Platform,
            private translate: TranslateService,
						public alertController: AlertController,
						public loadingController: LoadingController,
						private http: HttpClient,
						private router: Router,
						private cdRef: ChangeDetectorRef,
            private ga: GoogleAnalytics,
            private storage: Storage,
            public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Request Review List');
      } else {
        if(this.ga) {
          this.ga.trackView('Request Review List');
        }
      }
    } catch(e) {
      console.log(e)
    }

    this.user = JSON.parse(localStorage.getItem("user"));
    this.currentRequestItem = JSON.parse(localStorage.getItem("currentRequestItem"));

    this.data = {
        date: this.currentRequestItem.created.substr(0, 10),
        notes: this.currentRequestItem.notes,
        tutorEmail: '',
        photo1: this.currentRequestItem.photo1,
        photo2: this.currentRequestItem.photo2,
        tutor_notes: this.currentRequestItem.tutor_notes
    };

    this.isReadonly = false;

    switch (this.currentRequestItem.status) {
      case "In Progress":
        this.currentStatus = 0;
        break;
      case "Sent":
        this.currentStatus = 1;
        this.isReadonly = true;
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

    console.log(this.data);
    this.loadUserData()
    this.loadQualData()
    
    this.loadRequestItemData();


    this.isSelfComplete = false;
    this.getListByFaculty();
  }

  loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;

    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_user_by_tutor.php?tutor=" + this.user.tutor;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get tutorname");
          return ;
        }
        
    }, (err) => {
        console.log("there is an error while get tutorname");
    });
  }

  async getListByFaculty() {
      var url = "https://artisanideas.co.nz/api/app-rentice/get_list_by_faculty.php?faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              return ;
          }
          this.global.listByFaculty = resp.list;
          var data = JSON.stringify(this.global.listByFaculty);
          window.localStorage.setItem("listByFaculty", data);
          if(this.global.listByFaculty[0].signoff == 0) {
            this.isSelfComplete = true;
          }
      }, (err) => {
          console.log("There is an error when get list by faculty")
      });
  }

  loadRequestItemData() {
    this.existedList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_request_item.php?request_no=" + this.currentRequestItem.list_id;
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          return ;
        }
        resp.data.forEach(item => {
          if(item.status == this.currentStatus) {
            this.existedList.push(item);
          }
        })
        console.log("==existed request items====")
        console.log(this.existedList)

        this.loadSignedOffData()

        if(this.global.allMaincategoryList.length < 1) {
          this.getAllMainCategory();
        } else {
          this.loadRowStatus()
        }
    }, (err) => {
        this.loadSignedOffData()

        if(this.global.allMaincategoryList.length < 1) {
          this.getAllMainCategory();
        } else {
          this.loadRowStatus()
        }
    });
  }

  loadQualData() {
    this.global.allQualList.forEach(item => {
      if(item.list_id == this.user.qual) {
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
          if(item.list_id == this.user.qual) {
            this.qualName = item.name;
          }
        })
    }, (err) => {
        console.log("there is an error while get courseList");
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
          console.log("there is an error while get tutorname");
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
        	if(item.added == this.user.user_id && item.status == 'Review Requested') {
        		this.rowstatusList.push(item)
        	}
        })

        let rowstatusList = resp.data;

        if(this.currentStatus != 0) {
          this.rowstatusList = [];
        }
        if(this.existedList.length > 0) {
          this.rowstatusList = [];
          this.existedList.forEach(item => {
              for(let i=0;i<rowstatusList.length;i++) {
                if(rowstatusList[i].list_id == item.row_entry) {
                  this.rowstatusList.push(rowstatusList[i]);
                  break;
                }
              }
          })
        }
        console.log("===row status list===")
        console.log(this.rowstatusList)
        this.cdRef.detectChanges();

    }, (err) => {
    		loading.dismiss()
        console.log("there is an error while get tutorname");
    });
  }

  async getAllMainCategory() {
      var url = "https://www.artisanideas.co.nz/api/app-rentice/get_maincategory_by_provider_10.php?provider=" + this.user.provider + "&faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              return ;
          }
          this.maincategoryList = resp.category;

          var now: any = new Date();
          window.localStorage.setItem("mainCategoryDate", now.getTime());
          var data = JSON.stringify(this.maincategoryList);
          window.localStorage.setItem("maincategory", data);
          this.storage.set('mainCategoryDate', now.getTime());
          this.storage.set('maincategory', data);

          this.global.allMaincategoryList = this.maincategoryList;

          this.loadRowStatus();
      }, (err) => {
      });
  }

  async removeFromRowstatus(slidingItem: IonItemSliding, item) {
  	if(slidingItem) 
  		slidingItem.close();
  	console.log(item)
  	this.doRemove(item)
  }

  doRemove (item) {
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
                list_id: item.list_id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_rowstatus.php";
            this.loadingController.create({
				      message: this.translate.instant('Removing...')
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert("There is an error when remove rowstatus.");
                    return ;
                }

                this.loadRowStatus();
            }, (err) => {
                this.loading.dismiss();
						    this.global.displayAlert("There is an error when remove rowstatus.");
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });
  }

  async loadSignedOffData() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.signedOffList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_signedoff.php";
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss()
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
        loading.dismiss()
        console.log("there is an error while get signed off data");
    });
  }

  async loadSignedOff2Data() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.signedOff2List = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_signedoff2.php";
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss()
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
        this.loadElementData();
    }, (err) => {
        loading.dismiss()
        console.log("there is an error while get signed off data");
    });
  }

  async loadUnitData() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    this.unitList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_unit.php";
    this.http.get(url).subscribe((resp: any) => {
        loading.dismiss()
        if(resp.error == true) {
          console.log("there is an error while get unitList");
          return ;
        }

        this.unitList = resp.data.filter(item => {
          return parseInt(item.faculty) == parseInt(this.user.faculty)
        })

        this.unitList.forEach(item => {
          item.status = "Not Assessed"
          this.signedOffList.forEach(signedoff => {
            if(item.list_id == signedoff.unit) {
              item.status = signedoff.status;
              item.signedoff_id = signedoff.list_id;
            }
          })
        })
        
        this.unitRenderList = []
        this.unitList.forEach(item => {
          // if(item.course_code == this.user.qual && (item.status == 'In Progress' || item.status == "Finished")) {
          //   this.unitRenderList.push(item)
          // }

          if(item.course_code == this.user.qual) {
            if(this.currentStatus == 0) {
              if(item.status == 'In Progress' || item.status == "Finished") {
                this.unitRenderList.push(item)
              }
            } else {
              if(item.status == "Completed") {
                this.unitRenderList.push(item)
              }
            }
          }
        })

        if(this.currentStatus != 0) {
          this.unitRenderList = [];
        }
        if(this.existedList.length > 0) {
          let signedOffList = [];
          this.unitRenderList = [];
          this.existedList.forEach(item => {
           for(let i=0;i<this.signedOffList.length;i++) {
             if(item.unit.length > 0 && item.element.length < 1) {
               if(item.unit == this.signedOffList[i].list_id) {
                 signedOffList.push(this.signedOffList[i]);
                 break;
               }
             }
           }
          })

          signedOffList.forEach(item => {
            for(let i=0;i<this.unitList.length;i++) {
               if(item.unit == this.unitList[i].list_id) {
                 this.unitRenderList.push(this.unitList[i])
                 break;
               }
             }
          })

        }
        console.log("====unit list======")
        console.log(this.unitRenderList)

        this.showSummary()
        this.cdRef.detectChanges();
    }, (err) => {
        loading.dismiss()
        console.log("there is an error while get unitList");
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
        this.loadUnitData();
    }, (err) => {
        console.log("there is an error while get element data");
    });
  }

  showSummary() {
    let unitSummary = [];

    this.unitRenderList.forEach(unitItem => {
      let eleList = [];
      let allElementCnt = 0;
      unitItem.hasAllElement = false;
      unitItem.expand = false;
      this.elementList.forEach(element => {
        // if(unitItem.list_id == element.unit && element.status == "Finished") {
        //   eleList.push({
        //     ...element,
        //     signedoff_id: unitItem.signedoff_id
        //   })
        // }
        if(unitItem.list_id == element.unit) {
          allElementCnt++;
          if(this.currentStatus == 0) {
            if(element.status == "Finished") {
              eleList.push({
                ...element,
                signedoff_id: unitItem.signedoff_id
              })
            }
          } else if(this.currentStatus == 1) {
            let flag = false;
            this.existedList.forEach(existItem => {
              if(existItem.element == element.signedoff2_id) {
                flag = true;
              }
            })
            if(flag && element.status == "Finished") {
              eleList.push({
                ...element,
                signedoff_id: unitItem.signedoff_id
              })
            }
          } else {
            let flag = false;
            this.existedList.forEach(existItem => {
              if(existItem.element == element.signedoff2_id) {
                flag = true;
              }
            })
            if(flag && element.status == "Completed") {
              eleList.push({
                ...element,
                signedoff_id: unitItem.signedoff_id
              })
            }
          }
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

    console.log(unitSummary)
    this.unitSummary = unitSummary;

    let saveList = []
    this.unitSummary.forEach(item => {
			saveList.push(item.unit)
			item.element.forEach(ele => {
				saveList.push(ele)
			})
		})
		//console.log(saveList)
  }

  goStudentItem(slidingItem: IonItemSliding, item) {
    if(slidingItem)
        slidingItem.close();
    localStorage.setItem("currentStudent", JSON.stringify(item));
    console.log(item);  
    this.router.navigateByUrl('/request-view-sl-entry');
  }

  goRecordOfWork() {
    this.global.fromRequestPage = true;
    this.router.navigateByUrl('/student-log');
  }

  goQualification() {
    this.global.fromRequestPage = true;
    this.router.navigateByUrl('/search-by-us');
  }

  async saveContinue(status = 0, bExport = 0, bLeave = false) {
  	console.log(this.currentRequestItem)
  	console.log(this.rowstatusList);
  	console.log(this.unitSummary)

    this.saveList = [];
    this.rowstatusList.forEach(row => {
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

    //this.saveList = _.cloneDeep(this.rowstatusList);
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
      request_no: this.currentRequestItem.list_id,
      row_entry: record.list_id,
      unit: '',
      element: '',
      status: status
    };
    funcList.push(this.http.post(url, data));

    if(this.isSelfComplete && status != 0) {
      let data1 = {
          list_id: record.list_id,
          status: 'Self Check'
      };
      
      url = "https://www.artisanideas.co.nz/api/app-rentice/update_rowstatus.php";
      funcList.push(this.http.post(url, data1));    
    } else if( status == 1) {
      let data1 = {
          list_id: record.list_id,
          status: 'Self Check'
      };
      
      url = "https://www.artisanideas.co.nz/api/app-rentice/update_rowstatus.php";
      funcList.push(this.http.post(url, data1));  
    }

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

      switch (status) {
        case 0:
          this.currentRequestItem.status = "In Progress";
          break;
        case 1:
          this.currentRequestItem.status = "Sent";
          this.isReadonly = true;
          break;
        case 2:
          this.currentRequestItem.status = "Completed";
          this.isReadonly = true;
          break;
        case 3:
          this.currentRequestItem.status = "In Review";
          break;
        default:
          break;
      }
      
      localStorage.setItem("currentRequestItem", JSON.stringify(this.currentRequestItem))
      this.currentStatus = status;

      this.loadRequestItemData();

      if(status != 0) {
        this.updateRequestListStatus(status, bLeave, bExport);
      } else {
        if(bLeave) {
          this.router.navigateByUrl("/request-review")
        }
      }
  		return ;
  	}

    const record = this.saveList[0];
    console.log(record)
    let funcList = [];
    let url = "https://www.artisanideas.co.nz/api/app-rentice/add_request_item.php";
    let data = {
      request_no: this.currentRequestItem.list_id,
      row_entry: '',
      unit: record.signedoff_id,
      element: record.element ? record.signedoff2_id: '',
      status: status
    };
    funcList.push(this.http.post(url, data));

    if(this.isSelfComplete && status != 0) {
        if(record.element) {
          let data1 = {
              list_id: record.signedoff2_id,
              status: 'Completed'
          };
          url = "https://www.artisanideas.co.nz/api/app-rentice/update_signedoff2.php";
          funcList.push(this.http.post(url, data1));
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
    } else if( status == 1) {
        if(record.element) {
          let data1 = {
              list_id: record.signedoff2_id,
              status: 'Finished'
          };
          url = "https://www.artisanideas.co.nz/api/app-rentice/update_signedoff2.php";
          funcList.push(this.http.post(url, data1));
        } else {
          if(record.hasAllElement) {
            let data1 = {
                list_id: record.signedoff_id,
                status: 'Finished'
            };
            url = "https://www.artisanideas.co.nz/api/app-rentice/update_signedoff.php";
            funcList.push(this.http.post(url, data1));
          }
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

  async exportPDF_FromHTML() {
    //this.exportList = _.cloneDeep(this.portfolioItemList);
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    
    let self = this;
    this.pdf.fromHTML(window.document.getElementById("request_export"), 15, 15, {
      'width': 320
    }, function(a) {
      let pdfName = "Request_Summary_" + new Date().getTime() + ".pdf";
      if(self.global.isCordova) {
        let pdfOutput = self.pdf.output();
        self.global.exportPDFCordova(pdfOutput, pdfName);
      } else {
        self.pdf.save(pdfName);
      }
    });

    html2canvas(window.document.getElementById("request_export")).then(canvas => {
    		debugger
		    window.document.body.appendChild(canvas)
		});
  }

  async notifyUser() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Notifying the assessor will mark the request as Sent and it can no longer be edited.',
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
              this.saveContinue(1);
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

  async exportPDF() {
    if(this.isReadonly) {
      this.createPdf()
    } else if(this.isSelfComplete) {
      const alert = await this.alertController.create({
        header: 'Mark as Completed',
        message: 'You cannot edit after marking as Completed',
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
    } else {
      const alert = await this.alertController.create({
        header: 'Mark as Sent',
        message: 'You cannot edit after marking as Sent',
        buttons: [
          {
            text: 'NO',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              this.createPdf()
            }
          }, {
            text: 'YES',
            handler: () => {
              this.saveContinue(1, 1);
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
    this.pdf.text(10, 20, "Trainee Name: " + this.user.user_firstname + " " + this.user.user_lastname);
    this.pdf.text(10, 35, "Qualification: " + this.qualName);
    this.pdf.text(10, 50, "Assessor: " + this.user.tutorName);
    this.pdf.text(10, 65, "Date: " + this.data.date);
    let wrap_notes = this.pdf.splitTextToSize('Notes: ' + this.data.notes, 400, {});
    this.pdf.text(10, 80, wrap_notes);

    if(this.currentStatus == 2) {
        wrap_notes = this.pdf.splitTextToSize('Assessor Notes: ' + this.data.tutor_notes, 400, {});
        this.pdf.text(10, 105, wrap_notes);
        let n = 0;
        let photoList = [];
        if(this.currentRequestItem.photo1.length > 0) {
          photoList.push(this.currentRequestItem.photo1)
        }
        if(this.currentRequestItem.photo1.length > 0) {
          photoList.push(this.currentRequestItem.photo2)
        }
        if(photoList.length>0) {
          for(let i=0;i<photoList.length;i++) {
            this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + photoList[i], (dataUrl) => {
              n++;
              this.pdf.addImage(dataUrl, "JPG", 10 + (n-1)*160, 130, 155, 120);
              if(n == photoList.length) {
                this.addPdfQual()
              }
            });
          }
        } else {
          this.addPdfQual()
        }
    } else {
      this.addPdfQual()
    }
  }

  async addPdfQual() {
    let yPos = 140;
    if(this.currentStatus == 2) {
      this.pdf.addPage();
      yPos = 40;
    }
    this.pdf.setFontSize(14)
    this.pdf.text(10, yPos, "Qualification");
    this.pdf.setFontSize(11)
    yPos += 20;
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
    this.saveList = _.cloneDeep(this.rowstatusList);
    console.log(this.saveList)
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

      let pdfName = "Request_Summary_" + new Date().getTime() + ".pdf";
      if(this.global.isCordova) {
        let pdfOutput = this.pdf.output();
        this.global.exportPDFCordova(pdfOutput, pdfName);
      } else {
        this.pdf.save(pdfName);
      }
  		return ;
  	}
  	const record = this.saveList[0];
    console.log(record)
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

  async updateRequestListStatus(status, bLeave, bExport) {
    let data = {
      list_id: this.currentRequestItem.list_id,
      status: status == 1 ? 'Sent' : 'Completed'
    };
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();

    let url = "https://www.artisanideas.co.nz/api/app-rentice/update_request_list.php";
    this.http.post(url, data).subscribe((resp: any) => {
        this.currentStatus = status;
        loading.dismiss()
        if(bExport) {
          this.createPdf();
        }
        if(bLeave) {
          this.router.navigateByUrl("/request-review")
        }
    }, (err) => {
        loading.dismiss()
        console.log(err)
        if(bExport) {
          this.createPdf();
        }
        if(bLeave) {
          this.router.navigateByUrl("/request-review")
        }
    });
  }

  async returnPage() {
    if(this.isReadonly) {
      this.router.navigateByUrl("/request-review")
      return ;
    }
    const alert = await this.alertController.create({
        header: 'Alert',
        message: 'Do you want to leave page?',
        buttons: [
          {
            text: 'NO',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'YES',
            handler: () => {
              this.router.navigateByUrl("/request-review")
              // if(this.isSelfComplete) {
              //   this.saveContinue(2, 0, true)
              // } else {
              //   this.saveContinue(1, 0, true)
              // }
            }
          }
        ]
      });
      await alert.present();
  }
}
