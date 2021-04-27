import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModelInitializationService } from '../modeling-tool/services/model-initialization-resolver.service';
import { ShareModelComponent } from './containers/share-model/share-model.component';

const routes: Routes =
  [
    {
      path: '',
      component: ShareModelComponent,
      resolve: { resolver: ModelInitializationService }
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShareModelRoutingModule { }
