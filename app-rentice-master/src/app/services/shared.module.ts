import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ReverseStrPipe } from "./reverse-str.pipe";
import { StatusFilterPipe } from "./status-filter.pipe";
import { ImagesProvider } from './images.images';
import { GlobalProvider } from './global-provider';

const PIPES = [
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,

    // Pipes
    ...PIPES,
    ReverseStrPipe,
    StatusFilterPipe
  ],
  declarations: [

    // Pipes
    ...PIPES,
    ReverseStrPipe,
    StatusFilterPipe
  ],
  providers: [
    ImagesProvider,
    GlobalProvider
  ],
  entryComponents: [
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        
      ]
    };
  }
}
