import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
private bookingsSubject = new BehaviorSubject<any[]>([]);
public bookings$ = this.bookingsSubject.asObservable();

get allBookingsValue() {
  return this.bookingsSubject.value;
}

  constructor(private http: HttpClient) {
    this.loadAllBookings();
  }

loadAllBookings() {
    this.http.get<any[]>('http://localhost:3000/api/bookings').subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = a.booking_date.split('T')[0];
          const dateB = b.booking_date.split('T')[0];
          return dateA.localeCompare(dateB);
        });
        this.bookingsSubject.next(sortedData);
      },
      error: (err) => console.error('Failed to load bookings from API', err)
    });
  }

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : { firstName: 'Guest', lastName: '' };
  }

clearBookings() {
  return this.http.delete('http://localhost:3000/api/bookings/clear-today');
}

  updateBookings(bookings: any[]) {
    this.bookingsSubject.next(bookings);
  }
}