import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(inputDate: string): string {
    const date  = new Date(inputDate);
    console.log('landz', inputDate);
    const datePipe = new DatePipe('en-US');
    const today = new Date();
    const diffTime: number = Math.abs(today.getTime() - date.getTime());
    console.log('difftime', diffTime);
    const MILISECONDS_OF_WEEK = 24 * 60 * 60 * 7 * 1000;
    if (date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()){
      return datePipe.transform(date, 'H:mm');
    }


    if (diffTime < MILISECONDS_OF_WEEK){
      return datePipe.transform(date, 'EEE');
    }
    else{
      return datePipe.transform(date, 'dd/MM/YYYY');
    }
  }

}
