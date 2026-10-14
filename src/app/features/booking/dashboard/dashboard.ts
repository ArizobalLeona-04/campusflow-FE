import { Component, OnInit, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  // --- Dashboard Stats ---
  maxCapacity: number = 20; 
  totalRooms: number = 20;
  activeBookings: number = 0;
  availableNow: number = 20;

  @ViewChild(BaseChartDirective) chart: any;

  // --- UI State ---
  isListVisible: boolean = false;
  currentDateRange: number = 7;
  todaysBookings: any[] = [];
  buildings: string[] = ['SAC', 'NAC', 'WAC', 'EAC'];

  private allSystemBookings: any[] = [];
  private roomService = inject(RoomService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private buildingColorMap: { [key: string]: string } = {
    'SAC': '#f5a81c', 'NAC': '#4a0000', 'WAC': '#326284', 'EAC': '#E68D76'
  };

  // --- Chart Setup ---
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Booking Volume',
      fill: true,
      tension: 0.4,
      borderColor: '#8b0000',
      backgroundColor: 'rgba(152, 8, 8, 0.15)',
    }]
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
  };

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.roomService.bookings$.subscribe((allBookings: any[]) => {
      if (allBookings) {
        this.allSystemBookings = allBookings;
        this.updateDashboardStats(allBookings);
        this.processDataByRange(this.currentDateRange);
        this.cdr.detectChanges();
      }
    });
    this.roomService.loadAllBookings();
  }

  
  updateDashboardStats(allBookings: any[]): void {
    const today = this.formatDate(new Date());

    this.todaysBookings = allBookings.filter(b => {
      if (!b.booking_date) return false;
      const bDate = b.booking_date.includes('T') ? b.booking_date.split('T')[0] : b.booking_date;
      return bDate === today;
    });

    this.activeBookings = this.todaysBookings.length;
    
    this.availableNow = this.maxCapacity - this.activeBookings;
    this.totalRooms = this.maxCapacity; 
  }

  checkConflict(roomName: string, date: string, period: string): boolean {
    return this.allSystemBookings.some(b => 
      b.room_name === roomName && 
      b.booking_date.includes(date) && 
      b.period === period
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  processDataByRange(days: number): void {
    this.currentDateRange = days;
    this.updateCharts(this.allSystemBookings);
  }

  updateCharts(bookingsToUse: any[]): void {
    const dateMap: { [key: string]: number } = {};
    bookingsToUse.forEach(b => {
      const d = b.booking_date.split('T')[0];
      dateMap[d] = (dateMap[d] || 0) + 1;
    });

    const sortedDates = Object.keys(dateMap).sort();
    this.lineChartData.labels = sortedDates;
    this.lineChartData.datasets[0].data = sortedDates.map(d => dateMap[d]);

    this.barChartData.labels = sortedDates;
    this.barChartData.datasets = this.buildings.map(bName => ({
      label: bName,
      data: sortedDates.map(date =>
        bookingsToUse.filter(b => b.booking_date.includes(date) && b.room_name.startsWith(bName)).length
      ),
      backgroundColor: this.buildingColorMap[bName] || '#ccc',
      stack: 'buildingStack'
    }));

    if (this.chart) this.chart.update();
  }

  getBookingStyle(roomName: string) {
    const prefix = roomName?.split(' ')[0];
    const bgColor = this.buildingColorMap[prefix] || '#e9e9e9';
    return { 'border-left': `8px solid ${bgColor}` };
  }

  toggleBookingList(): void {
    this.isListVisible = !this.isListVisible;
  }

clearAllBookings(): void {
  if (confirm('Are you sure you want to clear all booking data for today? This action cannot be undone.')) {
    this.roomService.clearBookings().subscribe({
      next: () => {
        alert('All bookings have been cleared.');
        this.roomService.loadAllBookings();
      },
      error: (err) => {
        console.error('Failed to clear bookings:', err);
        alert('Could not clear bookings. Check your backend connection.');
      }
    });
  }
}

  onSignOut(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}