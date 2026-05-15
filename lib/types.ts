export type UserRole = 'parent' | 'kid'
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed'

export interface UserProfile {
  id: string
  display_name: string
  avatar_color: string
  role: UserRole
  created_at: string
}

export interface Car {
  id: string
  name: string
  color: string
  emoji: string
  owner_id: string | null
  created_at: string
}

export interface Reservation {
  id: string
  car_id: string
  user_id: string
  start_time: string
  end_time: string
  status: ReservationStatus
  note: string | null
  created_at: string
  user?: UserProfile
  car?: Car
}

export type CarLiveStatus = 'available' | 'in-use' | 'reserved'

export interface CarWithStatus extends Car {
  liveStatus: CarLiveStatus
  activeReservation?: Reservation & { user: UserProfile }
  nextReservation?: Reservation & { user: UserProfile }
}
