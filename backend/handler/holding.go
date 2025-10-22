package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/pirosiki197/event_reminder/models"
)

// Holding用のリクエスト/レスポンス型

type CreateHoldingRequest struct {
	Name      string `json:"name"`
	Date      string `json:"date"`
	ChannelID string `json:"channelId"`
	Mention   string `json:"mention"`
	EventID   string `json:"eventId"`
}

func (req CreateHoldingRequest) Validate() error {
	if req.Name == "" {
		return errors.New("holding name is required")
	}
	if req.Date == "" {
		return errors.New("holding date is required")
	}
	if _, err := time.Parse("2006-01-02", req.Date); err != nil {
		return errors.New("holding date must be in YYYY-MM-DD format")
	}
	if req.ChannelID == "" {
		return errors.New("channel_id is required")
	}
	if req.Mention == "" {
		return errors.New("mention is required")
	}
	if req.EventID == "" {
		return errors.New("event id is required")
	}
	return nil
}

type UpdateHoldingRequest struct {
	Name      *string `json:"name,omitempty"`
	Date      *string `json:"date,omitempty"`
	ChannelID *string `json:"channelId,omitempty"`
	Mention   *string `json:"mention,omitempty"`
}

type HoldingResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Date      string `json:"date"`
	ChannelID string `json:"channelId"`
	Mention   string `json:"mention"`
	EventID   string `json:"eventId,omitempty"`
}

// GET /api/v1/holdings
// 全ての開催を取得（クエリパラメータでフィルタ可能）
func (h *Handler) GetHoldings(w http.ResponseWriter, r *http.Request) {
	sourceEventID := r.URL.Query().Get("source_event_id")

	var holdings []models.Holding
	var err error

	if sourceEventID != "" {
		eventID, parseErr := strconv.Atoi(sourceEventID)
		if parseErr != nil {
			http.Error(w, "invalid source_event_id", http.StatusBadRequest)
			return
		}
		holdings, err = h.taskSvc.GetHoldingsByEventID(eventID)
	} else {
		holdings, err = h.taskSvc.GetAllHoldings()
	}

	if err != nil {
		h.logger.Error("failed to get holdings", "error", err)
		http.Error(w, "failed to get holdings", http.StatusInternalServerError)
		return
	}

	// レスポンス変換
	response := make([]HoldingResponse, len(holdings))
	for i, holding := range holdings {
		response[i] = HoldingResponse{
			ID:        strconv.Itoa(holding.ID),
			Name:      holding.Name,
			Date:      holding.Date.Format(time.DateOnly),
			ChannelID: holding.ChannelID,
			Mention:   holding.Mention,
			EventID:   strconv.Itoa(holding.EventID),
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GET /api/v1/holdings/{holdingId}
// 特定の開催を取得
func (h *Handler) GetHolding(w http.ResponseWriter, r *http.Request) {
	holdingIDStr := r.PathValue("holdingId")
	holdingID, err := strconv.Atoi(holdingIDStr)
	if err != nil {
		http.Error(w, "invalid holding_id", http.StatusBadRequest)
		return
	}

	holding, err := h.taskSvc.GetHoldingByID(holdingID)
	if err != nil {
		h.logger.Error("failed to get holding", "error", err)
		http.Error(w, "holding not found", http.StatusNotFound)
		return
	}

	response := HoldingResponse{
		ID:        strconv.Itoa(holding.ID),
		Name:      holding.Name,
		Date:      holding.Date.Format(time.DateOnly),
		ChannelID: holding.ChannelID,
		Mention:   holding.Mention,
		EventID:   strconv.Itoa(holding.EventID),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// POST /api/v1/holdings
// 新しい開催を作成（DefaultTasksをHoldingTasksにコピー）
func (h *Handler) CreateHolding(w http.ResponseWriter, r *http.Request) {
	var req CreateHoldingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	holdingDate, _ := time.Parse("2006-01-02", req.Date)
	eventID, _ := strconv.Atoi(req.EventID)

	holding := models.Holding{
		EventID:   eventID,
		Name:      req.Name,
		Date:      holdingDate,
		ChannelID: req.ChannelID,
		Mention:   req.Mention,
	}

	holdingID, err := h.taskSvc.CreateHolding(holding)
	if err != nil {
		h.logger.Error("failed to create holding", "error", err)
		http.Error(w, "failed to create holding", http.StatusInternalServerError)
		return
	}

	holding.ID = holdingID

	response := HoldingResponse{
		ID:        strconv.Itoa(holding.ID),
		Name:      holding.Name,
		Date:      holding.Date.Format(time.DateOnly),
		ChannelID: holding.ChannelID,
		Mention:   holding.Mention,
		EventID:   strconv.Itoa(holding.EventID),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// PATCH /api/v1/holdings/{holdingId}
// 開催情報を部分更新
func (h *Handler) UpdateHolding(w http.ResponseWriter, r *http.Request) {
	holdingIDStr := r.PathValue("holdingId")
	holdingID, err := strconv.Atoi(holdingIDStr)
	if err != nil {
		http.Error(w, "invalid holding_id", http.StatusBadRequest)
		return
	}

	var req UpdateHoldingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// 既存の開催を取得
	existingHolding, err := h.taskSvc.GetHoldingByID(holdingID)
	if err != nil {
		h.logger.Error("failed to get holding", "error", err)
		http.Error(w, "holding not found", http.StatusNotFound)
		return
	}

	// 部分更新の適用
	updatedHolding := models.Holding{
		ID:        existingHolding.ID,
		EventID:   existingHolding.EventID,
		Name:      existingHolding.Name,
		Date:      existingHolding.Date,
		ChannelID: existingHolding.ChannelID,
		Mention:   existingHolding.Mention,
	}

	if req.Name != nil {
		updatedHolding.Name = *req.Name
	}
	if req.Date != nil {
		updatedHolding.Date, err = time.Parse(time.DateOnly, *req.Date)
		if err != nil {
			http.Error(w, "invalid format of holding date", http.StatusBadRequest)
		}
	}
	if req.ChannelID != nil {
		updatedHolding.ChannelID = *req.ChannelID
	}
	if req.Mention != nil {
		updatedHolding.Mention = *req.Mention
	}

	if err := h.taskSvc.UpdateHolding(holdingID, updatedHolding); err != nil {
		h.logger.Error("failed to update holding", "error", err)
		http.Error(w, "failed to update holding", http.StatusInternalServerError)
		return
	}

	response := HoldingResponse{
		ID:        strconv.Itoa(updatedHolding.ID),
		Name:      updatedHolding.Name,
		Date:      updatedHolding.Date.Format(time.DateOnly),
		ChannelID: updatedHolding.ChannelID,
		Mention:   updatedHolding.Mention,
		EventID:   strconv.Itoa(updatedHolding.EventID),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// DELETE /api/v1/holdings/{holdingId}
// 開催を削除（関連するHoldingTasksも削除）
func (h *Handler) DeleteHolding(w http.ResponseWriter, r *http.Request) {
	holdingIDStr := r.PathValue("holdingId")
	holdingID, err := strconv.Atoi(holdingIDStr)
	if err != nil {
		http.Error(w, "invalid holding_id", http.StatusBadRequest)
		return
	}

	if err := h.taskSvc.DeleteHolding(holdingID); err != nil {
		h.logger.Error("failed to delete holding", "error", err)
		http.Error(w, "failed to delete holding", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
