import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      catchError(() => {
        return of([
          { id: 1, firstName: 'Leona', lastName: 'Arizobal' },
          { id: 2, firstName: 'Precious', lastName: 'Fillalan' },
          { id: 3, firstName: 'Euniece Kyle', lastName: 'Puerto' }
        ]);
      })
    );
  }

  createBooking(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings`, payload).pipe(
      catchError(() => {
        const localData = localStorage.getItem('localBookings');
        let currentBookings: any[] = localData ? JSON.parse(localData) : [];

        const newBooking = {
          id: Date.now(),
          ...payload
        };

        currentBookings.push(newBooking);
        localStorage.setItem('localBookings', JSON.stringify(currentBookings));

        return of({ success: true, booking: newBooking });
      })
    );
  }
}