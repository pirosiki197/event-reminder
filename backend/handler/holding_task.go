package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/pirosiki197/event_reminder/models"
)

// HoldingTask用のリクエスト/レスポンス型

type CreateHoldingTaskRequest struct {
	TaskName    string `json:"name"`
	DaysBefore  int    `json:"daysBefore"`
	Description string `json:"description"`
}

func (req CreateHoldingTaskRequest) Validate() error {
	if req.TaskName == "" {
		return errors.New("task name is required")
	}
	if req.DaysBefore < 0 {
		return errors.New("days before must be greater than or equal to 0")
	}
	return nil
}

type UpdateHoldingTaskRequest struct {
	TaskName    *string `json:"name,omitempty"`
	DaysBefore  *int    `json:"daysBefore,omitempty"`
	Description *string `json:"description,omitempty"`
}

type HoldingTaskResponse struct {
	TaskID      string `json:"id"`
	HoldingID   string `json:"holdingId"`
	TaskName    string `json:"name"`
	DaysBefore  int    `json:"daysBefore"`
	Description string `json:"description"`
}

// GET /api/v1/holdings/{holdingId}/tasks
// 特定の開催に紐づくタスクを全て取得
func (h *Handler) GetHoldingTasks(w http.ResponseWriter, r *http.Request) {
	holdingIDStr := r.PathValue("holdingId")
	holdingID, err := strconv.Atoi(holdingIDStr)
	if err != nil {
		http.Error(w, "invalid holding_id", http.StatusBadRequest)
		return
	}

	tasks, err := h.taskSvc.GetTasksByHoldingID(holdingID)
	if err != nil {
		h.logger.Error("failed to get holding tasks", "error", err)
		http.Error(w, "failed to get holding tasks", http.StatusInternalServerError)
		return
	}

	// レスポンス変換
	response := make([]HoldingTaskResponse, len(tasks))
	for i, task := range tasks {
		response[i] = HoldingTaskResponse{
			TaskID:      strconv.Itoa(task.ID),
			HoldingID:   strconv.Itoa(task.HoldingID),
			TaskName:    task.Name,
			DaysBefore:  task.DaysBefore,
			Description: task.Description,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// POST /api/v1/holdings/{holdingId}/tasks
// 特定の開催にカスタムタスクを追加
func (h *Handler) CreateHoldingTask(w http.ResponseWriter, r *http.Request) {
	holdingIDStr := r.PathValue("holdingId")
	holdingID, err := strconv.Atoi(holdingIDStr)
	if err != nil {
		http.Error(w, "invalid holding_id", http.StatusBadRequest)
		return
	}

	var req CreateHoldingTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	task := models.Task{
		HoldingID:   holdingID,
		Name:        req.TaskName,
		DaysBefore:  req.DaysBefore,
		Description: req.Description,
	}

	taskID, err := h.taskSvc.CreateTask(task)
	if err != nil {
		h.logger.Error("failed to create holding task", "error", err)
		http.Error(w, "failed to create holding task", http.StatusInternalServerError)
		return
	}

	task.ID = taskID

	response := HoldingTaskResponse{
		TaskID:      strconv.Itoa(task.ID),
		HoldingID:   strconv.Itoa(task.HoldingID),
		TaskName:    task.Name,
		DaysBefore:  task.DaysBefore,
		Description: task.Description,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// PATCH /api/v1/holding-tasks/{taskId}
// 特定の開催タスクの情報を部分更新
func (h *Handler) UpdateHoldingTask(w http.ResponseWriter, r *http.Request) {
	taskIDStr := r.PathValue("taskId")
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		http.Error(w, "invalid task_id", http.StatusBadRequest)
		return
	}

	var req UpdateHoldingTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// 既存のタスクを取得
	existingTask, err := h.taskSvc.GetTaskByID(taskID)
	if err != nil {
		h.logger.Error("failed to get holding task", "error", err)
		http.Error(w, "holding task not found", http.StatusNotFound)
		return
	}

	// 部分更新の適用
	updatedTask := models.Task{
		ID:          existingTask.ID,
		HoldingID:   existingTask.HoldingID,
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

	if err := h.taskSvc.UpdateTask(taskID, updatedTask); err != nil {
		h.logger.Error("failed to update holding task", "error", err)
		http.Error(w, "failed to update holding task", http.StatusInternalServerError)
		return
	}

	response := HoldingTaskResponse{
		TaskID:      strconv.Itoa(updatedTask.ID),
		HoldingID:   strconv.Itoa(updatedTask.HoldingID),
		TaskName:    updatedTask.Name,
		DaysBefore:  updatedTask.DaysBefore,
		Description: updatedTask.Description,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// DELETE /api/v1/holding-tasks/{taskId}
// 特定の開催タスクを削除
func (h *Handler) DeleteHoldingTask(w http.ResponseWriter, r *http.Request) {
	taskIDStr := r.PathValue("taskId")
	taskID, err := strconv.Atoi(taskIDStr)
	if err != nil {
		http.Error(w, "invalid task_id", http.StatusBadRequest)
		return
	}

	if err := h.taskSvc.DeleteTask(taskID); err != nil {
		h.logger.Error("failed to delete holding task", "error", err)
		http.Error(w, "failed to delete holding task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
