import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdvancedCalcPage } from './advanced-calc.page';

const routes: Routes = [
  {
    path: '',
    component: AdvancedCalcPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdvancedCalcPage]
})
export class AdvancedCalcPageModule {}
