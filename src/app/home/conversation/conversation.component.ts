import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UserProfile } from 'src/app/modal/user';
import { AuthSevice } from 'src/app/services/auth-sevice.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit {
  isActive = true;
  @Output() ConversationId = new EventEmitter<string>();
  lstData: Array<any> = [];
  activeElement: any;
  @ViewChild('conversation', {read: ElementRef}) conversation: ElementRef;
  constructor(public chatService: ChatService) {
    this.chatService.changeData().subscribe( res => {
      this.lstData = res;
    });
  }

  ngOnInit(): void {
  }
  // tslint:disable-next-line:typedef
  getIdConversation(item) {
    this.activeElement  = item.conversationId;
    this.ConversationId.emit(item);
  }
}
