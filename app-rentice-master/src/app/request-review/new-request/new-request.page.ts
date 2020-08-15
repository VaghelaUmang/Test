import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, LoadingController, AlertController, IonItemSliding } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

declare var window;

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.page.html',
  styleUrls: ['./new-request.page.scss'],
})
export class NewRequestPage implements OnInit {

	data: any = {};
	user: any = {};
	qualName: string = '';

  constructor(private platform: Platform,
              private translate: TranslateService,
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
        window.ga('send', 'pageview', 'New Request Review');
      } else {
        if(this.ga) {
          this.ga.trackView('New Request Review');
        }
      }
    } catch(e) {
      console.log(e)
    }

    this.data = {
        date: new Date().toISOString().substr(0, 10),
        notes: ''
    };

    this.user = JSON.parse(localStorage.getItem("user"));
    this.qualName = '';
    this.loadUserData()
    this.loadQualData()
  }

  loadUserData() {
    this.data.tutor = this.user.tutor;
    this.data.user_id = this.user.user_id;
    this.data.faculty = this.user.faculty;
    this.data.provider = this.user.provider;
  }

  loadQualData() {
    this.global.allQualList.forEach(item => {
      if(item.list_id == this.user.qual) {
        this.qualName = item.name;
      }
    })
    if(this.qualName.length > 0) {
    	return ;
    }
    const url = "https://www.artisanideas.co.nz/api/app-rentice/get_all_qual.php";
    this.http.get(url).subscribe((resp: any) => {
        if(resp.error == true) {
          console.log("there is an error while get courseList");
          return ;
        }

        resp.data.filter(item => {
          if(item.list_id == this.user.qual) {
            this.qualName = item.name;
          }
        })
    }, (err) => {
        console.log("there is an error while get courseList");
    });
  }

  async saveData() {
      console.log(this.data);
      let data = {
          student: this.user.user_id.toString(),
          tutor: this.user.tutor,
          provider: this.user.provider,
          faculty: this.user.faculty,
          course_code: this.user.qual,
          status: 'In Progress',
          created: this.data.date,
          notes: this.data.notes,
          note1: '',
          photo1: '',
          photo2: '',
          tutor_notes: '',
          list_id: ''
      };
      
      const url = "https://www.artisanideas.co.nz/api/app-rentice/add_request_list.php";
      const loading = await this.loadingController.create({
	      message: ''
	    });
	    await loading.present();
      this.http.post(url, data).subscribe((resp: any) => {
      		loading.dismiss();
          console.log(resp);
          if(resp.error == true) {
              this.global.displayAlert('Sorry we could not upload your entry, please try again later.');
              return ;
          }

          console.log(data)
          data.list_id = resp.data;
          localStorage.setItem('currentRequestItem', JSON.stringify(data))

          this.router.navigateByUrl('/request-summary')
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert('Sorry we could not upload your entry, please try again later.');
      });         
  }
}
