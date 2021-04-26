import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CallService } from '../services/call.service';
import * as Peer from 'simple-peer';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {
  showModal = false;
  flag = false;
  flagCall = false;
  isVideoRejected = false;
  statusCall: string;
  userId: string;
  receiverId: string;
  conversationId: string;
  calling = { content: '' };
  isScreenSharingEnabled = false;
  isScreenSharingDisabled = false;
  isVideoEnabled = false;
  isVideoDisabled = false;
  isCallAccepted = false;
  localStream: any;
  myStream: any;
  remoteStream: any;
  peerConnection: any;
  isAudioEnabled = false;
  freeReceiver = [];
  listBusyUser: string[] = [];
  VIDEO_CONFIG = {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
  };

  constructor(private changeDetector: ChangeDetectorRef, private callService: CallService) {
  }
  ngOnInit(): void {
    // statusCall is status of video
    this.statusCall = new URLSearchParams(window.location.search).get('statusCall');
    // userId is id of caller
    this.userId = new URLSearchParams(window.location.search).get('myUser');
    this.callService.connectionSocket(this.userId);
    if (this.statusCall === 'accept') {
      console.log('video accept call');
      const type = new URLSearchParams(window.location.search).get('type');
      // receiverId is id of receiver
      this.receiverId = new URLSearchParams(window.location.search).get('receiverId');
      console.log('type: ', type);
      // type = 'video' call function accept with video call
      // type = 'audio' call function accept with audio call
      if (type === 'video') {
        this.acceptCall();
      } else {
        const config = {
          video: false,
          audio: true,
        };
        this.acceptCall(config);
      }
    } else if (this.statusCall === 'video-call') {
      this.conversationId = new URLSearchParams(window.location.search).get('conversationId');
      console.log('video run call ');
      this.videoCallUser();
    } else if (this.statusCall === 'audio-call') {
      this.conversationId = new URLSearchParams(window.location.search).get('conversationId');
      console.log('audio', this.conversationId);
      this.audioCallUser();
    }
    this.callService.listen('video-call-reject').subscribe(data => {
      this.calling.content = data;
      this.showModal = true;
      console.log('video-call-reject', this.conversationId);
      console.log('video-call-reject', this.userId);
      this.callService.sentMessage('you missed', this.conversationId, this.userId).subscribe(res => {
        console.log('send success');
      });
      setTimeout(() => {
        this.endCall();
      }, 2000);
    });
    this.callService.listen('video-call-ended').subscribe(data => {
      if (this.conversationId !== undefined){
        this.callService.sentMessage('Call is end', this.conversationId, this.userId).subscribe(res => {
          console.log('nhan thanh cong');
        });
      }
      console.log('lang nghe end');
      this.localStream.getTracks().forEach((track: any) => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      window.close();
    });

  }

  getLocalStream(config?: any): void {
    let mediaConfig = {
      video: this.VIDEO_CONFIG,
      audio: this.isAudioEnabled,
    };
    if (config) {
      mediaConfig = config;
    }
    const n = navigator as any;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
    n.getUserMedia(
      mediaConfig,
      (stream: MediaStream) => {
        this.myStream = stream;
        const lv = document.getElementById('local-video') as HTMLVideoElement;
        lv.srcObject = stream;
        lv.controls = false;
        lv.muted = true;
        lv.volume = 0;
        this.localStream = this.myStream;
        this.flag = true;
      },
      (err: any) => {
        console.error(err);
        this.flag = true;
      }
    );
  }

  // Call accept
  async acceptCall(config?: any): Promise<void> {
    this.getLocalStream(config);
    while (!this.flag) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (config === undefined || config === null) {
      this.isScreenSharingEnabled = true;
      this.isScreenSharingDisabled = false;
      this.isVideoEnabled = false;
      this.isVideoDisabled = true;
    } else {
      this.isScreenSharingEnabled = false;
      this.isScreenSharingDisabled = false;
      this.isVideoEnabled = true;
      this.isVideoDisabled = false;
    }
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.myStream,
    });
    this.peerConnection = peer;
    peer.on('signal', (data) => {
      console.log('send accept', data);
      this.callService.videoCallAccepted({ signal: data, toId: this.receiverId });
    });

    peer.on('stream', (stream) => {
      const lv = document.getElementById('remote-video') as HTMLVideoElement;
      lv.srcObject = stream;
      lv.controls = false;
      lv.muted = true;
      lv.volume = 0;
      this.remoteStream = stream;
    });
    peer.signal(JSON.parse(localStorage.getItem('callerSignal')));
  }

  // Video call
  async videoCallUser(): Promise<void> {
    this.getLocalStream();
    while (!this.flag) {
      await new Promise((r) => setTimeout(r, 100));
    }
    this.isScreenSharingEnabled = true;
    this.isScreenSharingDisabled = false;
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.myStream,
    });
    await this.getFreeReceive(this.conversationId);
    while (!this.flagCall) {
      await new Promise((r) => setTimeout(r, 100));
    }
    console.log('recive: ', this.freeReceiver);
    this.peerConnection = peer;
    peer.on('signal', (data) => {
      this.freeReceiver.forEach(receiverId => {
        this.callService.videoCallRequest({
          signalData: data,
          toFrom: this.userId,
          toId: receiverId,
          type: 'video', // video call
        });
      });
    });

    peer.on('stream', (stream) => {
      const lv = document.getElementById('remote-video') as HTMLVideoElement;
      lv.srcObject = stream;
      lv.controls = false;
      lv.muted = true;
      lv.volume = 0;
      this.remoteStream = stream;
    });
    this.callService.listen('video-call-accept')
      .subscribe(data => {
        this.isCallAccepted = true;
        peer.signal(data);
      });
  }

  // Audio call
  async audioCallUser(): Promise<void> {
    const config = {
      video: false,
      audio: true
    };
    this.getLocalStream(config);
    while (!this.flag) {
      await new Promise((r) => setTimeout(r, 100));
    }
    this.isScreenSharingEnabled = false;
    this.isScreenSharingDisabled = false;
    this.isVideoEnabled = true;
    this.isVideoDisabled = false;
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.myStream,
    });
    await this.getFreeReceive(this.conversationId);
    while (!this.flagCall) {
      await new Promise((r) => setTimeout(r, 100));
    }
    console.log(' reciver: ', this.freeReceiver);
    this.peerConnection = peer;
    peer.on('signal', (data) => {
      console.log(' signar: ', data);
      console.log(' userId: ', this.userId);
      console.log(' receiveId: ', this.freeReceiver);
      this.freeReceiver.forEach(receiverId => {
        this.callService.videoCallRequest({
          signalData: data,
          toFrom: this.userId,
          toId: receiverId,
          type: 'audio', // audio call
        });
      });
    });

    peer.on('stream', (stream) => {
      const lv = document.getElementById('remote-video') as HTMLVideoElement;
      lv.srcObject = stream;
      lv.controls = false;
      lv.muted = true;
      lv.volume = 0;
      this.remoteStream = stream;
    });
    this.callService.listen('video-call-accept')
      .subscribe(data => {
        this.isCallAccepted = true;
        peer.signal(data);
      });
  }


  // share Screen
  async shareScreen(): Promise<void> {
    const gdmOptions = {
      video: {
        cursor: 'always',
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    };
    const n = navigator as any;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
    const screenCaptureStream = await n.mediaDevices.getDisplayMedia(
      gdmOptions
    );
    this.isScreenSharingEnabled = false;
    this.isScreenSharingDisabled = true;
    this.isVideoEnabled = false;
    this.isVideoDisabled = true;
    const oldTrack = this.localStream.getVideoTracks()[0];
    const lv = document.getElementById('local-video') as HTMLVideoElement;
    lv.srcObject = screenCaptureStream;
    lv.controls = false;
    lv.muted = true;
    lv.volume = 0;
    this.peerConnection.replaceTrack(oldTrack, screenCaptureStream.getVideoTracks()[0], this.localStream);
    this.myStream = screenCaptureStream;
  }

  async exitShareScreen(): Promise<void> {
    const mediaConfig = {
      video: this.VIDEO_CONFIG,
      audio: this.isAudioEnabled,
    };
    const n = navigator as any;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
    const backStream = await n.mediaDevices.getUserMedia(
      mediaConfig);
    this.isScreenSharingEnabled = true;
    this.isScreenSharingDisabled = false;
    this.isVideoEnabled = false;
    this.isVideoDisabled = true;
    const lv = document.getElementById('local-video') as HTMLVideoElement;
    lv.srcObject = backStream;
    lv.controls = false;
    lv.muted = true;
    lv.volume = 0;
    this.peerConnection.replaceTrack(this.localStream.getVideoTracks()[0], backStream.getVideoTracks()[0], this.localStream);
    this.myStream = backStream;
  }
  endCall(): void {
    window.close();
  }

  async getFreeReceive(conversationId): Promise<any> {
    const listUserBusyId = await this.getBusyUsers();
    listUserBusyId.forEach(userId => {
      if (userId === this.userId) {
        this.calling.content = 'Please await, you have a call ';
        window.close();
      }
    });
    this.callService.getUsersOfConversation(conversationId).subscribe(res => {
      const listUserOfConversation = res;
      console.log('res conversation', res);
      this.flagCall = true;
      // Delete my userId in listUserOfConversation
      const index = listUserOfConversation.indexOf(this.userId);
      listUserOfConversation.splice(index, 1);
      console.log('list abc',  listUserOfConversation);
      listUserOfConversation.forEach(receiverId => {
        this.videoWithUserId(listUserBusyId, receiverId);
      });
    });
  }

  // Get list busy user
  async getBusyUsers(): Promise<string[]> {
    let check = false;
    this.callService.getBusyUsers().subscribe(res => {
      this.listBusyUser = res;
      check = true;
    });
    if (!check) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return this.listBusyUser;
  }
  // Video call to userId
  videoWithUserId(listUserId, receiverId): any {
    let check = false;
    listUserId.forEach(userId => {
      console.log(userId + ' : ' + receiverId);
      if (userId === receiverId) {
        console.log('Goi khong thanh cong mai ban');
        this.showModal = true;
        this.calling.content = 'Receiver busy';
        this.callService.sentMessage('You have missed to name', this.conversationId, this.userId);
        window.close();
        // gui message qua socket de ben kia nhan tin nhan
        check = true;
        return;
      }
    });
    if (check === false) {
      console.log('Goi thanh cong');
      // Save list users not busy
      this.freeReceiver.push(receiverId);
    }
  }
  close(): void {
    console.log('Button cancel clicked!');
    this.isVideoRejected = false;
    this.changeDetector.detectChanges();
  }

  @HostListener('window:beforeunload', ['$event'])
  async beforeunloadHandler(event): Promise<void> {
    this.localStream.getTracks().forEach((track: any) => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
    if (this.statusCall === 'accept') {
      this.callService.endVideoCall(this.userId, this.receiverId);
    } else {
      this.callService.sentMessage('Call is ended', this.conversationId, this.userId).subscribe();
      this.freeReceiver.forEach(receiverId => {
        this.callService.endVideoCall(this.userId, receiverId);
      });
    }
    this.freeReceiver = [];
  }

}
