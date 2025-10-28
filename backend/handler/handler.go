package handler

import (
	"compress/gzip"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/pirosiki197/event_reminder/services"
	slogchi "github.com/samber/slog-chi"
)

type Handler struct {
	taskSvc *services.TaskService
	traqSvc *services.TraQService
	logger  *slog.Logger
}

func New(taskSvc *services.TaskService, traqSvc *services.TraQService, logger *slog.Logger) *Handler {
	return &Handler{
		taskSvc: taskSvc,
		traqSvc: traqSvc,
		logger:  logger,
	}
}

func (h *Handler) SetupRoutes(router chi.Router) {
	api := chi.NewRouter()
	router.Mount("/api/v1", api)

	api.Use(slogchi.New(h.logger))
	api.Use(middleware.Recoverer)
	api.Use(middleware.Compress(gzip.BestSpeed))

	// Events (イベントマスター)
	api.Post("/events", h.CreateEvent)
	api.Get("/events", h.GetEvents)
	api.Get("/events/{eventId}", h.GetEvent)
	api.Put("/events/{eventId}", h.UpdateEvent)
	api.Delete("/events/{eventId}", h.DeleteEvent)

	// Holdings (開催)
	api.Post("/holdings", h.CreateHolding)
	api.Get("/holdings", h.GetHoldings)
	api.Get("/holdings/{holdingId}", h.GetHolding)
	api.Patch("/holdings/{holdingId}", h.UpdateHolding)
	api.Delete("/holdings/{holdingId}", h.DeleteHolding)

	// HoldingTasks (開催タスク - 開催に紐づく)
	api.Get("/holdings/{holdingId}/tasks", h.GetHoldingTasks)
	api.Post("/holdings/{holdingId}/tasks", h.CreateHoldingTask)
	api.Patch("/holding-tasks/{taskId}", h.UpdateHoldingTask)
	api.Delete("/holding-tasks/{taskId}", h.DeleteHoldingTask)

	// traQ channel
	api.Get("/channels", h.GetChannelList)
}

func jsonEncoded(w http.ResponseWriter, obj any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(obj)
	w.WriteHeader(http.StatusOK)
}
