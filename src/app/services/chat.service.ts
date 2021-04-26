import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Conversation } from '../modal/conversation';
import { Friend } from '../modal/friend';
import { Message } from '../modal/message';
import { UserProfile } from '../modal/user';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  token = localStorage.getItem('accessToken');
  listMessage: Message[] = [];
  listFriend: Friend[] = [];
  listConversation: BehaviorSubject<Conversation[]>;
  listUser: UserProfile [] = [];
  userSearchResult: BehaviorSubject<UserProfile>;
  changeData(): Observable<any>{
    return this.listConversation.asObservable();
  }

  changeUserResult(): Observable<any>{
    return this.userSearchResult.asObservable();
  }
  constructor(private route: Router, private http: HttpClient) {
    this.listConversation = new BehaviorSubject<Conversation[]>(null);
    this.userSearchResult = new BehaviorSubject<UserProfile>(null);
   }
   getToken(): string
   {
     return localStorage.getItem('accessToken');
   }
  getMessage(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl.chatUrl}api/v1/messages/${id}`);
  }
  getApiFriend(): Observable<any>{
    const reqHeader = new HttpHeaders({
      // tslint:disable-next-line:object-literal-key-quotes
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get(`${environment.apiUrl.chatUrl}api/v1/friend`, {headers: reqHeader});
  }

  getConversation(): void{
    const reqHeader = new HttpHeaders({
      // tslint:disable-next-line:object-literal-key-quotes
      'Authorization': `Bearer ${this.getToken()}`
    });
    this.http.get(`${environment.apiUrl.chatUrl}api/v1/conversation`, { headers: reqHeader }).subscribe(
    (res: Conversation[]) => {
        this.listConversation.next(res);
    }
  );
  }
  sentMessage(content: string, conversationId: string, senderId: string): Observable<any>{
    return new Observable(obs => {
    this.http.post(`${environment.apiUrl.chatUrl}api/v1/messages`, {
      content,
      conversationId,
      senderId
    }, {responseType: 'text'}).subscribe(res => {
      obs.next(res);
      obs.complete();
    }, er => {
       obs.error('Loi');
       obs.complete();
    });
    }) ;
  }

  findUser(phoneNumber: string): Observable<any>{
    return this.http.post(`${environment.apiUrl.chatUrl}api/v1/users/find-user`, {
      phoneNumber
    });
  }
}
