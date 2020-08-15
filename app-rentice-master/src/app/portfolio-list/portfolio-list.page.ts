import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, IonInfiniteScroll, AlertController, LoadingController } from '@ionic/angular';
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
  selector: 'app-portfolio-list',
  templateUrl: './portfolio-list.page.html',
  styleUrls: ['./portfolio-list.page.scss'],
})
export class PortfolioListPage implements OnInit {

	data: any = {};
	user: any = {};
	bLoadPortfolio: any;
	portfolioList: any = [];
	totalCount: any = 0;
	AllPortfolioList: any = [];
  portfolioItemList: any = [];
  AllPortfolioItemList: any = [];

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
        window.ga('send', 'pageview', 'Portfolio Page');
      } else {
        if(this.ga) {
          this.ga.trackView('Portfolio Page');
        }
      }
    } catch(e) {
      console.log(e)
    }
    
  	console.log("==portfolio page===");
  	this.user = JSON.parse(localStorage.getItem("user"));

    this.infiniteScroll.disabled = false;
    this.loadUserData();

    this.loadPortfolios();
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

	async loadPortfolios() {
      console.log(this.data);

      this.portfolioList = [];
      const url = "https://www.artisanideas.co.nz/api/app-rentice/get_portfolio_by_user.php?user_id=" + this.data.user_id;
      const loading = await this.loadingController.create({
	      message: '',
	    });
	    await loading.present();
      this.http.get(url).subscribe((resp: any) => {
      		loading.dismiss();
          console.log(resp.data);
          if(resp.error == true) {
              this.global.displayAlert("There is an error when get portfolio.");
              return ;
          }
          
          this.AllPortfolioList = resp.data;
          this.totalCount = this.AllPortfolioList.length;
          if(this.infiniteScroll)
            this.infiniteScroll.disabled = false;
          // if(this.totalCount > 10) {
          //     this.portfolioList = this.AllPortfolioList.slice(0, 10);
          // } else {
          //     this.portfolioList = this.AllPortfolioList;
          // }
          this.portfolioList = this.AllPortfolioList;
      }, (err) => {
          loading.dismiss();
          this.global.displayAlert("There is an error when get todo list.");
      }); 
  }

	loadMore(event) {
    //Load More 10 items
    if(this.portfolioList === null || this.portfolioList === undefined) {
        return ;
    }
    var nCount = this.portfolioList.length;
    var moreList = [];
    if(nCount+10>this.totalCount) {
        var n = this.totalCount - nCount;
        moreList = this.AllPortfolioList.slice(nCount, nCount+n);
    } else {
        moreList = this.AllPortfolioList.slice(nCount, nCount+10);
    }
    
    this.portfolioList = this.portfolioList.concat(moreList);
    this.infiniteScroll.disabled = false;
    if(this.portfolioList.length >= this.totalCount) {
        this.infiniteScroll.disabled = true;
    }
    event.target.complete();
  }

  goPortfolioItem(slidingItem: IonItemSliding, item) {
      if(slidingItem)
        slidingItem.close();
      localStorage.setItem("currentPortfolio", JSON.stringify(item));
    	console.log(item);  
     	this.router.navigateByUrl('/portfolio');
  }

  editPortfolioItem(slidingItem: IonItemSliding, item) {
      if(slidingItem)
        slidingItem.close();
      localStorage.setItem("currentPortfolio", JSON.stringify(item));
      console.log(item);  
       this.router.navigateByUrl('/edit-portfolio-list');
  }
}
