import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConversationComponent } from './conversation/conversation.component';
import { FriendComponent } from './friend/friend.component';
import { MessageComponent } from './message/message.component';
import { HomeComponent } from './home/home.component';
import { ShareModule } from '../Shared/share.module';
import { HomeRoutingModule } from './home-routing.module';
import { SearchComponent } from './search/search.component';



@NgModule({
  declarations: [ HomeComponent, ConversationComponent, FriendComponent, MessageComponent, SearchComponent ],
  imports: [
    CommonModule,
    FormsModule,
    ShareModule,
    ReactiveFormsModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
