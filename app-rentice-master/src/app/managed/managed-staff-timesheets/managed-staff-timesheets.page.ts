import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as _ from 'lodash';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import {
    File
} from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

import { GlobalProvider } from '../../services/global-provider';

declare var window;


@Component({
    selector: 'app-managed-staff-timesheets',
    templateUrl: './managed-staff-timesheets.page.html',
    styleUrls: ['./managed-staff-timesheets.page.scss'],
})
export class ManagedStaffTimesheetsPage implements OnInit {

    data: any = {};
    user: any = {};
    timesheetList: any = [];
    addressList: any = [];
    AllTimesheetList: any = [];
    totalCount: any = 0;
    logOb: any;
    exportList: any = [];
    pdf: any;
    exportLoading: any;

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    constructor(private platform: Platform,
        public alertController: AlertController,
        public loadingController: LoadingController,
        private http: HttpClient,
        private router: Router,
        public file: File,
        private emailComposer: EmailComposer,
        private socialSharing: SocialSharing,
        public global: GlobalProvider) { }

    ngOnInit() {
    }

    async exportPDF() {
        this.pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
        this.exportLoading = await this.loadingController.create({
            message: 'Exporting as PDF...',
        });
        await this.exportLoading.present();
        this.doExport(true);
    }

    exportPDFCordova(pdfOutput, pdfName) {
        // using ArrayBuffer will allow you to put image inside PDF
        let buffer = new ArrayBuffer(pdfOutput.length);
        let array = new Uint8Array(buffer);
        for (var i = 0; i < pdfOutput.length; i++) {
            array[i] = pdfOutput.charCodeAt(i);
        }

        let directory = '';
        // For this, you have to use ionic native file plugin
        //const directory = this.file.externalApplicationStorageDirectory ;

        if (this.platform.is('android') == true) {
            directory = this.file.externalDataDirectory;
        } else {
            directory = this.file.dataDirectory;
        }

        const fileName = pdfName;

        this.file.writeFile(directory, fileName, buffer)
            .then((success) => {
                console.log("File created Succesfully" + JSON.stringify(success));
                this.socialSharing.share("This is Timesheet Pdf file for sharing", "timesheet pdf", directory + fileName, null);
            })
            .catch((error) => {
                console.log("Cannot Create File " + JSON.stringify(error))
                this.global.displayAlert("Cannot create pdf file.");
            });
    }

    doExport(flag = false) {
        if (this.exportList.length < 1) {
            this.exportLoading.dismiss();
            let pdfName = "timesheet_" + new Date().getTime() + ".pdf";
            if (this.global.isCordova) {
                let pdfOutput = this.pdf.output();
                this.exportPDFCordova(pdfOutput, pdfName);
            } else {
                this.pdf.save(pdfName);
            }
            return;
        }
        if (flag != true) {
            this.pdf.addPage();
        }
        let pdfItem = this.exportList[0];
        let mainCat = "";
        this.global.allMaincategoryList.forEach((item) => {
            if (item.cat == pdfItem.main_category) {
                mainCat = item.name;
                return;
            }
        });
        let subCat = "";
        this.global.allSubcategoryList.forEach((item) => {
            if (item.list_id == pdfItem.sub_category) {
                subCat = item.name;
                return;
            }
        });

        this.pdf.text('Main Category: ' + mainCat, 10, 10)
        this.pdf.text('Sub Category: ' + subCat, 10, 20)
        this.pdf.text('Activity: ' + pdfItem.activity, 10, 30)
        this.pdf.text('Project: ' + pdfItem.address, 10, 40)
        this.pdf.text('Hours: ' + pdfItem.hours, 10, 50)
        this.pdf.text('Notes: ' + pdfItem.notes, 10, 60)
        this.pdf.text('Start Time: ' + pdfItem.starttime, 10, 75)
        this.pdf.text('Finish Time: ' + pdfItem.finishtime, 10, 85)
        this.pdf.text('Date: ' + pdfItem.date, 10, 95)

        let imageList = [];
        if (pdfItem.image && pdfItem.image.length > 0) {
            imageList.push(pdfItem.image);
        }
        if (pdfItem.image2 && pdfItem.image2.length > 0) {
            imageList.push(pdfItem.image2);
        }
        if (pdfItem.image3 && pdfItem.image3.length > 0) {
            imageList.push(pdfItem.image3);
        }

        let n = 0;
        let width = this.pdf.internal.pageSize.getWidth();
        let height = this.pdf.internal.pageSize.getHeight();
        if (imageList.length > 0) {
            for (let i = 0; i < imageList.length; i++) {
                this.global.toDataURL('https://www.artisanideas.co.nz/itab/database/styled/' + imageList[i], (dataUrl) => {
                    //console.log(dataUrl);
                    if (dataUrl != null && dataUrl.indexOf("data:image") > -1) {
                        this.pdf.addPage();
                        this.pdf.addImage(dataUrl, "JPG", 0, 0, width, height);
                    }
                    n++;
                    if (n >= imageList.length) {
                        this.exportList.shift();
                        this.doExport();
                    }
                });
            }
        } else {
            this.exportList.shift();
            this.doExport();
        }
    }

    ionViewWillEnter() {
        console.log("==managed staff time sheet page===");
        this.user = JSON.parse(localStorage.getItem("currentStaff"));
        console.log(this.user);

        let date_to = new Date();
        let date_from = new Date();
        date_from.setDate(date_from.getDate() - 30);
        this.data = {
            user_id: '',
            main_category: '',
            sub_category: '',
            address: [],
            date_from: date_from.toISOString().substr(0, 10),
            date_to: date_to.toISOString().substr(0, 10),
            showDates: false
        };

        this.loadUserData();
        this.getAddress();

        const bloadTimesheet = JSON.parse(localStorage.getItem("bloadTimesheet"));
        if (bloadTimesheet == true || bloadTimesheet == 'true' || bloadTimesheet == '1') {
            localStorage.removeItem("bloadTimesheet")
            this.loadTenTimesheet();
            return;
        }

        this.loadTenTimesheet();
    }

    loadUserData() {
        this.data.tutor = this.user.tutor;
        this.data.user_id = this.user.user_id;
        this.data.faculty = this.user.faculty;
        this.data.provider = this.user.provider;
    }

    async getAddress() {
        const url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
        this.addressList = [];
        const loading = await this.loadingController.create({
            message: '',
        });
        await loading.present();
        this.http.get(url).subscribe((resp: any) => {
            loading.dismiss();
            if (resp.error == true) {
                this.global.displayAlert("There is an error when get tool");
                return;
            }
            this.addressList = resp.data;
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert("There is an error when get tool");
        });
    }

    async loadTenTimesheet() {
        console.log(this.data);
        this.timesheetList = [];
        const url = "https://www.artisanideas.co.nz/api/app-rentice/get_timesheet_by_student.php?student=" + this.data.user_id;
        const loading = await this.loadingController.create({
            message: '',
        });
        await loading.present();
        this.http.get(url).subscribe((resp: any) => {
            loading.dismiss();
            console.log(resp.data);
            if (resp.error == true) {
                this.global.displayAlert("There is an error when get timesheet.");
                return;
            }
            let resultList = [];

            resp.data.forEach((item) => {
                const d = new Date(item.date);
                const date_from = new Date(this.data.date_from);
                const date_to = new Date(this.data.date_to);
                if (d >= date_from && d <= date_to) {
                    resultList.push(item);
                }
            });

            this.AllTimesheetList = resultList;
            this.totalCount = this.AllTimesheetList.length;
            this.infiniteScroll.disabled = true;
            if (this.totalCount > 10) {
                this.timesheetList = this.AllTimesheetList.slice(0, 10);
            } else {
                this.timesheetList = this.AllTimesheetList;
            }

            let now: any = new Date();
            window.localStorage.setItem("timesheetDate", now.getTime());
            let data = JSON.stringify(this.timesheetList);
            window.localStorage.setItem("timesheet", data);
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert("There is an error when get timesheet.");
        });
    }

    async showEntries() {
        console.log(this.data);
        this.timesheetList = [];
        const url = "https://www.artisanideas.co.nz/api/app-rentice/get_timesheet_by_student.php?student=" + this.data.user_id;
        const loading = await this.loadingController.create({
            message: '',
        });
        await loading.present();
        this.http.get(url).subscribe((resp: any) => {
            loading.dismiss();
            if (resp.error == true) {
                this.global.displayAlert("There is an error when get timesheet.");
                return;
            }
            let resultList = [];
            resp.data.forEach((item) => {
                const d = new Date(item.date);
                const date_from = new Date(this.data.date_from);
                const date_to = new Date(this.data.date_to);

                /*if(d>=date_from && d<=date_to && item.address.indexOf(this.data.address) != -1) {
                    resultList.push(item);
                }*/
                if (!this.data.showDates || (d >= date_from && d <= date_to)) {
                    this.data.address.forEach((addr) => {
                        if (item.address.indexOf(addr) != -1) {
                            resultList.push(item);
                        }
                    });
                    if (this.data.address.length < 1) {
                        resultList.push(item);
                    }
                }
            });

            console.log(resultList);
            this.timesheetList = resultList;
            this.infiniteScroll.disabled = true;
            this.exportList = _.cloneDeep(this.timesheetList);
        }, (err) => {
            loading.dismiss();
            this.global.displayAlert("There is an error when get timesheet.");
        });
    }

    loadMore(event) {
        //Load More 10 items
        if (this.timesheetList === null || this.timesheetList === undefined) {
            return;
        }
        let nCount = this.timesheetList.length;
        let moreList = [];
        if (nCount + 10 > this.totalCount) {
            let n = this.totalCount - nCount;
            moreList = this.AllTimesheetList.slice(nCount, nCount + n);
        } else {
            moreList = this.AllTimesheetList.slice(nCount, nCount + 10);
        }

        this.timesheetList = this.timesheetList.concat(moreList);
        this.infiniteScroll.disabled = false;
        if (this.timesheetList.length >= this.totalCount) {
            this.infiniteScroll.disabled = true;
        }
        event.target.complete();
        //this.$broadcast('scroll.infiniteScrollComplete');
    }

    goTimesheetItem(item) {
        console.log(item);
        localStorage.setItem("currentManagedTimesheet", JSON.stringify(item));
        //this.router.navigateByUrl('/edit-ts-entry');
    }

    exportEntries() {
        if (!window.device) {
            this.exportPDF();
            return;
        }
        let dataDir = "";
        if (this.platform.is('android') == true) {
            dataDir = this.file.externalDataDirectory;
        } else {
            dataDir = this.file.dataDirectory;
        }

        let csvName = "managed_timesheet_" + new Date().getTime() + ".csv";
        let csv = 'Date,Address,Start Time,Finish Time,Hours,Notes,\n';
        for (let i = 0; i < this.timesheetList.length; i++) {
            csv += this.timesheetList[i].date + ',';
            csv += this.timesheetList[i].starttime + ',';
            csv += this.timesheetList[i].finishtime + ',';
            csv += this.timesheetList[i].address + ',';
            csv += this.timesheetList[i].hours + ',';
            csv += this.timesheetList[i].notes + ',\n';
        }

        this.file.writeFile(dataDir, csvName, csv, { replace: true })
            .then(() => {
                let subject = 'Export Managed Timesheet';
                /*
                let body = '<html>';
                for(let i = 0;i < this.timesheetList.length;i++) {
                    body += '<div>Date:' + this.timesheetList[i].date + '</div>';
                    body += '<div>StartTime:' + this.timesheetList[i].starttime + '</div>';
                    body += '<div>FinishTime:' + this.timesheetList[i].finishtime + '</div>';
                    body += '<div>Address:' + this.timesheetList[i].address + '</div>';
                    body += '<div>Hours:' + this.timesheetList[i].hours + '</div>';
                    body += '<div>Notes:' + this.timesheetList[i].notes + '</div>';
                    body += '<br/>'
                }
                body += "</html>";*/
                let body = '<html><style>table{font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}td, th {\
                  border: 1px solid #dddddd;\
                  text-align: left;\
                  padding: 8px;\
                }\</style><table>\
                <tr>\
                  <th>Date</th>\
                  <th>Start time</th>\
                  <th>Finish time</th>\
                  <th>Address</th>\
                  <th>Hours</th>\
                  <th>Notes</th>\
                </tr>';
                for(let i = 0;i < this.timesheetList.length;i++) {
                    body += '<tr><td>' + this.timesheetList[i].date + '</td>';
                    body += '<td>' + this.timesheetList[i].starttime + '</td>';
                    body += '<td>' + this.timesheetList[i].finishtime + '</td>';
                    body += '<td>' + this.timesheetList[i].address + '</td>';
                    body += '<td>' + this.timesheetList[i].hours + '</td>';
                    body += '<td>' + this.timesheetList[i].notes + '</td></tr>';
                }
                body += '</table></html>';
                let email = {
                    to: 'artisan80@gmail.com',
                    attachments: [
                        dataDir + csvName
                    ],
                    subject: subject,
                    body: body,
                    isHtml: true
                };
                this.emailComposer.open(email);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    clearFilter() {
        this.data.address = [];
        this.data.showDates = false;
        const date_to = new Date();
        const date_from = new Date();
        date_from.setDate(date_from.getDate() - 30);
        this.data.date_from = date_from.toISOString().substr(0, 10);
        this.data.date_to = date_to.toISOString().substr(0, 10);

        this.showEntries();
    }
}
