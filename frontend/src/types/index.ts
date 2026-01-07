export interface UserPreferences {
  hobbies: string[];
  foodPreferences: {
    dietaryRestrictions: string[];
    cuisinePreferences: string[];
  };
  budget: 'low' | 'medium' | 'high' | 'luxury' | 'flexible';
  tripDuration: number; 
  travelStyle: 'relaxed' | 'adventurous' | 'balanced' | 'cultural' | 'foodie';
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // in hours
  priceRange: 'free' | 'low' | 'medium' | 'high';
  location?: string;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  priceRange: 'low' | 'medium' | 'high' | 'luxury';
  location?: string;
  imageUrl?: string;
  dietaryOptions?: string[];
}

export type BlockItem = Activity | Restaurant;

export interface CalendarDay {
  day: number; // day of trip (1, 2, 3, etc.)
  date?: string; // optional date string
  items: GridItem[];
}

export interface GridItem {
  id: string;
  type: 'activity' | 'restaurant';
  item: BlockItem;
  timeSlot: string; // e.g., "09:00", "12:00", "18:00"
  position: {
    row: number;
    col: number;
  };
}

export interface Plan {
  id?: string;
  name?: string;
  userId?: string;
  preferences: UserPreferences;
  days: CalendarDay[];
  createdAt?: string;
  updatedAt?: string;
}

