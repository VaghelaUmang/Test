import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { forkJoin, interval } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import * as _ from 'lodash';

import { GlobalProvider } from '../services/global-provider';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {

	data: any = {};
	user: any = {};
  bComplete: boolean = true;
  addressList: any = [];
  orgAddressList: any = [];
  currentProject: any;
  bLoadProject: any;
  filterValue: any = "all";

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private storage: Storage,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.filterValue = "all";
  	console.log("==projects page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	//console.log(this.user);
		this.loadUserData();

		this.bLoadProject = JSON.parse(localStorage.getItem("bLoadProject"));
    if(this.bLoadProject == true || this.bLoadProject == 'true' || this.bLoadProject == '1') {
        this.bLoadProject = false;
        localStorage.removeItem("bLoadProject")
        this.getAddress();
        return ;
    }

    if(this.global.allAddressList.length > 0 && this.global.bossAddressList.length > 0) {
      this.addressList = this.global.allAddressList;
      this.global.bossAddressList.forEach(item => {
        item.isBoss = true
      });
      this.addressList = this.addressList.concat(this.global.bossAddressList);
      this.addressList = this.addressList.filter((thing,index) => {
        return index === this.addressList.findIndex(obj => {
          return JSON.stringify(obj) === JSON.stringify(thing);
        });
      });
      this.addressList = this.addressList.filter((thing,index) => {
        return index === this.addressList.findIndex(obj => {
          return JSON.stringify(obj) === JSON.stringify(thing);
        });
      });
      this.orgAddressList = _.cloneDeep(this.addressList);
      return ;
    }

    this.getAddress();
  }

  sortByFiler(ev: any){
  	if(ev.detail.value == 'all') {
  		this.sortOrg();
  	} else if(ev.detail.value == 'active') {
  		this.sortActive();
  	} else {
  		this.sortCompleted();
  	}
  }

	loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

  async getAddress1() {
      var url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
      this.addressList = [];
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
          loading.dismiss();
          this.addressList = resp.data;
          this.orgAddressList = _.cloneDeep(this.addressList);
          var now : any = new Date();
          this.storage.set('address', JSON.stringify(resp.data));
          this.storage.set('addressDate', now.getTime());
          window.localStorage.setItem("addressDate", now.getTime());
          this.global.allAddressList = resp.data;
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('There is an error when get address.');
      });
  }

  async getAddress() {
    let funcList = [];
    let url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.data.user_id;
    funcList.push(this.http.get(url));
    if(this.user.boss && this.user.boss.length > 0) {
      url = "https://www.artisanideas.co.nz/api/app-rentice/get_address_by_student.php?student=" + this.user.boss;
      funcList.push(this.http.get(url));
    }

    this.addressList = [];
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    forkJoin(funcList).subscribe(data => {
      loading.dismiss();
      if(data && data.length > 0) {
        data.forEach((item, idx) => {
          if(idx == 0) {
            this.addressList = this.addressList.concat(item.data);
          } else {
            item.data.forEach(_item => {
              _item.isBoss = true;
            })
            this.addressList = this.addressList.concat(item.data);
          }
        })
        this.addressList = this.addressList.filter((thing,index) => {
          return index === this.addressList.findIndex(obj => {
            return JSON.stringify(obj) === JSON.stringify(thing);
          });
        });
        //console.log(this.addressList);
        this.orgAddressList = _.cloneDeep(this.addressList);
      }
    }, err => {
        loading.dismiss();
        console.log(err);
    });
  }

  goProject(item) {
    this.currentProject = item;
    localStorage.setItem("currentProject", JSON.stringify(item));
    //$state.go("editProject");
    if(item.isBoss)  {
      this.router.navigateByUrl('/view-project');
    } else {
      this.router.navigateByUrl('/edit-project');
    }
  }
  
  compare1(a, b) {
      if (a.completed < b.completed)
          return 1;
      if (a.completed > b.completed)
          return -1;
      return 0;
  }

  compare2(a, b) {
      if (a.completed < b.completed)
          return -1;
      if (a.completed > b.completed)
          return 1;
      return 0;
  }
  

  sortCompleted() {
      //console.log(this.addressList);
      this.addressList = [];
      this.orgAddressList.forEach(value => {
					if(value.completed == 1 || value.completed == '1') {
              this.addressList.push(value);
          }
      });
  }
  
  sortActive() {
      //console.log(this.addressList);
      this.addressList = [];
      this.orgAddressList.forEach(value => {
					if(value.completed != 1 && value.completed != '1') {
              this.addressList.push(value);
          }
      });
  }   
  
  sortOrg() {
      this.addressList = _.cloneDeep(this.orgAddressList);  
  }
}
