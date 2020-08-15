import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

import { GlobalProvider } from '../../services/global-provider';

@Component({
  selector: 'app-view-to-do-list',
  templateUrl: './view-to-do-list.page.html',
  styleUrls: ['./view-to-do-list.page.scss'],
})
export class ViewToDoListPage implements OnInit {

	data: any = {};
	user: any = {};
	currentTodolist: any = [];
	currentlist_no: any;
	listname: any;
	listitemList: any = [];

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
		console.log("==enter new todo list page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

  	this.currentTodolist = JSON.parse(localStorage.getItem("currentTodolist"));
    this.currentlist_no = this.currentTodolist.list_no;
    console.log(this.currentTodolist);
    this.listname = this.currentTodolist.list_name;
    this.data = {};
    this.data.status = 'All';
    this.loadUserData();
    this.loadListItems();
 	}

 	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

  statusFilter(item) {
    console.log(item.status);
    return this.data.status == 'All' || item.status == this.data.status
  }

  async loadListItems() {
      console.log(this.data);

      this.listitemList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_listitems_by_user.php?list_no=" + this.currentTodolist.list_no + "&user_id=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
      		loading.dismiss();
          if(resp.error === true) {
              this.global.displayAlert("There is an error when get todo list.");
              return ;
          }
          
          this.listitemList = resp.data;
          localStorage.setItem("listitemCnt", this.listitemList.length)
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get todo list.");
      }); 
  }

 	goListItemDetail(slidingItem: IonItemSliding, item) {
    if(slidingItem)
      slidingItem.close();
    localStorage.setItem("currentListItem", JSON.stringify(item));
  	console.log(item);  
   	this.router.navigateByUrl('/edit-to-do-list-item');
  }

  async changeStatus(slidingItem: IonItemSliding, item, flag) {
      console.log(item);
      console.log(flag);
      slidingItem.close();
      let data = {
          id: item.id.toString(),
          item_name: item.item_name,
          room: item.room,
          room2: item.room2,
          assigned: item.assigned,
          date1: item.date1,
          date2: item.date2,
          status: flag ? "Completed": "In Progress",
          notes1: item.notes1,
          notes2: item.notes2,
      };
  
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_listitem.php";
      const loading = await this.loadingController.create({
        message: '',
      });
      await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
          loading.dismiss();
          if(resp.error === true) {
              this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
              return ;
          }
          this.loadListItems();
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
      });
  }
}
