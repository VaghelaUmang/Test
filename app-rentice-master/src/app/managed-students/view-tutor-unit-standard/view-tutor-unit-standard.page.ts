import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as jspdf from 'jspdf'; 
import html2canvas from 'html2canvas';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
  File
} from '@ionic-native/file/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { GlobalProvider } from '../../services/global-provider';
declare var ga, window;

@Component({
  selector: 'app-view-tutor-unit-standard',
  templateUrl: './view-tutor-unit-standard.page.html',
  styleUrls: ['./view-tutor-unit-standard.page.scss'],
})
export class ViewTutorUnitStandardPage implements OnInit {

	data: any = {};
	assessor: any = {};

  exportList: any = [];
  pdf: any;
  exportLoading: any;
  photoList: any;
  listCnt: any = 0;
  unitList: any = [];
  unitRenderList: any = [];
  courseList: any = []
  course_code: any;
  noteText: string = '';
  selectedSignedOff: any;
  signedOffList: any = [];
  signedOff2List: any = [];
  elementRenderList: any = [];
  elementList: any = [];
  unitSummary: any = [];

  tableSummaryHtml: string = '';
  exportSummaryList: any = [];
  pdfSummary: any;
  exportSummaryLoading: any;

  qualName: string = '';

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              public file: File,
              private socialSharing: SocialSharing,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
    this.tableSummaryHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Status</th>\
      </tr></thead><tbody>';
  }

  async presentAlertRadio() {
    const alert = await this.alertController.create({
      header: 'Export as PDF',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Just Units',
          value: 'value1',
          checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'Units & Elements',
          value: 'value2'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (value) => {
            console.log(value)
            if(value == 'value1') {
              this.exportPDFUnit(true);
            } else {
              this.exportPDFUnit(false);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async exportPDFUnit(bUnitOnly) {
    this.exportSummaryList = _.cloneDeep(this.unitSummary);
    this.pdf = new jspdf('p', 'px', 'a4'); // A4 size page of PDF
    this.exportLoading = await this.loadingController.create({
      message: 'Exporting as PDF...',
    });
    await this.exportLoading.present();
    this.tableSummaryHtml = '<thead><tr>\
        <th class="photo">Name</th>\
        <th class="photo">Status</th>\
      </tr></thead><tbody>';
    this.photoList = [];
    this.listCnt = 0;
    this.doSummaryExport(bUnitOnly, true);
  }

  doSummaryExport(bUnitOnly, flag = false) {
    if(this.exportSummaryList.length < 1) {
      this.tableSummaryHtml += '</tbody>';

      this.cdRef.detectChanges();

      this.pdf.setFontSize(14);
      this.pdf.text(this.assessor.user_firstname + " " + this.assessor.user_lastname, 26, 22);

      setTimeout(() => {
          this.pdf.autoTable({html: '#my-table8',
            columnStyles: {
              0: {minCellWidth:60, minCellHeight: 35}, 
              1: {minCellWidth:60, minCellHeight: 35}
            },
            didDrawCell: data => {
              if(data.section == 'body' && data.row.index != 0) {
              }
            }
          });
          let pdfName = "trainee_row_summary_" + new Date().getTime() + ".pdf";
          if(this.global.isCordova) {
            let pdfOutput = this.pdf.output();
            this.global.exportPDFCordova(pdfOutput, pdfName);
          } else {
            this.pdf.save(pdfName);
          }

          setTimeout(() => {
            this.exportLoading.dismiss();
          }, 2000)
          return ;
      }, 0);
      
      return ;
    }

    let pdfItem = this.exportSummaryList[0];

    try {
      this.tableSummaryHtml += '<tr>';
      this.tableSummaryHtml += '<td>Unit: ' + pdfItem.unit.unit + " - " + pdfItem.unit.name + '</td>';
      this.tableSummaryHtml += '<td>' + pdfItem.unit.status + '</td>';
      this.tableSummaryHtml += '</tr>';
    } catch(e) {
      this.tableSummaryHtml += '<tr>';
      this.tableSummaryHtml += '<td>Unit:</td>';
      this.tableSummaryHtml += '<td></td>';
      this.tableSummaryHtml += '</tr>';
    }

    if(bUnitOnly == false) {
      pdfItem.element.forEach(item => {
        this.tableSummaryHtml += '<tr>';
        this.tableSummaryHtml += '<td> - ' + item.element + ': ' + item.name + '</td>';
        this.tableSummaryHtml += '<td>' + item.status + '</td>';
        this.tableSummaryHtml += '</tr>';
      })
    }

    this.exportSummaryList.shift();
    this.doSummaryExport(bUnitOnly);
  }

	ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Managed Student Log Search us Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Managed Student Log Search us Page');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
  	console.log("==view tutor student page==");
  	this.assessor = JSON.parse(localStorage.getItem("currentTutorItem"));
  	console.log(this.assessor);

		this.data = {
        course: '',
        unit: '',
		    user_id: '',
        status1: '',
        element: '',
        type: ''
		};

    this.qualName = '';

    this.unitSummary = []
		this.loadUserData();
    //this.loadUnitData();
    this.loadQualData();
    //this.loadElementData();
    this.loadSignedOffData();
  }

 	loadUserData() {
      this.data.tutor = this.assessor.tutor;
      this.data.user_id = this.assessor.user_id;
      this.data.faculty = this.assessor.faculty;
      this.data.provider = this.assessor.provider;
  }

  loadQualData() {
    this.global.allQualList.forEach(item => {
      if(item.list_id == this.assessor.qual) {
        this.qualName = item.name;
      }
    })
    this.courseList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_qual.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get courseList");
          return ;
        }

        this.courseList = resp.data.filter(item => {
          if(item.list_id == this.assessor.qual) {
            this.qualName = item.name;
          }
          return parseInt(item.faculty) == parseInt(this.assessor.faculty)
        })
        console.log(this.courseList)
    }, (err) => {
        console.log("there is an error while get courseList");
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
          return parseInt(item.faculty) == parseInt(this.assessor.faculty)
        })

        this.unitList.forEach(item => {
          item.status = "Not Assessed"
          this.signedOffList.forEach(signedoff => {
            if(item.list_id == signedoff.unit) {
              item.status = signedoff.status
            }
          })
        })
        
        this.unitRenderList = []
        this.unitList.forEach(item => {
          if(item.course_code == this.assessor.qual) {
            this.unitRenderList.push(item)
          }
        })
        console.log("====unit list======")
        console.log(this.unitRenderList)

        this.showSummary();
        this.cdRef.detectChanges();
    }, (err) => {
        loading.dismiss()
        console.log("there is an error while get unitList");
    });
  }

  loadElementData() {
    this.elementList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_elements.php?faculty=" + this.assessor.faculty + "&provider=" + this.assessor.provider;
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
              item.status = signedoff.status
            }
          })
        })
        console.log("====element list======")
        console.log(this.elementList)
        this.loadUnitData();
    }, (err) => {
        console.log("there is an error while get element data");
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
          return (parseInt(item.provider) == parseInt(this.assessor.provider) && 
            parseInt(item.faculty) == parseInt(this.assessor.faculty) && 
            parseInt(item.student) == parseInt(this.assessor.user_id))
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
          return (parseInt(item.provider) == parseInt(this.assessor.provider) && 
            parseInt(item.faculty) == parseInt(this.assessor.faculty) && 
            parseInt(item.student) == parseInt(this.assessor.user_id))
        })
        console.log(this.signedOff2List)
        this.loadElementData();
        //this.loadUnitData();
    }, (err) => {
        loading.dismiss()
        console.log("there is an error while get signed off data");
    });
  }

  changeType() {
    console.log(this.data.type)
    let type = this.data.type == 'theory' ? '1' : '0';
    this.unitRenderList = []
    this.unitList.forEach(item => {
      if(this.data.type == '') {
        if(item.course_code == this.assessor.qual) {
          this.unitRenderList.push(item)
        }
      } else {
        if(item.course_code == this.assessor.qual && item.theory == type) {
          this.unitRenderList.push(item)
        }
      }
    })
    console.log("====unit list======")
    console.log(this.unitRenderList)

    this.showSummary();
    this.changeStatus();
  }

  showSummary() {
    let unitSummary = [];
    console.log(this.data.unit)
    if(this.data.unit == "") {
        this.unitRenderList.forEach(unitItem => {
          let eleList = [];
          this.elementList.forEach(element => {
            if(unitItem.list_id == element.unit) {
              eleList.push(element)
            }
          })
          unitSummary.push({
            unit: unitItem,
            element: eleList
          })
        })
    } else {
        let unitItem;
        this.unitRenderList.forEach(item => {
          if(item.list_id == this.data.unit) {
            unitItem = item;
          }
        })
        let eleList = [];
        this.elementList.forEach(element => {
          if(unitItem.list_id == element.unit) {
            eleList.push(element)
          }
        })
        unitSummary.push({
          unit: unitItem,
          element: eleList
        })
    }

    console.log(unitSummary)
    this.unitSummary = unitSummary;
  }

  changeStatus() {
    if(this.data.status1 == "") {
      return ;
    }
    console.log(this.data.unit)
    this.showSummary();

    let dataList = [];

    if(this.data.unit == "") {
      this.unitSummary.forEach(item => {
        if(item.unit.status == this.data.status1) {
          dataList.push({
            unit: item.unit,
            element: item.element
          })
        }
      })
    } else {
      this.unitSummary.forEach(item => {
        let eleList = []
        if(item.unit.list_id == this.data.unit) {
          item.element.forEach(element => {
            if(this.data.status1 == element.status) {
              eleList.push(element)
            }
          })
          dataList.push({
            unit: item.unit,
            element: eleList
          })
        }
      })
    }

    console.log(dataList)
    this.unitSummary = dataList;
  }

  onNoteTextPressed(event) {

  }

  selectAll(item) {
    console.log(item)
    this.global.currentUnit_Element = item;
    this.global.currentElement = null;
    this.global.currentUnit = item.unit;
    this.global.currentElementList = item.element;
    this.router.navigateByUrl('/view-tutor-unit-standard-update');
  }

  goUpdatePage(item, subitem) {
    this.global.currentUnit_Element = item;
    this.global.currentUnit = item.unit;
    this.global.currentElement = subitem;
    this.global.currentElementList = [];
    this.router.navigateByUrl('/view-tutor-unit-standard-update');
  }

  clearFilter() {
    this.data.course = "";
    this.data.element = "";
    this.data.unit = "";
    this.data.type = "";
    this.noteText = "";
    this.data.status1 = "";

    this.unitRenderList = []
    this.unitList.forEach(item => {
      if(item.course_code == this.assessor.qual) {
        this.unitRenderList.push(item)
      }
    })
    this.showSummary();
  }
}
