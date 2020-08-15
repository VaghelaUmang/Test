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
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { GlobalProvider } from '../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

declare var ga;
declare var window;

@Component({
  selector: 'app-tool-register',
  templateUrl: './tool-register.page.html',
  styleUrls: ['./tool-register.page.scss'],
})
export class ToolRegisterPage implements OnInit {

	data: any = {};
	user: any = {};
	bLoadTool: any;
	toolList: any = [];
	AllToolList: any = [];
	totalCount: any = 0;

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
              private ga: GoogleAnalytics,
              public global: GlobalProvider,
              private translate: TranslateService,
  						private router: Router) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    try {
      if(!window.device) {
        window.ga('send', 'pageview', 'Tool Register');
      } else {
        if(this.ga) {
          this.ga.trackView('Tool Register');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
  	console.log("==tool register page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);
    this.infiniteScroll.disabled = false;
    this.loadUserData();
    
    this.bLoadTool = JSON.parse(localStorage.getItem("bLoadTool"));
    if(this.bLoadTool == true || this.bLoadTool == 'true' || this.bLoadTool == '1') {
        this.bLoadTool = false;
        localStorage.removeItem("bLoadTool")
        this.loadTenTool();
        return ;
    }

    let date: any = window.localStorage.getItem("toolDate");
    let bReload = false;
    
    if(date === null || date === undefined || date === "") {
        bReload = true;
    } else {
        let now = new Date();
        let timeDiff = Math.abs(date - now.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if(diffDays > 1) {
            bReload = true;
        }
    }
    
    if(bReload === false) {
        let data = window.localStorage.getItem("tool");
        let toolList = [];
        try {
            toolList = JSON.parse(data);
        } catch(e) {
            toolList = [];
        }
        this.toolList = toolList;

        return ;
    }
    
    this.loadTenTool();
  }

 	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

	async loadTenTool() {
      console.log(this.data);

      this.toolList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_tools_by_user.php?user_id=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          console.log(resp.data);
          if(resp.error === true) {
              this.global.displayAlert('There is an error when get tool.')
              return ;
          }
          
          this.AllToolList = resp.data;
          this.totalCount = this.AllToolList.length;
          this.infiniteScroll.disabled = false;
          if(this.totalCount > 10) {
              this.toolList = this.AllToolList.slice(0, 10);
          } else {
              this.toolList = this.AllToolList;
          }
          
          let now: any = new Date();
          window.localStorage.setItem("toolDate", now.getTime());
          let data = JSON.stringify(this.toolList);
          window.localStorage.setItem("tool", data);
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when get tool.')
      }); 
    }
    
    loadMore(event) {
        //Load More 10 items
        if(this.toolList == null || this.toolList == undefined) {
            return ;
        }
        let nCount = this.toolList.length;
        let moreList = [];
        if(nCount+10>this.totalCount) {
            let n = this.totalCount - nCount;
            moreList = this.AllToolList.slice(nCount, nCount+n);
        } else {
            moreList = this.AllToolList.slice(nCount, nCount+10);
        }
        
        this.toolList = this.toolList.concat(moreList);
        this.infiniteScroll.disabled = false;
        if(this.toolList.length >= this.totalCount) {
            this.infiniteScroll.disabled = true;
        }
        event.target.complete();
    }

    goToolItem(item) {
      console.log(item);
      localStorage.setItem("currentTool", JSON.stringify(item));
      this.router.navigateByUrl('/view-tool');
    }
}
