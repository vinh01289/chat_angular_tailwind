import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import * as io from 'socket.io-client';
import { Conversation } from 'src/app/modal/conversation';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  socketUrl = environment.apiUrl.socketUrl;
  socket: any;
  token = localStorage.getItem('accessToken');
  constructor(private route: Router, private http: HttpClient) { }
  getUsersOfConversation(id: string): Observable<any>{
    const reqHeader = new HttpHeaders({
      // tslint:disable-next-line:object-literal-key-quotes
      'Authorization': `Bearer ${this.token}`
    });
    return this.http.get(`${environment.apiUrl.chatUrl}api/v1/conversation/${id}/users`, { headers: reqHeader });
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
  connectionSocket(userId): void {
    this.socket = io(`${this.socketUrl}?userId=${userId}`);
  }
  /**
   * @description listen data from event
   * @param eventName name of event
   * @returns Observable of data
   */
  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      console.log(eventName);
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }
  public getBusyUsers(): Observable<any>{
    this.socket.emit('get-busy-user');
    return Observable.create((observer) => {
        this.socket.on('get-busy-user', (data) => {
          observer.next(data);
        });
    });
  }
  /**
   * @description  video call accept of call
   * @returns void
   */
  public videoCallAccepted(data): void {
    this.socket.emit('video-call-accept', {
      data
    });
  }
  public videoCallRequest(data): void {
    console.log('video call anc', data);
    this.socket.emit('video-call', {
      data
    });
  }
  /**
   * @description send event of call rejected
   * @param toid id of receiver
   * @returns void
   */
  public videoCallRejected(toId): void {
    this.socket.emit('video-call-reject', {
      toId
    });
  }
  /**
   * @description send event of end call
   * @param from id of sender
   * @param to id of receiver
   * @returns void
   */
   public endVideoCall(from, to): void {
    this.socket.emit('end-video-call', {
      fromId : from,
      toId: to
    });
  }
  /**
   * @description this user busing
   * @returns void
   */
  public busyNow(): void{
    this.socket.emit('busy-user');
  }
}
