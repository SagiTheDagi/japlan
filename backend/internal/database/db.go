package database

import (
	"fmt"
	"japlan-backend/internal/models"
	"time"

	// Use the "glebarez" driver instead of the default "gorm.io/driver/sqlite"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDatabase initializes the SQLite database and runs migrations
func InitDatabase() error {
	var err error
	// The DSN remains the same for SQLite
	dsn := "japlan.db?_pragma=foreign_keys(1)"
	
	// Open connection using the pure-Go driver
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Optimize connection settings
	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(1)
		sqlDB.SetMaxIdleConns(1)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// Auto-migrate the schema
	err = DB.AutoMigrate(&models.Plan{})
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	return nil
}

// --- Helper Functions for your Handlers ---

func SavePlan(plan *models.Plan) error {
	return DB.Save(plan).Error
}

func GetPlan(id uint) (*models.Plan, error) {
	var plan models.Plan
	if err := DB.First(&plan, id).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}

func GetPlansByUser(userID string) ([]models.Plan, error) {
	var plans []models.Plan
	if err := DB.Where("user_id = ?", userID).Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

func UpdatePlan(plan *models.Plan) error {
	return DB.Save(plan).Error
}

func DeletePlan(id uint) error {
	result := DB.Delete(&models.Plan{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// GetPlanByName retrieves a plan by name
func GetPlanByName(name string) (*models.Plan, error) {
	var plan models.Plan
	if err := DB.Where("name = ?", name).First(&plan).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}

// GetAllPlanNames retrieves all plan names
func GetAllPlanNames() ([]string, error) {
	var plans []models.Plan
	if err := DB.Select("name").Find(&plans).Error; err != nil {
		return nil, err
	}
	names := make([]string, len(plans))
	for i, plan := range plans {
		names[i] = plan.Name
	}
	return names, nil
}