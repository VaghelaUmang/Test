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
import { GlobalProvider } from '../services/global-provider';
import { IonItemSliding } from '@ionic/angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var ga;
declare var window;

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.page.html',
  styleUrls: ['./to-do-list.page.scss'],
})
export class ToDoListPage implements OnInit {

	data: any = {};
	user: any = {};
	bLoadTodolist: any;
	todoList: any = [];
	totalCount: any = 0;
	AllTodoList: any = [];

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              private ga: GoogleAnalytics,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'To Do List');
      } else {
        if(this.ga) {
          this.ga.trackView('To Do List');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
  	console.log("==to do list page===");
  	this.user = JSON.parse(localStorage.getItem("user"));

    this.infiniteScroll.disabled = false;
    this.loadUserData();
    this.data.status = 'All';

		this.bLoadTodolist = JSON.parse(localStorage.getItem("bLoadTodolist"));
    if(this.bLoadTodolist == true || this.bLoadTodolist == 'true' || this.bLoadTodolist == '1') {
        this.bLoadTodolist = false;
        localStorage.removeItem("bLoadTodolist")
        this.loadTodolist();
        return ;
    }

    this.loadTodolist();
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

	async loadTodolist() {
      console.log(this.data);

      this.todoList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_todolist_by_user.php?user_id=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
      		loading.dismiss();
          console.log(resp.data);
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get todo list.");
              return ;
          }
          
          this.AllTodoList = resp.data;
          this.totalCount = this.AllTodoList.length;
          //$rootScope.todolistCnt = this.totalCount;
          this.infiniteScroll.disabled = false;
          if(this.totalCount > 10) {
              this.todoList = this.AllTodoList.slice(0, 10);
          } else {
              this.todoList = this.AllTodoList;
          }
          
          const now: any = new Date();
          window.localStorage.setItem("todolistDate", now.getTime());
          const data = JSON.stringify(this.todoList);
          window.localStorage.setItem("todolist", data);
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get todo list.");
      }); 
  }

	loadMore(event) {
    //Load More 10 items
    if(this.todoList === null || this.todoList === undefined) {
        return ;
    }
    var nCount = this.todoList.length;
    var moreList = [];
    if(nCount+10>this.totalCount) {
        var n = this.totalCount - nCount;
        moreList = this.AllTodoList.slice(nCount, nCount+n);
    } else {
        moreList = this.AllTodoList.slice(nCount, nCount+10);
    }
    
    this.todoList = this.todoList.concat(moreList);
    this.infiniteScroll.disabled = false;
    if(this.todoList.length >= this.totalCount) {
        this.infiniteScroll.disabled = true;
    }
    event.target.complete();
  }

  goTodoItem(slidingItem: IonItemSliding, item) {
      if(slidingItem)
        slidingItem.close();
      localStorage.setItem("currentTodolist", JSON.stringify(item));
    	console.log(item);  
     	this.router.navigateByUrl('/view-to-do-list');
  }

  async changeStatus(slidingItem: IonItemSliding, item, flag) {
      console.log(item);
      console.log(flag);
      slidingItem.close();
      const data = {
          id: item.id.toString(),
          list_name: item.list_name,
          project_no: item.project_no,
          date1: item.date1,
          date2: item.date2,
          status: flag ? "Completed": "In Progress",
          notes1: item.notes1,
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/update_todolist.php";
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
          this.loadTodolist();
          /*this.alertController.create({
            this.translate.instant('Success'),
            message: 'Todo list has been updated.',
            buttons: [{
                text: 'Okay',
                handler: () => {
                  this.loadTodolist();
                }
              }
            ]
          }).then((alert) => {
            alert.present();
          });*/
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("Sorry we could not upload your entry, please try again later.");
      });
  }
}
