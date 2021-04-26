import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AuthSevice } from 'src/app/services/auth-sevice.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() id: any;
  @ViewChild('message') message: ElementRef;
  constructor(public chatService: ChatService, public authen: AuthSevice) {
  }
  ngOnInit(): void {
    this.scrollToBottom();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewChecked(): void {
        this.scrollToBottom();
        const show = true;
    }
  scrollToBottom(): void {
        try {
            this.message.nativeElement.scrollTop = this.message.nativeElement.scrollHeight;
        } catch (err) { }
    }
}
