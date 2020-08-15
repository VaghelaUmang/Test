import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { GlobalProvider } from '../../services/global-provider';

@Component({
  selector: 'app-view-tutor-unit-standard-table',
  templateUrl: './view-tutor-unit-standard-table.page.html',
  styleUrls: ['./view-tutor-unit-standard-table.page.scss'],
})
export class ViewTutorUnitStandardTablePage implements OnInit {

	data: any = {};
	user: any = {};
	currentStaff: any = {};
	inventoryList: any = [];
	AllInventoryList: any = [];
	totalCount: any = 0;
	mainCategoryList: any = [];
  subCategoryList: any = [];
  allSubCategoryList: any = [];

  tableHtml: string = '';

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
  	console.log("==view tutor student table page===");
  	this.user = JSON.parse(localStorage.getItem("currentTutorItem"));
  	console.log(this.user);
		this.loadTableData();
  }

 	loadTableData() {
   console.log(this.global.tutorUnitStandardStudentLogList);
    this.tableHtml = '<thead><tr>\
        <th class="photo">Photo1</th>\
        <th class="photo">Photo2</th>\
        <th class="photo">Photo3</th>\
        <th>Category/Activity</th>\
        <th>Notes</th>\
        <th>Address/Projects</th>\
        <th>Hours</th>\
        <th>Date</th>\
      </tr></thead><tbody>';
    if(!this.global.tutorUnitStandardStudentLogList) {
      return ;
    }
    if(this.global.tutorUnitStandardStudentLogList.length < 1) {
      return ;
    }
    this.global.tutorUnitStandardStudentLogList.forEach(tableItem => {

      let mainCat = "";
      this.mainCategoryList.forEach((item) => {
        if(item.cat == tableItem.main_category) {
          mainCat = item.name;
          return ;
        }
      });
      let subCat = "";
      this.subCategoryList.forEach((item) => {
        if(item.list_id == tableItem.sub_category) {
          subCat = item.name;
          return ;
        }
      });

      this.tableHtml += '<tr>';
      let dataUrl = '';
      if(tableItem.inventory_image.length > 0) {
        dataUrl = 'https://www.artisanideas.co.nz/itab/database/styled/' + tableItem.inventory_image;
        this.tableHtml += '<td><img style="min-width:80px" src="' + dataUrl + '" /></td>';
      } else {
        this.tableHtml += '<td></td>';
      }
      if(tableItem.inventory_image2 && tableItem.inventory_image2.length > 0) {
        dataUrl = 'https://www.artisanideas.co.nz/itab/database/styled/' + tableItem.inventory_image2;
        this.tableHtml += '<td><img style="min-width:80px" src="' + dataUrl + '" /></td>';
      } else {
        this.tableHtml += '<td></td>';
      }

      if(tableItem.inventory_image3 && tableItem.inventory_image3.length > 0) {
        dataUrl = 'https://www.artisanideas.co.nz/itab/database/styled/' + tableItem.inventory_image3;
        this.tableHtml += '<td><img style="min-width:80px" src="' + dataUrl + '" /></td>';
      } else {
        this.tableHtml += '<td></td>';
      }

      this.tableHtml += '<td><div>' + mainCat + '</div><div>' + subCat + '</div><div>';
      this.tableHtml += tableItem.inventory_item + '</div><div>' + tableItem.inventory_item2 + '</div><div>';
      this.tableHtml += tableItem.inventory_item3 + '</div><div></div><div></div></td>';
      this.tableHtml += '<td>' + tableItem.notes.replace(/(\r\n|\n|\r)/gm," ") + '</td>';
      this.tableHtml += '<td>' + tableItem.address + '</td>';
      this.tableHtml += '<td>' + tableItem.inventory_value + '</td>';
      this.tableHtml += '<td>' + tableItem.inventory_purchased + '</td>';
      this.tableHtml += '</tr>';
    });
  }

}
