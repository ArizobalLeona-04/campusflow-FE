import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private bookingsSubject = new BehaviorSubject<any[]>([]);
  public bookings$: Observable<any[]> = this.bookingsSubject.asObservable();

  constructor() {
    // 1. Initial load of bookings from shared localStorage
    this.loadAllBookings();

    // 2. Real-time multi-tab listener: syncs bookings across different tabs/users automatically
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'localBookings') {
        this.loadAllBookings();
      }
    });
  }

  get allBookingsValue(): any[] {
    return this.bookingsSubject.value;
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  loadAllBookings(): void {
    const saved = localStorage.getItem('localBookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.bookingsSubject.next(parsed);
      } catch (e) {
        this.bookingsSubject.next([]);
      }
    } else {
      this.bookingsSubject.next([]);
    }
  }

  addBooking(newBooking: any): void {
    const current = this.bookingsSubject.value;
    const updated = [...current, newBooking];
    
    // Persist to shared localStorage key for all accounts
    localStorage.setItem('localBookings', JSON.stringify(updated));
    this.bookingsSubject.next(updated);
  }

  updateBookings(updatedBookings: any[]): void {
    localStorage.setItem('localBookings', JSON.stringify(updatedBookings));
    this.bookingsSubject.next(updatedBookings);
  }

  clearBookings(): Observable<any> {
    localStorage.removeItem('localBookings');
    this.bookingsSubject.next([]);
    return of(true);
  }
}