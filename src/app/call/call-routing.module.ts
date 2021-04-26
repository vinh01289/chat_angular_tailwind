import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallComponent } from './call/call.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: CallComponent },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallRoutingModule { }
