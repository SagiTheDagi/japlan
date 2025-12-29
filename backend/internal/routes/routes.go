package routes

import (
	"japlan-backend/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes() *gin.Engine {
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		// Plans routes
		plans := api.Group("/plans")
		{
			plans.POST("", handlers.CreatePlan)
			plans.GET("/:id", handlers.GetPlan)
			plans.PUT("/:id", handlers.UpdatePlan)
			plans.DELETE("/:id", handlers.DeletePlan)
			plans.GET("/user/:userId", handlers.GetPlansByUser)
		}
	}

	return r
}

