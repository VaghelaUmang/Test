import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';

import { GlobalProvider } from '../../services/global-provider';

declare var window;

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

	user: any = {};
	hostURL: string = "";
	mainCatList: any = [];
	subCategoryList: any = [];
	allSubCatList: any = [];
  inventoryList: any = [];
  searchTerm: any = "";
  renderGroups: any = [];
  allActivityList: any = [];
  keyword1: string = '';
  keyword2: string = '';
  keyword3: string = '';
  keyword4: string = '';
  keyword5: string = '';
  keyword6: string = '';

  constructor(private platform: Platform,
  						public alertController: AlertController,
  						public loadingController: LoadingController,
  						private http: HttpClient,
  						private router: Router,
              private storage: Storage,
              private webview: WebView,
              public global: GlobalProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem("user"));
    console.log(this.user);

    this.getListByFaculty();

    this.loadData();
  }

  showKeywordButton() {
    if(this.global.listByFaculty == null) {
      try {
        let data = JSON.parse(window.localStorage.getItem("listByFaculty"));
        if(data && data.length > 0)  {
          this.keyword1 = data[0].keyword1;
          this.keyword2 = data[0].keyword2;
          this.keyword3 = data[0].keyword3;
          this.keyword4 = data[0].keyword4;
          this.keyword5 = data[0].keyword5;
          this.keyword6 = data[0].keyword6;
        } 
      } catch(e) {
        console.log(e)
      }
    }
    try {
      if(this.global.listByFaculty.length > 0) {
        let data = this.global.listByFaculty[0];
        if(data)  {
          this.keyword1 = data.keyword1;
          this.keyword2 = data.keyword2;
          this.keyword3 = data.keyword3;
          this.keyword4 = data.keyword4;
          this.keyword5 = data.keyword5;
          this.keyword6 = data.keyword6;
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async getListByFaculty() {
      var url = "https://artisanideas.co.nz/api/app-rentice/get_list_by_faculty.php?faculty=" + this.user.faculty;
      this.http.get(url).subscribe((resp: any) => {
          if(resp.error == true) {
              return ;
          }
          this.global.listByFaculty = resp.list;
          var data = JSON.stringify(this.global.listByFaculty);
          window.localStorage.setItem("listByFaculty", data);
          this.showKeywordButton();
      }, (err) => {
          console.log("There is an error when get list by faculty")
      });
  }

  onCancel() {
    console.log("cancel")
  }

  onClear() {
    console.log("clear")
  }

  loadData() {
    this.mainCatList = this.global.allMaincategoryList;
      if(this.mainCatList.length < 1) {
        this.storage.get('maincategory').then((maincategory) => {
          if(maincategory !== null && maincategory !== undefined && maincategory !== "") {
              try {
                  this.global.allMaincategoryList = JSON.parse(maincategory);
              } catch(e) {
                  this.global.allMaincategoryList = [];
              }
              this.mainCatList = this.global.allMaincategoryList;
          }
        });
      }
      this.allSubCatList = this.global.allSubcategoryList;
      if(this.allSubCatList.length < 1) {
        this.storage.get('allSubCategory').then((subCat) => {
          if(subCat !== null && subCat !== undefined && subCat !== "") {
              try {
                  this.global.allSubcategoryList = JSON.parse(subCat);
              } catch(e) {
                  this.global.allSubcategoryList = [];
              }
              this.allSubCatList = this.global.allSubcategoryList;
          }
        });
      }
      this.allActivityList = this.global.allActivityList;
      if(this.allActivityList.length < 1) {
        this.storage.get('allactivity').then((activity) => {
          if(activity !== null && activity !== undefined && activity !== "") {
              try {
                  this.global.allActivityList = JSON.parse(activity);
              } catch(e) {
                  this.global.allActivityList = [];
              }
              this.allActivityList = this.global.allActivityList;
          }
        });
      }
      console.log(this.mainCatList);
      console.log(this.allSubCatList);
      console.log(this.allActivityList);
  }

  async doSearch() {
    this.loadData();
    this.allActivityList.forEach(item => {
      for(let i = 0 ;i<this.mainCatList.length;i++) {
        if(parseInt(item.main_category) == parseInt(this.mainCatList[i].cat) ||
          item.main_category == this.mainCatList[i].name ||
          this.mainCatList[i].name.indexOf(item.main_category) > -1) {
          item.main_category = this.mainCatList[i].cat;
          item.mainCatName = this.mainCatList[i].name;
        }
      }
      for(let i = 0 ;i<this.allSubCatList.length;i++) {
        if(parseInt(item.sub_category) == parseInt(this.allSubCatList[i].list_id) || 
          parseInt(item.sub_category) == parseInt(this.allSubCatList[i].cat)) {
          item.subCatName = this.allSubCatList[i].name;
          item.keywords = this.allSubCatList[i].keywords
        }
      }
    });
    console.log(this.allActivityList);

    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    console.log(this.searchTerm);
    let resultList = [];
    this.allActivityList.forEach(item => {
      let flag = false;
      for (var idx in item) {
         let _item = item[idx].toString();
         _item = _item.toLowerCase();
         if(_item.indexOf(this.searchTerm.toLowerCase()) > -1) {
           flag = true;
           break;
         }
       }

       if(flag) {
         resultList.push(item);
       }
    });

    console.log(resultList);

    const groups = new Set(resultList.map(item => item.main_category));
    console.log(groups);
    let _result = [];

    groups.forEach(g => {
      let data: any;
      data = resultList.filter(i => i.main_category === g); 
      const _groups = new Set(data.map(item => item.sub_category));
      let _result1 = [];
      let mainCatName = "";
      for(let i = 0 ;i<this.mainCatList.length;i++) {
        if(parseInt(g) == parseInt(this.mainCatList[i].cat)) {
          mainCatName = this.mainCatList[i].name;
        }
      }

      _groups.forEach((_g: any) => {
        let subCatName = "";
        let link = "";
        for(let i = 0 ;i<this.allSubCatList.length;i++) {
          if(parseInt(_g) == parseInt(this.allSubCatList[i].list_id) || 
            parseInt(_g) == parseInt(this.allSubCatList[i].cat)) {
            subCatName = this.allSubCatList[i].name;
            link = this.allSubCatList[i].link;
          }
        }
        let data1: any;
        data1 = data.filter(i => i.sub_category === _g);
        _result1.push({
          id: _g,
          link: link,
          name: subCatName,
          values: data1
        });
      });

      _result.push({
        id: g,
        name: mainCatName,
        values: _result1
      });

    });

    this.renderGroups = Object.assign([], _result);
    console.log(this.renderGroups);

    setTimeout(() => {
      loading.dismiss();
    }, 500);
  }

  async loadInventoryData() {
      this.inventoryList = [];

      let url = "https://www.artisanideas.co.nz/api/app-rentice/search_inventory_by_student.php?student=" + this.user.user_id;
          const loading = await this.loadingController.create({
            message: '',
          });
          await loading.present();
          this.http.get(url).subscribe((resp: any) => {
              loading.dismiss();
              //console.log(resp.data);
              if(resp.error == true) {
                  this.global.displayAlert("There is an error when search inventory.");
                  return ;
              }
              resp.data.forEach(item => {
                item.name = this.user.user_firstname + " " + this.user.user_lastname;
                for(let i = 0 ;i<this.mainCatList.length;i++) {
                  if(parseInt(item.main_category) == parseInt(this.mainCatList[i].cat)) {
                    item.mainCatName = this.mainCatList[i].name;
                  }
                }
                for(let i = 0 ;i<this.allSubCatList.length;i++) {
                  if(parseInt(item.sub_category) == parseInt(this.allSubCatList[i].list_id) || 
                    parseInt(item.sub_category) == parseInt(this.allSubCatList[i].cat)) {
                    item.subCatName = this.allSubCatList[i].name;
                  }
                }
              });
              this.inventoryList = resp.data;
              console.log(this.inventoryList);

          }, (err) => {
              loading.dismiss();
              this.global.displayAlert("There is an error when search inventory.");
          });
  }

  clickCategory(item) {
    localStorage.setItem("mainCategoryIdx", item.cat);
    localStorage.setItem("mainCategoryName", item.name);
    this.router.navigateByUrl('/sub');
  }

  searchTermChanged() {

  }

  onKeyPressed(event) {
    if(event.keyCode == 13) {
      this.doSearch();
    }
  }

  async doSearch1() {
    const loading = await this.loadingController.create({
      message: '',
    });
    await loading.present();
    console.log(this.searchTerm);
    let resultList = [];
    this.inventoryList.forEach(item => {
      let flag = false;
      for (var idx in item) {
         let _item = item[idx].toString();
         _item = _item.toLowerCase();
         if(_item.indexOf(this.searchTerm.toLowerCase()) > -1) {
           flag = true;
           break;
         }
       }

       if(flag) {
         resultList.push(item);
       }
    });

    console.log(resultList);

    const groups = new Set(resultList.map(item => item.main_category));
    console.log(groups);
    let _result = [];

    groups.forEach(g => {
      let data: any;
      data = resultList.filter(i => i.main_category === g); 
      const _groups = new Set(data.map(item => item.sub_category));
      let _result1 = [];
      let mainCatName = "";
      for(let i = 0 ;i<this.mainCatList.length;i++) {
        if(parseInt(g) == parseInt(this.mainCatList[i].cat)) {
          mainCatName = this.mainCatList[i].name;
        }
      }

      _groups.forEach((_g: any) => {
        let subCatName = "";
        let link = "";
        for(let i = 0 ;i<this.allSubCatList.length;i++) {
          if(parseInt(_g) == parseInt(this.allSubCatList[i].list_id) || 
            parseInt(_g) == parseInt(this.allSubCatList[i].cat)) {
            subCatName = this.allSubCatList[i].name;
            link = this.allSubCatList[i].link;
          }
        }
        let data1: any;
        data1 = data.filter(i => i.sub_category === _g);
        _result1.push({
          id: _g,
          link: link,
          name: subCatName,
          values: data1
        });
      });

      _result.push({
        id: g,
        name: mainCatName,
        values: _result1
      });

    });

    this.renderGroups = Object.assign([], _result);
    console.log(this.renderGroups);

    setTimeout(() => {
      loading.dismiss();
    }, 500);
  }


  clickSubCat(mainCat, subCat) {
    console.log(mainCat);
    console.log(subCat);
    localStorage.setItem("mainCategoryIdx", mainCat.id);
    localStorage.setItem("mainCategoryName", mainCat.name);
    localStorage.setItem("subCategoryIdx", subCat.id);
    localStorage.setItem("subCategoryName", subCat.name);
    localStorage.setItem("subCatInfo", JSON.stringify(subCat));
    this.router.navigateByUrl('/activity');
  }

  clickActivity(mainCat, subCat, activity) {
    console.log(mainCat);
    console.log(subCat);
    console.log(activity);
    localStorage.removeItem("lastEntry");
    localStorage.setItem("mainCategoryIdx", mainCat.id);
    localStorage.setItem("mainCategoryName", mainCat.name);
    localStorage.setItem("subCategoryIdx", subCat.id);
    localStorage.setItem("subCategoryName", subCat.name);
    localStorage.setItem("subCatInfo", JSON.stringify(subCat));
    localStorage.setItem("inventory_item", activity.name);
    this.router.navigateByUrl('/activity');
  }
}
