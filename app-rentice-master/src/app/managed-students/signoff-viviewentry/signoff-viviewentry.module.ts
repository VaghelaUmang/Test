import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SignoffViviewentryPage } from './signoff-viviewentry.page';

const routes: Routes = [
  {
    path: '',
    component: SignoffViviewentryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SignoffViviewentryPage]
})
export class SignoffViviewentryPageModule {}
