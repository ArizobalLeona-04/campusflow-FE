import { Component, OnInit } from '@angular/core'; 
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { CreateModal } from './create-modal/create-modal';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, NgStyle, FormsModule, CreateModal, RouterModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.scss'],
  providers: [DatePipe]
})
export class BookingComponent implements OnInit { 

  bookingForm = new FormGroup({
    room: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    period: new FormControl('', Validators.required),
    subject: new FormControl('', Validators.required),
    faculty: new FormControl('')
  });

  selectedBuilding: string = 'SAC Building';
  selectedFloor: number = 1;
  floors: number[] = [1, 2, 3, 4];

  selectedDate: Date = new Date();
  bookedRooms: any[] = [];
  
  currentUserDisplayName: string = ''; 
  currentUserRole: string = 'user';
  isModalOpen: boolean = false;
  targetRoom: string = '';
  targetPeriod: string = '';
  isViewOpen: boolean = false;
  selectedBooking: any = null;
  savedBookings: any[] = [];
  showCancelConfirm: boolean = false;

  buildings: string[] = ['SAC Building', 'NAC Building', 'WAC Building', 'EAC Building'];
  periods = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH',    time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  constructor(public router: Router, private roomService: RoomService, private http: HttpClient) {}

  ngOnInit() {
    const user = this.roomService.getCurrentUser();
    this.currentUserDisplayName = `${user?.firstName || 'Guest'} ${user?.lastName || ''}`;

    // Role check logic including @admin.liceo.edu.ph
    const email = user?.email?.toLowerCase() || '';
    const isAdminDomain = email.endsWith('@admin.com') || email.endsWith('@admin.liceo.edu.ph');
    
    this.currentUserRole = user?.role || (isAdminDomain ? 'admin' : 'user');

    this.roomService.bookings$.subscribe(data => {
      this.savedBookings = data || [];
    });
    this.loadBookings();
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  // True if the logged-in user is the one who made the selected booking
  get isBookingOwner(): boolean {
    const bookedBy = (this.selectedBooking?.booked_by || '').trim().toLowerCase();
    const me = (this.currentUserDisplayName || '').trim().toLowerCase();
    return !!bookedBy && bookedBy === me;
  }

  // Only the booking's owner or an admin can cancel it
  get canCancel(): boolean {
    return this.isAdmin || this.isBookingOwner;
  }

  saveBooking() {
    const formValue = this.bookingForm.value;
    
    const rawDate = formValue.date as any;
    if (!rawDate) {
      alert('Please select a date first.');
      return;
    }

    const selectedDate = new Date(rawDate).toISOString().split('T')[0];
    const selectedRoom = formValue.room;
    const selectedPeriod = formValue.period;

    const isOccupied = this.roomService.allBookingsValue.some((b: any) => {
      const dbDate = b.booking_date.split('T')[0];
      return dbDate === selectedDate && 
             b.room_name === selectedRoom && 
             b.period === selectedPeriod;
    });

    if (isOccupied) {
      alert(`CONFLICT: ${selectedRoom} is already booked for ${selectedPeriod} on ${selectedDate}.`);
      return;
    }

    this.http.post('http://localhost:3000/api/bookings', formValue).subscribe({
      next: () => {
        alert('Booking saved successfully!');
        this.roomService.loadAllBookings();
        this.isModalOpen = false;
      },
      error: () => {
        this.handleNewBooking(formValue);
      }
    });
  }

  refreshBookings() {
    this.roomService.loadAllBookings();
  }

  loadBookings() {
    this.roomService.loadAllBookings();
  }

  getBooking(room: string, periodLabel: string) {
    const formattedDate = this.dateForInput;

    return this.savedBookings.find(b => {
      if (!b || !b.booking_date) return false;
      
      let dbDateOnly = '';
      if (typeof b.booking_date === 'string') {
        dbDateOnly = b.booking_date.split('T')[0];
      } else {
        const dateObj = new Date(b.booking_date);
        dbDateOnly = dateObj.getFullYear() + '-' + 
                     String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(dateObj.getDate()).padStart(2, '0');
      }
        
      return b.room_name === room && 
             b.period === periodLabel && 
             dbDateOnly === formattedDate;
    });
  }

  getBuildingStyle(roomName: string) {
    const building = roomName.split(' ')[0]; 
    const colors: { [key: string]: string } = {
      'SAC': '#f5a81c', 
      'NAC': '#4a0000', 
      'WAC': '#326284', 
      'EAC': '#E68D76'
    };

    return {
      'background-color': colors[building] || '#e9e9e9',
      'color': 'white',
      'padding': '8px',
      'border-radius': '6px',
      'cursor': 'pointer',
      'font-size': '0.85rem',
      'text-align': 'center'
    };
  }

  onDateChange(event: any) {
    const val = event.target.value;
    if (val) {
      const parts = val.split('-');
      this.selectedDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      this.loadBookings();
    }
  }

  changeDate(days: number) {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    this.selectedDate = newDate;
    this.loadBookings();
  }

  selectBuilding(building: string) {
    this.selectedBuilding = building;
    this.selectedFloor = 1;
  }

  closeView() {
    this.isViewOpen = false;
    this.selectedBooking = null;
    this.showCancelConfirm = false;
  }

  confirmCancel() {
    // Guard: only the booking owner or an admin can cancel
    if (!this.canCancel) return;

    if (this.selectedBooking && this.selectedBooking.id) {
      this.http.delete(`http://localhost:3000/api/bookings/${this.selectedBooking.id}`).subscribe({
        next: () => {
          this.removeLocalBooking(this.selectedBooking.id);
        },
        error: () => {
          this.removeLocalBooking(this.selectedBooking.id);
        }
      });
    }
  }

  private removeLocalBooking(id: any) {
    const updated = this.savedBookings.filter(b => b.id !== id);
    this.roomService.updateBookings(updated);
    this.closeView();
  }

  openBookingModal(room: string, periodLabel: string) {
    const existing = this.getBooking(room, periodLabel);
    if (existing) {
      // Everyone can view booking info; only the owner or an admin sees the cancel option
      this.selectedBooking = existing;
      this.isViewOpen = true; 
    } else {
      this.targetRoom = room;
      this.targetPeriod = periodLabel;
      this.isModalOpen = true; 
    }
  }

  get rooms(): string[] {
    const prefix = this.selectedBuilding.split(' ')[0];
    const floor = this.selectedFloor;
    return [
      `${prefix} ${floor}01`, 
      `${prefix} ${floor}02`, 
      `${prefix} ${floor}03`, 
      `${prefix} ${floor}04`, 
      `${prefix} ${floor}05`
    ];
  }

  get dateForInput(): string {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleNewBooking(data: any) { 
    if (!data) return;

    const newBooking = {
      id: Date.now(),
      room_name: data.room_name || this.targetRoom,
      booking_date: data.booking_date || this.dateForInput,
      period: data.period || this.targetPeriod,
      subject: data.subject || 'Sample Subject',
      booked_by: data.booked_by || this.currentUserDisplayName,
      booking_type: data.booking_type || 'One-Time',
      until_date: data.until_date || 'Ending of session',
      status: 'Confirmed'
    };

    this.roomService.addBooking(newBooking);
    this.isModalOpen = false; 
  }

  closeModal() { 
    this.isModalOpen = false; 
  }
  
  onBookingCreated() { 
    this.refreshBookings();
  }

  onSignOut() { 
    localStorage.removeItem('currentUser'); 
    this.router.navigate(['/login']); 
  }
}