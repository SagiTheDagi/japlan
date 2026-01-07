package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// UserPreferences represents user preferences stored as JSON
type UserPreferences struct {
	Hobbies []string `json:"hobbies"`
	FoodPreferences struct {
		DietaryRestrictions []string `json:"dietaryRestrictions"`
		CuisinePreferences  []string `json:"cuisinePreferences"`
	} `json:"foodPreferences"`
	BudgetRange struct {
		Min int `json:"min"`
		Max int `json:"max"`
	} `json:"budgetRange"`
	TripDuration int    `json:"tripDuration"`
	TravelStyle  string `json:"travelStyle"`
}

// Value implements driver.Valuer for database storage
func (p UserPreferences) Value() (driver.Value, error) {
	return json.Marshal(p)
}

// Scan implements sql.Scanner for database retrieval
func (p *UserPreferences) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return nil
	}
	
	return json.Unmarshal(bytes, p)
}

// GridItem represents an item placed on the calendar grid
type GridItem struct {
	ID       string `json:"id"`
	Type     string `json:"type"` // "activity" or "restaurant"
	Item     json.RawMessage `json:"item"` // Activity or Restaurant data
	TimeSlot string `json:"timeSlot"`
	Position struct {
		Row int `json:"row"`
		Col int `json:"col"`
	} `json:"position"`
}

// CalendarDay represents a day in the trip plan
type CalendarDay struct {
	Day   int        `json:"day"`
	Date  *string    `json:"date,omitempty"`
	Items []GridItem `json:"items"`
}

// PlanDays is a custom type for storing calendar days as JSON
type PlanDays []CalendarDay

// Value implements driver.Valuer for database storage
func (d PlanDays) Value() (driver.Value, error) {
	return json.Marshal(d)
}

// Scan implements sql.Scanner for database retrieval
func (d *PlanDays) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return nil
	}
	
	return json.Unmarshal(bytes, d)
}

// Plan represents a complete trip plan
type Plan struct {
	ID          uint            `json:"id" gorm:"primaryKey"`
	Name        string          `json:"name" gorm:"type:varchar(255);uniqueIndex"`
	UserID      *string         `json:"userId,omitempty"`
	Preferences UserPreferences `json:"preferences" gorm:"type:text"`
	Days        PlanDays        `json:"days" gorm:"type:text"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// PlanItem represents a single item in a plan (for database storage)
type PlanItem struct {
	ID        uint      `gorm:"primaryKey"`
	PlanID   uint      `gorm:"index"`
	ItemType string    `gorm:"type:varchar(50)"` // "activity" or "restaurant"
	ItemData string    `gorm:"type:text"`         // JSON data
	Day      int
	TimeSlot string    `gorm:"type:varchar(10)"`
	Row      int
	Col      int
	CreatedAt time.Time
}

