import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import * as _ from 'lodash';
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

	groups: any = [];
	quals: any = [];
	user: any;
	data: any = {};
	allUsers: any = [];
  signupUser: any;

  constructor(private http: HttpClient,
  						private router: Router,
              private cdRef: ChangeDetectorRef,
  						public loadingController: LoadingController,
  						public global: GlobalProvider) { }

  ngOnInit() {
    console.log("oninit")
     this.user = JSON.parse(localStorage.getItem("user"));
    this.data = {
      qual: '',
      group: '',
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      list_id: '',
      password: '',
      re_password: '',
      faculty: this.user.faculty,
      provider: this.user.provider,
      tutor: this.user.user_id
    };
    this.getGroups();
    this.getQuals();
    this.getAllUsers();
  }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("user"));
    
    console.log("will enter")
    if(this.global.editSignup) {
      this.signupUser = JSON.parse(localStorage.getItem('signupUser'));
      console.log(this.signupUser)
      this.data = this.signupUser
    } else {
      this.data = {
        qual: '',
        group: '',
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        list_id: '',
        password: '',
        re_password: '',
        faculty: this.user.faculty,
        provider: this.user.provider,
        tutor: this.user.user_id
      };
    }
  }

  compareObject(a: any, b: any) {
      debugger
     return a.list_id === b.list_id;
  }

  openUrl(url) {
  	window.open(url,  '_blank');
  }

  getGroups() {
  	this.global.displayLoading();
  	this.groups = [];
  	const url = "https://artisanideas.co.nz/api/app-rentice/get_all_groups.php";
  	this.http.get(url).subscribe(async(resp: any) => {
  			this.global.hideLoading();
        if(resp.error == true) {
          console.log("there is an error while get groups");
          return ;
        }

        this.groups = resp.data.filter(p => p.faculty == this.user.faculty);
    }, (err) => {
    		this.global.hideLoading();
        console.log("there is an error while get groups");
    });
  }

  getQuals() {
  	this.quals = [];
  	const url = "https://artisanideas.co.nz/api/app-rentice/get_all_qual.php";
  	this.http.get(url).subscribe(async(resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get groups");
          return ;
        }
        this.quals = resp.data;
    }, (err) => {
        console.log("there is an error while get groups");
    });
  }

  getAllUsers() {
  	this.allUsers = [];
  	const url = "https://artisanideas.co.nz/api/app-rentice/get_all_users.php";
  	this.http.get(url).subscribe(async(resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get users");
          return ;
        }
        this.allUsers = resp.data;
    }, (err) => {
        console.log("there is an error while get users");
    });
  }

  async registerStudent() {
  	console.log(this.data)

  	if(this.data.qual == '') {
  		this.global.displayAlert("Please select qual");
  		return ;
  	}
  	if(this.data.student_id == '') {
  		this.global.displayAlert("Please enter id");
  		return ;
  	}
  	if(this.data.first_name == '') {
  		this.global.displayAlert("Please enter first name");
  		return ;
  	}
  	if(this.data.last_name == '') {
  		this.global.displayAlert("Please enter last name");
  		return ;
  	}
  	if(this.data.email == '') {
  		this.global.displayAlert("Please enter email");
  		return ;
  	}
  	if(this.data.group == '') {
  		this.global.displayAlert("Please select group");
  		return ;
  	}
  	if(this.data.password == '' || this.data.re_password == '') {
  		this.global.displayAlert("Please enter password");
  		return ;
  	}
  	if(this.data.password != this.data.re_password) {
  		this.global.displayAlert("Confirm password must be same.");
  		return ;
  	}
  	let flag = true;
  	for(let i=0;i<this.allUsers.length;i++) {
  		const user = this.allUsers[i];
  		if(user.email == this.data.email) {
  			flag = false;
  			this.global.displayAlert("This email is already registered")
  			break
  		}
  		if(user.user_login == this.data.student_id) {
  			flag = false;
  			this.global.displayAlert("This user id is already registered")
  			break
  		}
  	}

  	if(flag == false) {
  		return ;
  	}

    const url = "https://www.artisanideas.co.nz/api/app-rentice/register.php";
    const loading = await this.loadingController.create({
      message: 'Registering...',
    });
    await loading.present();
    let data = _.clone(this.data);
    this.quals.forEach(item => {
      if(item.list_id == this.data.qual) {
        this.global.currentQual = item.name
      }
    })

    this.groups.forEach(item => {
      if(item.list_id == this.data.group) {
        this.global.currentGrp = item.name
      }
    })
    this.http.post(url, data).subscribe((resp: any) => {
        loading.dismiss();
        this.global.displayAlert('Register Success!')
        this.global.signupUser = this.data;
        localStorage.setItem('signupUser', JSON.stringify(this.data))
        this.router.navigateByUrl('/signup-email');
    }, (err) => {
        loading.dismiss();
        this.global.displayAlert('There was a problem when register student.');
    });
  }
}
