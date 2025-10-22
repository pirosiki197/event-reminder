package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/pirosiki197/event_reminder/models"
)

// DefaultTask用のリクエスト/レスポンス型

type CreateDefaultTaskRequest struct {
	TaskName    string `json:"name"`
	DaysBefore  int    `json:"daysBefore"`
	Description string `json:"description"`
}

func (req CreateDefaultTaskRequest) Validate() error {
	if req.TaskName == "" {
		return errors.New("task_name is required")
	}
	if req.DaysBefore < 0 {
		return errors.New("days_before must be greater than or equal to 0")
	}
	return nil
}

type UpdateDefaultTaskRequest struct {
	TaskName    *string `json:"name,omitempty"`
	DaysBefore  *int    `json:"daysBefore,omitempty"`
	Description *string `json:"description,omitempty"`
}

type DefaultTaskResponse struct {
	ID          string `json:"id"`
	EventID     string `json:"eventId"`
	TaskName    string `json:"name"`
	DaysBefore  int    `json:"daysBefore"`
	Description string `json:"description"`
}

// GET /api/v1/events/{eventId}/default-tasks
// 特定のイベントに紐づくデフォルトタスクを全て取得
func (h *Handler) GetDefaultTasks(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.PathValue("eventId")
	eventID, err := strconv.Atoi(eventIDStr)
	if err != nil {
		http.Error(w, "invalid event_id", http.StatusBadRequest)
		return
	}

	tasks, err := h.taskSvc.GetDefaultTasks(eventID)
	if err != nil {
		h.logger.Error("failed to get default tasks", "error", err)
		http.Error(w, "failed to get default tasks", http.StatusInternalServerError)
		return
	}

	// レスポンス変換
	response := make([]DefaultTaskResponse, len(tasks))
	for i, task := range tasks {
		response[i] = DefaultTaskResponse{
			ID:          strconv.Itoa(task.ID),
			EventID:     strconv.Itoa(task.EventID),
			TaskName:    task.Name,
			DaysBefore:  task.DaysBefore,
			Description: task.Description,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// POST /api/v1/events/{eventId}/default-tasks
// 特定のイベントに新しいデフォルトタスクを作成
func (h *Handler) CreateDefaultTask(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.PathValue("eventId")
	eventID, err := strconv.Atoi(eventIDStr)
	if err != nil {
		http.Error(w, "invalid event_id", http.StatusBadRequest)
		return
	}

	var req CreateDefaultTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	task := models.DefaultTask{
		EventID:     eventID,
		Name:        req.TaskName,
		DaysBefore:  req.DaysBefore,
		Description: req.Description,
	}

	taskID, err := h.taskSvc.CreateDefaultTask(task)
	if err != nil {
		h.logger.Error("failed to create default task", "error", err)
		http.Error(w, "failed to create default task", http.StatusInternalServerError)
		return
	}

	task.ID = taskID

	response := DefaultTaskResponse{
		ID:          strconv.Itoa(task.ID),
		EventID:     strconv.Itoa(task.EventID),
		TaskName:    task.Name,
		DaysBefore:  task.DaysBefore,
		Description: task.Description,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// PATCH /api/v1/default-tasks/{taskId}
// 特定のデフォルトタスクの情報を部分更新
func (h *Handler) UpdateDefaultTask(w http.ResponseWriter, r *http.Request) {
	taskIDStr := r.PathValue("taskId")
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		http.Error(w, "invalid task_id", http.StatusBadRequest)
		return
	}

	var req UpdateDefaultTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// 既存のタスクを取得
	existingTask, err := h.taskSvc.GetDefaultTaskByID(taskID)
	if err != nil {
		h.logger.Error("failed to get default task", "error", err)
		http.Error(w, "default task not found", http.StatusNotFound)
		return
	}

	// 部分更新の適用
	updatedTask := models.DefaultTask{
		ID:          existingTask.ID,
		EventID:     existingTask.EventID,
		Name:        existingTask.Name,
		DaysBefore:  existingTask.DaysBefore,
		Description: existingTask.Description,
	}

	if req.TaskName != nil {
		updatedTask.Name = *req.TaskName
	}
	if req.DaysBefore != nil {
		if *req.DaysBefore < 0 {
			http.Error(w, "days_before must be greater than or equal to 0", http.StatusBadRequest)
			return
		}
		updatedTask.DaysBefore = *req.DaysBefore
	}
	if req.Description != nil {
		updatedTask.Description = *req.Description
	}

	if err := h.taskSvc.UpdateDefaultTask(taskID, updatedTask); err != nil {
		h.logger.Error("failed to update default task", "error", err)
		http.Error(w, "failed to update default task", http.StatusInternalServerError)
		return
	}

	response := DefaultTaskResponse{
		ID:          strconv.Itoa(updatedTask.ID),
		EventID:     strconv.Itoa(updatedTask.EventID),
		TaskName:    updatedTask.Name,
		DaysBefore:  updatedTask.DaysBefore,
		Description: updatedTask.Description,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// DELETE /api/v1/default-tasks/{taskId}
// 特定のデフォルトタスクを削除
func (h *Handler) DeleteDefaultTask(w http.ResponseWriter, r *http.Request) {
	taskIDStr := r.PathValue("taskId")
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		http.Error(w, "invalid task_id", http.StatusBadRequest)
		return
	}

	if err := h.taskSvc.DeleteDefaultTask(taskID); err != nil {
		h.logger.Error("failed to delete default task", "error", err)
		http.Error(w, "failed to delete default task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
