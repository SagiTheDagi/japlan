package database

import (
	"encoding/json"
	"japlan-backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDatabase initializes the SQLite database and runs migrations
func InitDatabase() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("japlan.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	// Auto-migrate the schema
	err = DB.AutoMigrate(&models.Plan{})
	if err != nil {
		return err
	}

	return nil
}

// SavePlan saves a plan to the database
func SavePlan(plan *models.Plan) error {
	// Convert CalendarDay array to JSON for storage
	daysJSON, err := json.Marshal(plan.Days)
	if err != nil {
		return err
	}

	// For simplicity, we'll store days as JSON in a text field
	// In a production system, you might want to normalize this further
	planData := map[string]interface{}{
		"days": string(daysJSON),
	}

	// Update the plan with the JSON data
	if err := DB.Save(plan).Error; err != nil {
		return err
	}

	// Store the days JSON separately (we'll use a custom approach)
	// For now, we'll store everything in the Preferences field or create a separate field
	return nil
}

// GetPlan retrieves a plan by ID
func GetPlan(id uint) (*models.Plan, error) {
	var plan models.Plan
	if err := DB.First(&plan, id).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}

// GetPlansByUser retrieves all plans for a user
func GetPlansByUser(userID string) ([]models.Plan, error) {
	var plans []models.Plan
	if err := DB.Where("user_id = ?", userID).Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

// UpdatePlan updates an existing plan
func UpdatePlan(plan *models.Plan) error {
	return DB.Save(plan).Error
}

// DeletePlan deletes a plan by ID
func DeletePlan(id uint) error {
	return DB.Delete(&models.Plan{}, id).Error
}

