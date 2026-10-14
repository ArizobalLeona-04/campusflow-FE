import { Component, OnInit } from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { CreateModal } from './create-modal/create-modal';
import { RoomService } from '../services/room.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateModal, RouterModule],
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
  selectedDate: Date = new Date();
  bookedRooms: any[] = [];
  
  currentUserDisplayName: string = ''; 
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

      this.roomService.bookings$.subscribe(data => {
      this.savedBookings = data;
    });
    this.loadBookings();
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

  console.log('Checking conflict for:', { selectedDate, selectedRoom, selectedPeriod });
  console.log('Current Bookings in Memory:', this.roomService.allBookingsValue);

  const isOccupied = this.roomService.allBookingsValue.some((b: any) => {
    const dbDate = b.booking_date.split('T')[0];
    const match = dbDate === selectedDate && 
                  b.room_name === selectedRoom && 
                  b.period === selectedPeriod;
    
    if (match) console.log('MATCH FOUND! Blocking booking.');
    return match;
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
    error: (err) => alert('Server error: Could not save.')
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
    if (!b.booking_date) return false;
    
const dateObj = new Date(b.booking_date);
    const dbDateOnly = dateObj.getFullYear() + '-' + 
                       String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(dateObj.getDate()).padStart(2, '0');
      
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
  }

  closeView() {
    this.isViewOpen = false;
    this.selectedBooking = null;
    this.showCancelConfirm = false;
  }

  confirmCancel() {
    if (this.selectedBooking && this.selectedBooking.id) {
      this.http.delete(`http://localhost:3000/api/bookings/${this.selectedBooking.id}`).subscribe({
        next: () => {
          this.closeView();
          this.loadBookings();
        },
        error: () => console.error('Error cancelling booking.')
      });
    }
  }

  openBookingModal(room: string, periodLabel: string) {
    const existing = this.getBooking(room, periodLabel);
    if (existing) {
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
    return [prefix + ' 201', prefix + ' 202', prefix + ' 203', prefix + ' 204', prefix + ' 205'];
  }

  get dateForInput(): string {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleNewBooking(data: any) { this.loadBookings(); this.isModalOpen = false; }
  closeModal() { this.isModalOpen = false; }
  
  onBookingCreated() { this.refreshBookings();
  }

  onSignOut() { 
    localStorage.removeItem('currentUser'); 
    localStorage.removeItem('campus_bookings');
    this.router.navigate(['/login']); 
  }
}