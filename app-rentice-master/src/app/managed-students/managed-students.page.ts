import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { forkJoin, interval } from 'rxjs';

import * as _ from 'lodash';
import { GlobalProvider } from '../services/global-provider';

@Component({
  selector: 'app-managed-students',
  templateUrl: './managed-students.page.html',
  styleUrls: ['./managed-students.page.scss'],
})
export class ManagedStudentsPage implements OnInit {

	user: any = {};
	data: any = {};
	userList: any = [];
  tempList: any = [];
  renderUserList: any = [];
  searchTerm: string = "";
  timer: any;
  cnt: any = 0;
  loading: any;
  bOtherShow: boolean = false;
  assessorList: any = [];
  selectedUser: any;
  bSignup: boolean = false;

  @ViewChild(IonSelect) select: IonSelect;

  constructor(private platform: Platform,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==managed students page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

    if(this.user.user_roles == 'List(tutor)' || this.user.user_roles == 'List(hod)') {
      this.bSignup = true;
    }
    this.loadUserData();
    this.getUserList(this.user.user_id);
  }

  openUsers(){
    this.select.open();
  }

	loadUserData() {
    this.data.tutor = this.user.tutorName;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.providerName;
    this.data.name = this.user.user_login;
    this.data.username =  this.user.user_firstname + ' ' + this.user.user_lastname;
    this.data.email = this.user.user_email;

    try {
      let data = JSON.parse(window.localStorage.getItem("listByFaculty"));
      if(data && data.length > 0) {
        if(data[0].access != 0) {
          this.bOtherShow = true;
          this.getAssessorList2(this.user.faculty, this.user.grp)
          return ;
        } else {
          this.bOtherShow = false;
        }
      }
    } catch(e) {
      console.log(e)
    }

    if(this.user.user_roles == 'List(HOD)') {
      this.bOtherShow = true;
      this.getAssessorList(this.data.faculty)
    }
  }

  getAssessorList(faculty) {
    this.assessorList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_users_by_faculty.php?faculty=" + faculty;
    this.http.get(url).subscribe(async(resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get assessor list");
          return ;
        }

        if(!resp.data || resp.data.length < 1) {
          return ;
        }
        resp.data.forEach(item => {
           let roles = item.user_roles;
           roles = roles.replace("List(", "");
           roles = roles.replace(")", "");
           roles = roles.split(",");
           roles.forEach(role => {
             if(role == 'tutor') {
               this.assessorList.push(item)
             }
           })
        })
        console.log(this.assessorList)
    }, (err) => {
        console.log("there is an error while get assessor list");
    });
  }

  getAssessorList2(faculty, grp) {
    this.assessorList = [];
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_users_by_faculty.php?faculty=" + faculty;
    this.http.get(url).subscribe(async(resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get assessor list");
          return ;
        }

        if(!resp.data || resp.data.length < 1) {
          return ;
        }
        resp.data.forEach(item => {
           if(item.grp == grp) {
             let roles = item.user_roles;
             roles = roles.replace("List(", "");
             roles = roles.replace(")", "");
             roles = roles.split(",");
             roles.forEach(role => {
               if(role == 'tutor') {
                 this.assessorList.push(item)
               }
             })
           }
        })
        console.log(this.assessorList)
    }, (err) => {
        console.log("there is an error while get assessor list");
    });
  }

  assessorChange() {
    console.log(this.selectedUser)
    this.getUserList(this.selectedUser)
  }

  async getUserList(user_id) {
  	this.global.displayLoading();
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_users_by_tutor.php?tutor=" + user_id;
    this.http.get(url).subscribe(async(resp: any) => {
    		this.global.loading.dismiss();
        if(resp.error == true) {
          console.log("there is an error while get user list");
          return ;
        }
        console.log(resp.data);
        this.userList = resp.data;
        this.renderUserList = _.cloneDeep(this.userList);
        this.tempList = _.cloneDeep(this.userList);
        this.cnt = 0;
        if(this.tempList.length > 0) {
          //this.global.displayLoading();
          this.getStudentLog(this.renderUserList[0]);
        }
    }, (err) => {
    		this.global.loading.dismiss();
        console.log("there is an error while get user list");
    });
  }

  async getStudentLog(student) {
    let url = "https://www.artisanideas.co.nz/api/app-rentice/search_inventory_by_student.php?student=" + student.user_id;

    this.http.get(url).subscribe((res: any) => {
      let n = 0;
      res.data.forEach(item => {
        let d = new Date(item.inventory_purchased);
        let now = new Date();
        let diffTime = Math.abs(now.getTime() - d.getTime());
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if(diffDays <= 7) {
          n++;
        }
      })
      student.count = n;
      if(this.cnt < this.renderUserList.length - 1) {
        this.cnt ++;
        this.getStudentLog(this.renderUserList[this.cnt])
      } else {
        this.global.loading.dismiss();
      }
    }, err => {
        this.global.loading.dismiss();
        console.log(err);
    });
  }

  doSearch() {
    this.renderUserList = []
    if(this.searchTerm.length < 1) {
      this.renderUserList = _.cloneDeep(this.userList);
      return ;
    }
    const searchTxt = this.searchTerm.toLowerCase();
    this.userList.forEach(item => {
      const firstName = item.user_firstname.toLowerCase();
      const lastName = item.user_lastname.toLowerCase();
      if(firstName.indexOf(searchTxt) > -1 || lastName.indexOf(searchTxt) > -1) {
        this.renderUserList.push(item)
      }
    })
  }

  goStudentMenu(item) {
  	localStorage.setItem("currentTutorItem", JSON.stringify(item));
  }

  changeSearch(event) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.doSearch();
    }, 1000);
  }

  onKeyPressed(event) {
    if(event.keyCode == 13) {
      this.doSearch();
    }
  }

  onCancel() {
    console.log("cancel");
  }

  onClear() {
    console.log("onClear");
    this.renderUserList = _.cloneDeep(this.userList);
  }

}
