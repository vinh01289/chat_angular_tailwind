import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  lstData: any;
  idserarc: any;
  @Input() phonenumber: string;
  @ViewChild('search') search: ElementRef;
  constructor(public chatService: ChatService) {
   }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log('phone: ', this.phonenumber);
    this.chatService.findUser(this.phonenumber).subscribe(res => {
      this.lstData = res;
      this.idserarc = res.name;
      console.log('lstData', this.lstData);
    });
  }
}
