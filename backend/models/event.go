package models

import (
	"time"
)

type Event struct {
	ID   int    `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

type Holding struct {
	ID        int       `db:"id" json:"id"`
	EventID   int       `db:"event_id" json:"eventId"`
	Name      string    `db:"name" json:"name"`
	Date      time.Time `db:"date" json:"date"`
	ChannelID string    `db:"channel_id" json:"channelId"`
	Mention   string    `db:"mention" json:"mention"`
}
