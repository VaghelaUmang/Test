import { Component, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Platform, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import * as _ from 'lodash';

declare var window;
declare var navigator;

@Component({
  selector: 'app-view-summary',
  templateUrl: './view-summary.page.html',
  styleUrls: ['./view-summary.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSummaryPage implements OnInit {

	data: any = {};
	user: any = {};
  currentStudent: any = {};
  isCordova: boolean = false;
  resultList: any = [];
  renderList: any = [];

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewDidEnter() {
    this.resultList = [];
    this.global.allMaincategoryList.forEach(mainCat => {
      let nHour = 0;
      this.global.allSubcategoryList.forEach(subCat => {
        if(parseInt(mainCat.cat) == parseInt(subCat.main)) {
          let activities = [];
          this.global.allActivityList.forEach(item => {
            if(parseInt(item.sub_category) == parseInt(subCat.list_id) || 
              parseInt(item.sub_category) == parseInt(subCat.cat)) {
                activities.push(item)
            }
          })

          activities.forEach(item => {
            this.global.allStudentLogList.forEach(data => {
              if(item.name.toLowerCase() == data.inventory_item.toLowerCase() ||
                item.name.toLowerCase() == data.inventory_item2.toLowerCase() ||
                item.name.toLowerCase() == data.inventory_item3.toLowerCase()
                ) {
                nHour += parseFloat(data.inventory_value)
              }
            })
          })
        }
      })

      this.resultList.push({
        cat: mainCat.cat,
        name: mainCat.name,
        hour: nHour
      })
    })
    

    // this.resultList = [];
    // this.global.allMaincategoryList.forEach(item => {
    //   let nHour = 0;
    //   this.global.allStudentLogList.forEach(data => {
    //     if(parseInt(item.cat) == parseInt(data.main_category)) {
    //       nHour += parseFloat(data.inventory_value)
    //     }
    //   })
    //   this.resultList.push({
    //     cat: item.cat,
    //     name: item.name,
    //     hour: nHour
    //   })
    // })
    this.renderList = _.cloneDeep(this.resultList);
    console.log(this.renderList);

    this.cdRef.detectChanges();
  }

  goSubSummary(item) {
    console.log(item);
    localStorage.setItem('mainSummary', JSON.stringify(item));
    this.router.navigateByUrl('/view-summary-sub')
  }

}
