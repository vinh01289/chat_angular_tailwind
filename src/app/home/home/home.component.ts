import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Conversation } from 'src/app/modal/conversation';
import { Message } from 'src/app/modal/message';
import { UserProfile } from 'src/app/modal/user';
import { AuthSevice } from 'src/app/services/auth-sevice.service';
import { ChatService } from 'src/app/services/chat.service';
import { SocketService } from 'src/app/services/socket.service';
import { ConversationComponent } from '../conversation/conversation.component';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    user: UserProfile = null;
    isShowConversation = false;
    Conversation: Conversation;
    show = false;
    Content: string;
    callingInfo = { name: '', content: '', type: '' };
    receiverId: string;
    showModal = false;
    phoneNumber: string;
    @ViewChild(ConversationComponent) conversationComponent: ConversationComponent;
    @ViewChild(SearchComponent) searchComponent: SearchComponent;

  constructor(private auth: AuthSevice, public chatService: ChatService, private socketService: SocketService, private route: Router) { }

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.chatService.getConversation();
    this.p_getChat();
    // Listen event call
    this.socketService.listen('video-call').subscribe(data => {
      this.callingInfo.name = data.toFrom;
      this.receiverId = data.toFrom;
      this.callingInfo.content = 'You have call ....';
      this.callingInfo.type = data.type;
      localStorage.setItem('callerSignal', JSON.stringify(data.signal));
      this.showModal = true;
    });
    this.getPhone(this.phoneNumber);
  }

  public onToggle(): void {
    this.isShowConversation = !this.isShowConversation;
  }
  public onGetMessage(item: any): void {
    this.Content = '';
    this.Conversation = item;
    const newLocal = this;
    newLocal.isShowConversation = true;
    this.chatService.getMessage(item.conversationId).subscribe(res => {
      this.chatService.listMessage = res;
      console.log('list message', this.chatService.listMessage);
    });
  }

  sendMessage(content: string): void {
    if (!content) {
      return;
    }
    if (this.Conversation.conversationId) {
      const customObj = new Message();
      customObj.content = content;
      customObj.conversationId = this.Conversation.conversationId;
      customObj.senderId = this.user.id;
      this.chatService.sentMessage(customObj.content, customObj.conversationId, customObj.senderId).
        subscribe(res => {
          this.onGetMessage(this.Conversation);
          this.Content = null;
          this.chatService.getConversation();
        });
    }
  }
  audioCall(): void{
    console.log('audio');
    window.open(`/video?myUser=${this.user.id}&conversationId=${this.Conversation.conversationId}&statusCall=audio-call`, '', 'width:70%,height:60%,align: center');
  }

  videoCall(): void{
    window.open(`/video?myUser=${this.user.id}&conversationId=${this.Conversation.conversationId}&statusCall=video-call`, '', 'width:70%,height:60%,align: center');
  }

  acceptCall(): void{
    this.showModal = false;
    window.open(`/video?myUser=${this.user.id}&receiverId=${this.receiverId}&statusCall=accept&type=${ this.callingInfo.type}`, '', 'width:70%,height:60%,align: center');
  }

  rejectCall(): void{
    this.showModal = false;
    console.log('receiveId', this.receiverId);
    this.socketService.videoCallRejected(this.receiverId);
  }
  getPhone(phonenumber: string): void {
      this.phoneNumber = phonenumber;
  }

  showConversation(): void{
    this.searchComponent.search.nativeElement.style.display = 'none';
    this.conversationComponent.conversation.nativeElement.style.display = 'block';
  }
  showSearch(): void{
    this.searchComponent.search.nativeElement.style.display = 'block';
    this.conversationComponent.conversation.nativeElement.style.display = 'none';
  }
  logOut(): void{
    this.auth.logOut();
    this.route.navigate(['login']);
  }
  private p_getChat()
  {
    this.socketService.listen('chat').subscribe(data => {
      if (this.Conversation != null && data.conversationId === this.Conversation.conversationId) {
        this.chatService.listMessage = [...this.chatService.listMessage, ...[data]];
      }
      this.chatService.getConversation();
    });
  }
}
