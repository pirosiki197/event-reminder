package handler

import (
	"net/http"
)

func (h *Handler) GetChannelList(w http.ResponseWriter, r *http.Request) {
	channels, err := h.traqSvc.GetChannelList(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonEncoded(w, channels)
}
