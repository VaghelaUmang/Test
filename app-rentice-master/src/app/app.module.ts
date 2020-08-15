import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer} from '@ionic-native/file-transfer/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Network } from '@ionic-native/network/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Push } from '@ionic-native/push/ngx';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { SharedModule } from "./services/shared.module";
import { ProjectsPage } from "./projects/projects.page";
import { EditProjectPage } from "./projects/edit-project/edit-project.page";
import { ViewProjectPage } from "./projects/view-project/view-project.page";
import { StudentLogPage } from "./student-log/student-log.page";
import { EditSlEntryPage } from "./student-log/edit-sl-entry/edit-sl-entry.page";
import { ViewSlEntryPage } from "./student-log/view-sl-entry/view-sl-entry.page";
import { SearchByUsPage } from "./student-log/search-by-us/search-by-us.page";
import { ToolRegisterPage } from './tool-register/tool-register.page';
import { EditToolPage } from './tool-register/edit-tool/edit-tool.page';
import { ViewToolPage } from './tool-register/view-tool/view-tool.page';
import { TimesheetPage } from './timesheet/timesheet.page';
import { EditTsEntryPage } from './timesheet/edit-ts-entry/edit-ts-entry.page';
import { ViewTsEntryPage } from './timesheet/view-ts-entry/view-ts-entry.page';
import { ViewSummaryPage } from './student-log/view-summary/view-summary.page';
import { ViewSummarySubPage } from "./student-log/view-summary-sub/view-summary-sub.page";
import { ViewSummaryDetailPage } from "./student-log/view-summary-detail/view-summary-detail.page";
import { ViewSummaryActivityPage } from "./student-log/view-summary-activity/view-summary-activity.page";
import { SearchByUsUpdatePage } from "./student-log/search-by-us-update/search-by-us-update.page";

import { ToDoListPage } from './to-do-list/to-do-list.page';
import { ViewToDoListPage } from './to-do-list/view-to-do-list/view-to-do-list.page';
import { EditToDoListPage } from './to-do-list/edit-to-do-list/edit-to-do-list.page';
import { EditToDoListItemPage } from './to-do-list/edit-to-do-list-item/edit-to-do-list-item.page';

import { PortfolioPage } from './portfolio/portfolio.page';
import { EditPortfolioPage } from './portfolio/edit-portfolio/edit-portfolio.page';

import { PortfolioListPage } from './portfolio-list/portfolio-list.page';
import { EditPortfolioListPage } from './portfolio-list/edit-portfolio-list/edit-portfolio-list.page';

import { LinkAccountsPage } from './settings/link-accounts/link-accounts.page';
import { LinkWorkerPage } from './settings/link-worker/link-worker.page';
import { LinkEmployerPage } from './settings/link-employer/link-employer.page';

import { ManagedStudentLogPage } from './managed/managed-student-log/managed-student-log.page';
import { ViewManagedStudentPage } from './managed/view-managed-student/view-managed-student.page';
import { ManagedStaffTimesheetsPage } from './managed/managed-staff-timesheets/managed-staff-timesheets.page';
import { ViewManagedEntryPage } from './managed/view-managed-entry/view-managed-entry.page';
import { ViewStaffUnitStandardPage } from './managed/view-staff-unit-standard/view-staff-unit-standard.page';
import { ViewStaffUnitStandardUpdatePage } from './managed/view-staff-unit-standard-update/view-staff-unit-standard-update.page';
import { StaffViewSummarySubPage } from "./managed/view-summary-sub/view-summary-sub.page";
import { StaffViewSummaryDetailPage } from "./managed/view-summary-detail/view-summary-detail.page";
import { StaffViewSummaryActivityPage } from "./managed/view-summary-activity/view-summary-activity.page";

import { ViewTutorStudentPage } from './managed-students/view-tutor-student/view-tutor-student.page';
import { ViewTutorUnitStandardPage } from './managed-students/view-tutor-unit-standard/view-tutor-unit-standard.page';
import { ViewTutorUnitStandardUpdatePage } from './managed-students/view-tutor-unit-standard-update/view-tutor-unit-standard-update.page';
import { ViewTutorStudentTablePage } from './managed-students/view-tutor-student-table/view-tutor-student-table.page';
import { ViewTutorUnitStandardTablePage } from './managed-students/view-tutor-unit-standard-table/view-tutor-unit-standard-table.page';
import { TutorViewEntryPage } from './managed-students/tutor-view-entry/tutor-view-entry.page';
import { TutorViewSummaryPage } from './managed-students/view-summary/view-summary.page';
import { TutorViewSummarySubPage } from "./managed-students/view-summary-sub/view-summary-sub.page";
import { TutorViewSummaryDetailPage } from "./managed-students/view-summary-detail/view-summary-detail.page";
import { TutorViewSummaryActivityPage } from "./managed-students/view-summary-activity/view-summary-activity.page";

import { StudentLogTablePage } from './student-log/student-log-table/student-log-table.page'
import { SearchByUSTablePage } from './student-log/search-by-us-table/search-by-us-table.page'

import { RequestSummaryPage } from './request-review/request-summary/request-summary.page';
import { SignoffSummaryPage } from './managed-students/signoff-summary/signoff-summary.page';
import { SignoffQualUpdatePage } from './managed-students/signoff-qual-update/signoff-qual-update.page';
import { NewSignoffPage } from './managed-students/new-signoff/new-signoff.page';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    ProjectsPage,
    EditProjectPage,
    ViewProjectPage,
    StudentLogPage,
    EditSlEntryPage,
    ViewSlEntryPage,
    SearchByUsPage,
    ToolRegisterPage,
    EditToolPage,
    ViewToolPage,
    TimesheetPage,
    EditTsEntryPage,
    ViewTsEntryPage,
    ToDoListPage,
    ViewToDoListPage,
    EditToDoListPage,
    EditToDoListItemPage,
    LinkAccountsPage,
    LinkWorkerPage,
    LinkEmployerPage,
    ManagedStudentLogPage,
    ViewManagedStudentPage,
    ManagedStaffTimesheetsPage,
    ViewManagedEntryPage,
    ViewTutorStudentPage,
    ViewTutorStudentTablePage,
    ViewTutorUnitStandardPage,
    ViewTutorUnitStandardUpdatePage,
    TutorViewEntryPage,
    ViewSummaryPage,
    ViewSummarySubPage,
    ViewSummaryActivityPage,
    ViewSummaryDetailPage,
    TutorViewSummaryPage,
    TutorViewSummarySubPage,
    TutorViewSummaryActivityPage,
    TutorViewSummaryDetailPage,
    StaffViewSummarySubPage,
    StaffViewSummaryActivityPage,
    StaffViewSummaryDetailPage,
    ViewTutorUnitStandardTablePage,
    ViewStaffUnitStandardPage,
    StudentLogTablePage,
    SearchByUSTablePage,
    ViewStaffUnitStandardUpdatePage,
    SearchByUsUpdatePage,
    PortfolioPage,
    EditPortfolioPage,
    PortfolioListPage,
    EditPortfolioListPage,
    RequestSummaryPage,
    SignoffSummaryPage,
    SignoffQualUpdatePage,
    NewSignoffPage
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    ClipboardModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: 'appRenticeDB',
      driverOrder: ['websql', 'sqlite', 'indexeddb']
    }),
    AppRoutingModule,
    HttpClientModule,
    SharedModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    FileTransfer,
    Camera,
    InAppBrowser,
    Network,
    EmailComposer,
    WebView,
    SocialSharing,
    Push,
    GoogleAnalytics,
    LocalNotifications,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
