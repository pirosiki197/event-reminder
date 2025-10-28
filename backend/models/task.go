package models

type Task struct {
	ID          int    `db:"id" json:"id"`
	HoldingID   int    `db:"holding_id" json:"holdingId"`
	Name        string `db:"name" json:"name"`
	DaysBefore  int    `db:"days_before" json:"daysBefore"`
	Description string `db:"description" json:"description"`
	Reminded    bool   `db:"reminded"`
}
