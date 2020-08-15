import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectsPage } from "./projects/projects.page";
import { EditProjectPage } from "./projects/edit-project/edit-project.page";
import { ViewProjectPage } from "./projects/view-project/view-project.page";

import { StudentLogPage } from "./student-log/student-log.page";
import { EditSlEntryPage } from "./student-log/edit-sl-entry/edit-sl-entry.page";
import { ViewSlEntryPage } from "./student-log/view-sl-entry/view-sl-entry.page";
import { SearchByUsPage } from "./student-log/search-by-us/search-by-us.page";
import { ViewSummaryPage } from "./student-log/view-summary/view-summary.page";
import { ViewSummarySubPage } from "./student-log/view-summary-sub/view-summary-sub.page";
import { ViewSummaryDetailPage } from "./student-log/view-summary-detail/view-summary-detail.page";
import { ViewSummaryActivityPage } from "./student-log/view-summary-activity/view-summary-activity.page";
import { StudentLogTablePage } from './student-log/student-log-table/student-log-table.page'
import { SearchByUSTablePage } from './student-log/search-by-us-table/search-by-us-table.page'
import { SearchByUsUpdatePage } from "./student-log/search-by-us-update/search-by-us-update.page";

import { ToolRegisterPage } from './tool-register/tool-register.page';
import { EditToolPage } from './tool-register/edit-tool/edit-tool.page';
import { ViewToolPage } from './tool-register/view-tool/view-tool.page';

import { TimesheetPage } from './timesheet/timesheet.page';
import { EditTsEntryPage } from './timesheet/edit-ts-entry/edit-ts-entry.page';
import { ViewTsEntryPage } from './timesheet/view-ts-entry/view-ts-entry.page';

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

import { ViewTutorStudentPage } from './managed-students/view-tutor-student/view-tutor-student.page';
import { ViewTutorUnitStandardTablePage } from './managed-students/view-tutor-unit-standard-table/view-tutor-unit-standard-table.page';
import { TutorViewEntryPage } from './managed-students/tutor-view-entry/tutor-view-entry.page';
import { ViewTutorUnitStandardPage } from './managed-students/view-tutor-unit-standard/view-tutor-unit-standard.page';
import { ViewTutorUnitStandardUpdatePage } from './managed-students/view-tutor-unit-standard-update/view-tutor-unit-standard-update.page';
import { TutorViewSummaryPage } from "./managed-students/view-summary/view-summary.page";
import { TutorViewSummarySubPage } from "./managed-students/view-summary-sub/view-summary-sub.page";
import { TutorViewSummaryDetailPage } from "./managed-students/view-summary-detail/view-summary-detail.page";
import { TutorViewSummaryActivityPage } from "./managed-students/view-summary-activity/view-summary-activity.page";
import { ViewTutorStudentTablePage } from './managed-students/view-tutor-student-table/view-tutor-student-table.page';
import { SignoffSummaryPage } from './managed-students/signoff-summary/signoff-summary.page';
import { SignoffQualUpdatePage } from './managed-students/signoff-qual-update/signoff-qual-update.page';

import { ViewManagedEntryPage } from './managed/view-managed-entry/view-managed-entry.page';
import { ManagedStudentLogPage } from './managed/managed-student-log/managed-student-log.page';
import { ViewManagedStudentPage } from './managed/view-managed-student/view-managed-student.page';
import { ManagedStaffTimesheetsPage } from './managed/managed-staff-timesheets/managed-staff-timesheets.page';
import { ViewStaffUnitStandardPage } from './managed/view-staff-unit-standard/view-staff-unit-standard.page';
import { ViewStaffUnitStandardUpdatePage } from './managed/view-staff-unit-standard-update/view-staff-unit-standard-update.page';
import { StaffViewSummarySubPage } from "./managed/view-summary-sub/view-summary-sub.page";
import { StaffViewSummaryDetailPage } from "./managed/view-summary-detail/view-summary-detail.page";
import { StaffViewSummaryActivityPage } from "./managed/view-summary-activity/view-summary-activity.page";

import { RequestSummaryPage } from './request-review/request-summary/request-summary.page';
import { NewSignoffPage } from './managed-students/new-signoff/new-signoff.page';



const routes: Routes = [
  {
    path: '',
    loadChildren: './login/login.module#LoginPageModule',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  { path: 'main', loadChildren: './main/main.module#MainPageModule' },
  { path: 'search', loadChildren: './main/search/search.module#SearchPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' },
  { path: 'student-log', component: StudentLogPage},
  { path: 'tool-register', component: ToolRegisterPage },
  { path: 'timesheet', component: TimesheetPage },
  { path: 'extras', loadChildren: './extras/extras.module#ExtrasPageModule' },
  { path: 'news', loadChildren: './extras/news/news.module#NewsPageModule' },
  { path: 'discounts', loadChildren: './extras/discounts/discounts.module#DiscountsPageModule' },
  { path: 'supplier', loadChildren: './extras/discounts/supplier/supplier.module#SupplierPageModule' },
  { path: 'to-do-list', component: ToDoListPage },
  { path: 'portfolio', component: PortfolioPage },
  { path: 'portfolio-list', component: PortfolioListPage },
  { path: 'projects', component: ProjectsPage },
  { path: 'new-project', loadChildren: './projects/new-project/new-project.module#NewProjectPageModule' },
  { path: 'edit-project', component: EditProjectPage },
  { path: 'view-project', component: ViewProjectPage },
  { path: 'sub', loadChildren: './main/sub/sub.module#SubPageModule' },
  { path: 'activity', loadChildren: './main/activity/activity.module#ActivityPageModule' },
  { path: 'confirm-entry', loadChildren: './main/confirm-entry/confirm-entry.module#ConfirmEntryPageModule' },
  { path: 'edit-entry', loadChildren: './main/edit-entry/edit-entry.module#EditEntryPageModule' },
  { path: 'another-entry', loadChildren: './main/another-entry/another-entry.module#AnotherEntryPageModule' },
  { path: 'new-tool', loadChildren: './tool-register/new-tool/new-tool.module#NewToolPageModule' },
  { path: 'edit-tool', component: EditToolPage },
  { path: 'new-ts-entry', loadChildren: './timesheet/new-ts-entry/new-ts-entry.module#NewTsEntryPageModule' },
  { path: 'edit-ts-entry', component: EditTsEntryPage },
  { path: 'edit-sl-entry', component: EditSlEntryPage },
  { path: 'new-to-do-list', loadChildren: './to-do-list/new-to-do-list/new-to-do-list.module#NewToDoListPageModule' },
  { path: 'edit-to-do-list', component: EditToDoListPage },
  { path: 'new-to-do-list-item', loadChildren: './to-do-list/new-to-do-list-item/new-to-do-list-item.module#NewToDoListItemPageModule' },
  { path: 'another-to-do-list-item', loadChildren: './to-do-list/another-to-do-list-item/another-to-do-list-item.module#AnotherToDoListItemPageModule' },
  { path: 'edit-to-do-list-item', component: EditToDoListItemPage },
  { path: 'view-to-do-list', component: ViewToDoListPage },
  { path: 'news-provider', loadChildren: './extras/news-provider/news-provider.module#NewsProviderPageModule' },
  { path: 'help', loadChildren: './extras/help/help.module#HelpPageModule' },
  { path: 'update-detail', loadChildren: './settings/update-detail/update-detail.module#UpdateDetailPageModule' },
  { path: 'link-accounts', component: LinkAccountsPage },
  { path: 'link-worker', component: LinkWorkerPage },
  { path: 'link-employer', component: LinkEmployerPage },
  { path: 'managed', loadChildren: './managed/managed.module#ManagedPageModule' },
  { path: 'view-managed-student', component: ViewManagedStudentPage},
  { path: 'managed-staff-timesheets', component: ManagedStaffTimesheetsPage },
  { path: 'view-managed-entry', component: ViewManagedEntryPage },
  { path: 'staff-menu', loadChildren: './managed/staff-menu/staff-menu.module#StaffMenuPageModule' },
  { path: 'managed-students', loadChildren: './managed-students/managed-students.module#ManagedStudentsPageModule' },
  { path: 'create-entry', loadChildren: './managed-students/create-entry/create-entry.module#CreateEntryPageModule' },
  { path: 'student-menu', loadChildren: './managed-students/student-menu/student-menu.module#StudentMenuPageModule' },
  { path: 'managed-student-log', component: ManagedStudentLogPage},
  { path: 'view-tutor-student', component: ViewTutorStudentPage },
  { path: 'view-tutor-student-table', component: ViewTutorStudentTablePage },
  { path: 'view-tutor-unit-standard', component: ViewTutorUnitStandardPage },
  { path: 'view-tutor-unit-standard-update', component: ViewTutorUnitStandardUpdatePage },
  { path: 'view-tutor-unit-standard-table', component: ViewTutorUnitStandardTablePage },
  { path: 'qualification-us', loadChildren: './managed-students/qualification-us/qualification-us.module#QualificationUsPageModule' },
  { path: 'view-us', loadChildren: './managed-students/view-us/view-us.module#ViewUsPageModule' },
  { path: 'qualification-comp', loadChildren: './managed-students/qualification-comp/qualification-comp.module#QualificationCompPageModule' },
  { path: 'qualification-sus', loadChildren: './managed-students/qualification-sus/qualification-sus.module#QualificationSusPageModule' },
  { path: 'view-comp', loadChildren: './managed-students/view-comp/view-comp.module#ViewCompPageModule' },
  { path: 'tutor-view-entry', component: TutorViewEntryPage },
  { path: 'comp-entry', loadChildren: './managed-students/comp-entry/comp-entry.module#CompEntryPageModule' },
  { path: 'us-entry', loadChildren: './managed-students/us-entry/us-entry.module#UsEntryPageModule' },
  { path: 'signup', loadChildren: './managed-students/signup/signup.module#SignupPageModule' },
  { path: 'view-entry', loadChildren: './main/view-entry/view-entry.module#ViewEntryPageModule' },
  { path: 'view-ts-entry', component: ViewTsEntryPage },
  { path: 'view-sl-entry', component: ViewSlEntryPage },
  { path: 'view-summary', component: ViewSummaryPage },
  { path: 'view-summary-sub', component: ViewSummarySubPage },
  { path: 'view-summary-detail', component: ViewSummaryDetailPage },
  { path: 'view-summary-activity', component: ViewSummaryActivityPage },
  { path: 'tutor-view-summary', component: TutorViewSummaryPage },
  { path: 'tutor-view-summary-sub', component: TutorViewSummarySubPage },
  { path: 'tutor-view-summary-detail', component: TutorViewSummaryDetailPage },
  { path: 'tutor-view-summary-activity', component: TutorViewSummaryActivityPage },
  { path: 'staff-view-summary-sub', component: StaffViewSummarySubPage },
  { path: 'staff-view-summary-detail', component: StaffViewSummaryDetailPage },
  { path: 'staff-view-summary-activity', component: StaffViewSummaryActivityPage },
  { path: 'view-tool', component: ViewToolPage },
  { path: 'search-by-us', component: SearchByUsPage },
  { path: 'search-by-us-update', component: SearchByUsUpdatePage },
  { path: 'view-staff-unit-standard', component: ViewStaffUnitStandardPage },
  { path: 'view-staff-unit-standard-update', component: ViewStaffUnitStandardUpdatePage },
  { path: 'student-log-table', component: StudentLogTablePage},
  { path: 'search-by-us-table', component: SearchByUSTablePage},
  { path: 'calculator', loadChildren: './extras/calculator/calculator.module#CalculatorPageModule' },
  { path: 'open-calc', loadChildren: './extras/calculator/open-calc/open-calc.module#OpenCalcPageModule' },
  { path: 'advanced-calc', loadChildren: './extras/calculator/advanced-calc/advanced-calc.module#AdvancedCalcPageModule' },
  { path: 'signoff', loadChildren: './managed-students/signoff/signoff.module#SignoffPageModule' },
  { path: 'new-signoff', component: NewSignoffPage},
  { path: 'signoff-row', loadChildren: './managed-students/signoff-row/signoff-row.module#SignoffRowPageModule' },
  { path: 'signoff-qual', loadChildren: './managed-students/signoff-qual/signoff-qual.module#SignoffQualPageModule' },
  { path: 'signoff-summary', component: SignoffSummaryPage },
  { path: 'signoff-qual-update', component: SignoffQualUpdatePage },
  { path: 'signoff-view', loadChildren: './managed-students/signoff-view/signoff-view.module#SignoffViewPageModule' },
  { path: 'signoff-viviewentry', loadChildren: './managed-students/signoff-viviewentry/signoff-viviewentry.module#SignoffViviewentryPageModule' },
  { path: 'signup-email', loadChildren: './managed-students/signup-email/signup-email.module#SignupEmailPageModule' },
  { path: 'new-portfolio', loadChildren: './portfolio/new-portfolio/new-portfolio.module#NewPortfolioPageModule' },
  { path: 'edit-portfolio', component: EditPortfolioPage },
  { path: 'new-portfolio-list', loadChildren: './portfolio-list/new-portfolio-list/new-portfolio-list.module#NewPortfolioListPageModule' },
  { path: 'edit-portfolio-list', component: EditPortfolioListPage },
  { path: 'request-review', loadChildren: './request-review/request-review.module#RequestReviewPageModule' },
  { path: 'new-request', loadChildren: './request-review/new-request/new-request.module#NewRequestPageModule' },
  { path: 'request-summary', component: RequestSummaryPage},
  { path: 'edit-request', loadChildren: './request-review/edit-request/edit-request.module#EditRequestPageModule' },
  { path: 'request-view-sl-entry', loadChildren: './request-review/view-sl-entry/view-sl-entry.module#RequestViewSlEntryPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
