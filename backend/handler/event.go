package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/pirosiki197/event_reminder/models"
)

type CreateEventRequest struct {
	Name string `json:"name"`
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req CreateEventRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	event := models.Event{
		Name: req.Name,
	}
	id, err := h.taskSvc.CreateEvent(event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	event.ID = id

	jsonEncoded(w, event)
}

func (h *Handler) GetEvents(w http.ResponseWriter, r *http.Request) {
	events, err := h.taskSvc.GetAllEvents()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	jsonEncoded(w, events)
}

func (h *Handler) GetEvent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("eventId"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	event, err := h.taskSvc.GetEventByID(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonEncoded(w, event)
}

type UpdateEventRequest struct {
	Name string `json:"name"`
}

func (h *Handler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	var req UpdateEventRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(r.PathValue("eventId"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = h.taskSvc.UpdateEvent(id, models.Event{
		Name: req.Name,
	})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (h *Handler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("eventId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err = h.taskSvc.DeleteEvent(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
