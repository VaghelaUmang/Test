import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';

@Component({
  selector: 'app-signup-email',
  templateUrl: './signup-email.page.html',
  styleUrls: ['./signup-email.page.scss'],
})
export class SignupEmailPage implements OnInit {

	groups: any = [];
	quals: any = [];
	user: any;
	data: any = {};
	allUsers: any = [];
	instruct_email: string = "";
	note: string = "";

  constructor(private http: HttpClient,
  						private router: Router,
  						public loadingController: LoadingController,
  						public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  	this.global.editSignup = false;
  	this.user = JSON.parse(localStorage.getItem("user"));
  	this.global.signupUser = JSON.parse(localStorage.getItem('signupUser'));
  	this.getListByFaculty()
  }

  async getListByFaculty() {
  		const loading =  await this.loadingController.create({
	      message: "",
	    });
	    await loading.present();
      const url = "https://artisanideas.co.nz/api/app-rentice/get_list_by_faculty.php?faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
      		loading.dismiss()
          if(resp.error == true) {
              return ;
          }
          if(resp.list.length > 0) {
          	this.instruct_email = resp.list[0].instruct_email;
          }
      }, (err) => {
      		loading.dismiss()
          console.log("There is an error when get list by faculty")
      });
  }

  sendMail() {
    let body = '';

    body += "Download the iOS app at https://itunes.apple.com/nz/app/app-rentice/id1234156125?mt=8%20%0D%0A"
    body += "Download the Android app at https://play.google.com/store/apps/details?id=com.artisanideas.apprentice%20%0D%0A"
    body += "You can access the web app at https://app-rentice.firebaseapp.com%20%0D%0A"
    body += "Full Documentation can be found at www.artisanideas.co.nz/docs or just the Tutorials at https://artisanideas.co.nz/docs/students/%20%0D%0A"
    //<a href="www.google.com">www.google.com</a>
    body += "%20%0D%0A";
    body += this.instruct_email;
    body += "%20%0D%0A";
    body += "%20%0D%0A";
  	body += "Assessor Instruction/Note: " + this.note + "%20%0D%0A";
  	body += "Qualification: " + this.global.currentQual + "%20%0D%0A";
  	body += "Username: " + this.global.signupUser.student_id + "%20%0D%0A";
  	body += "Password: " + this.global.signupUser.password + "%20%0D%0A";
  	body += "First Name: " + this.global.signupUser.first_name + "%20%0D%0A";
  	body += "Last Name: " + this.global.signupUser.last_name + "%20%0D%0A";
  	body += "Email: " + this.global.signupUser.email + "%20%0D%0A";
  	body += "Group: " + this.global.currentGrp;
    //console.log(body)
  	document.location.href = "mailto:" + this.global.signupUser.email + "?subject=Signup User&body=" + body;
  }

  editSignup() {
  	this.global.editSignup = true;
  	this.router.navigateByUrl('/signup');
  }
}
