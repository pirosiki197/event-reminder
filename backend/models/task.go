package models

type DefaultTask struct {
	ID          int    `db:"id" json:"id"`
	EventID     int    `db:"event_id" json:"eventId"`
	Name        string `db:"name" json:"name"`
	DaysBefore  int    `db:"days_before" json:"daysBefore"`
	Description string `db:"description" json:"description"`
}

type Task struct {
	ID          int    `db:"id" json:"id"`
	HoldingID   int    `db:"holding_id" json:"holdingId"`
	Name        string `db:"name" json:"name"`
	DaysBefore  int    `db:"days_before" json:"daysBefore"`
	Description string `db:"description" json:"description"`
	Reminded    bool   `db:"reminded"`
}
