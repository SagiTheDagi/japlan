package main

import (
	"fmt"
	"log"

	"japlan-backend/internal/database"
	"japlan-backend/internal/routes"
)

func main() {
	// Initialize database
	if err := database.InitDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	fmt.Println("Database initialized successfully")

	// Setup routes
	r := routes.SetupRoutes()

	// Start server
	port := ":8080"
	fmt.Printf("Server starting on port %s\n", port)
	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

