import { Component, OnInit } from '@angular/core';
import { GlobalProvider } from '../../services/global-provider';

@Component({
  selector: 'app-student-log-table',
  templateUrl: './student-log-table.page.html',
  styleUrls: ['./student-log-table.page.scss'],
})
export class StudentLogTablePage implements OnInit {

	mainCategoryList: any = [];
  subCategoryList: any = [];
  tableHtml: string = '';

  constructor(public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==view student log table page===");
		this.loadTableData();
  }

 	loadTableData() {
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
    if(!this.global.tutorStudentLog) {
      return ;
    }
    if(this.global.tutorStudentLog.length < 1) {
      return ;
    }
    this.global.tutorStudentLog.forEach(tableItem => {

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
