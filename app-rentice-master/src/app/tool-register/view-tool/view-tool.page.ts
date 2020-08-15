import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { GlobalProvider } from '../../services/global-provider';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-tool',
  templateUrl: './view-tool.page.html',
  styleUrls: ['./view-tool.page.scss'],
})
export class ViewToolPage implements OnInit {
	user: any = {};
	data: any = {};
	currentTool: any;
	bShowButton: boolean = false;
	loading: any;
	imgURL: any;
	toolImg: any;
	uploadLoading: any;

  constructor(private platform: Platform,
  						public alertController: AlertController,
              private translate: TranslateService,
              public global: GlobalProvider,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
  						private cdRef: ChangeDetectorRef,
  						public actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
  }

	ionViewWillEnter() {
  	console.log("==student edit page===");
  	this.user = JSON.parse(localStorage.getItem("user"));
  	console.log(this.user);

	  this.currentTool = JSON.parse(localStorage.getItem("currentTool"));
    console.log(this.currentTool);

    this.data = {
        id: this.currentTool.id,
        user_id: '',
        type: this.currentTool.type,
        brand: this.currentTool.brand,
        model: this.currentTool.model,
        serial: this.currentTool.serial,
        tool_id: this.currentTool.tool_id,
        value: this.currentTool.value,
        staff: this.currentTool.staff,
        team: this.currentTool.team,
        notes: this.currentTool.notes,
        purchased: this.currentTool.purchased,
        image: this.currentTool.image
    };
    
    if(!this.data.image || this.data.image == '') {
        this.bShowButton = true;
    } else {
        this.bShowButton = false;
    }
    
		this.loadUserData();
  }

	loadUserData() {
      this.data.tutor = this.user.tutor;
      this.data.user_id = this.user.user_id;
      this.data.faculty = this.user.faculty;
      this.data.provider = this.user.provider;
  }

	doRemove () {
		this.alertController.create({
      header: this.translate.instant('Alert'),
      message: this.translate.instant('Are you sure to remove this item?'),
      buttons: [
        {
          text: this.translate.instant('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
						let data = {
                id: this.data.id
            };
            
            const url = "https://www.artisanideas.co.nz/api/app-rentice/remove_tool.php";
            this.loadingController.create({
				      message: this.translate.instant('Removing...'),
				    }).then((loading) => {
				    	this.loading = loading;
				    	loading.present();
				    });
				    
            this.http.post(url, data).subscribe((resp: any) => {
                this.loading.dismiss();
                console.log(resp.data);
                if(resp.error == true) {
                    this.global.displayAlert('There is an error when remove tool.')
                    return ;
                }

                this.alertController.create({
						      header: this.translate.instant('Success'),
						      message: this.translate.instant('Tool is removed'),
						      buttons: [{
						          text: 'Okay',
						          handler: () => {
						            console.log('Confirm Okay');
						            localStorage.setItem('bLoadTool', '1');
						            this.router.navigateByUrl('/tool-register');
						          }
						        }
						      ]
						    }).then((alert) => {
						    	alert.present();
						    });                
            }, (err) => {
                this.loading.dismiss();
                this.global.displayAlert('There is an error when remove tool.')
            });
          }
        }
      ]
    }).then((alert) => {
    	alert.present();
    });
  }

	goUpdate() {
   this.router.navigateByUrl('/edit-tool');
  }

}
