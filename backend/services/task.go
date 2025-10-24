package services

import (
	"log/slog"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/pirosiki197/event_reminder/models"
)

type TaskService struct {
	db     *sqlx.DB
	logger *slog.Logger
}

func NewTaskService(db *sqlx.DB, logger *slog.Logger) *TaskService {
	return &TaskService{db: db, logger: logger}
}

// ========================================
// Events (イベント) - CRUD
// ========================================

func (s *TaskService) CreateEvent(event models.Event) (int, error) {
	tx, err := s.db.Beginx()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	result, err := tx.Exec("INSERT INTO `events` (`name`) VALUES (?)", event.Name)
	if err != nil {
		s.logger.Error("failed to create event", slog.String("err", err.Error()))
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return int(id), nil
}

func (s *TaskService) GetEventByID(id int) (models.Event, error) {
	var event models.Event
	err := s.db.Get(&event, "SELECT * FROM `events` WHERE `id` = ?", id)
	return event, err
}

func (s *TaskService) GetAllEvents() ([]models.Event, error) {
	var events []models.Event
	err := s.db.Select(&events, "SELECT * FROM `events` ORDER BY `id` DESC")
	if events == nil {
		events = []models.Event{}
	}
	return events, err
}

func (s *TaskService) UpdateEvent(id int, event models.Event) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("UPDATE `events` SET `name` = ? WHERE `id` = ?", event.Name, id)
	if err != nil {
		s.logger.Error("failed to update event", slog.String("err", err.Error()))
		return err
	}

	return tx.Commit()
}

func (s *TaskService) DeleteEvent(id int) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM `events` WHERE `id` = ?", id)
	if err != nil {
		s.logger.Error("failed to delete event", slog.String("err", err.Error()))
		return err
	}

	return tx.Commit()
}

// ========================================
// DefaultTasks (デフォルトタスク) - CRUD
// ========================================

func (s *TaskService) CreateDefaultTask(task models.DefaultTask) (int, error) {
	tx, err := s.db.Beginx()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	result, err := tx.Exec(
		"INSERT INTO `default_tasks` (`event_id`, `name`, `days_before`, `description`) VALUES (?, ?, ?, ?)",
		task.EventID,
		task.Name,
		task.DaysBefore,
		task.Description,
	)
	if err != nil {
		s.logger.Error("failed to create default task", slog.String("err", err.Error()))
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return int(id), nil
}

func (s *TaskService) GetDefaultTaskByID(id int) (models.DefaultTask, error) {
	var task models.DefaultTask
	err := s.db.Get(&task, "SELECT * FROM `default_tasks` WHERE `id` = ?", id)
	return task, err
}

func (s *TaskService) GetDefaultTasks(eventID int) ([]models.DefaultTask, error) {
	var tasks []models.DefaultTask
	err := s.db.Select(&tasks, "SELECT * FROM `default_tasks` WHERE `event_id` = ? ORDER BY `days_before` DESC", eventID)
	return tasks, err
}

func (s *TaskService) UpdateDefaultTask(id int, task models.DefaultTask) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		"UPDATE `default_tasks` SET `name` = ?, `days_before` = ?, `description` = ? WHERE `id` = ?",
		task.Name,
		task.DaysBefore,
		task.Description,
		id,
	)
	if err != nil {
		s.logger.Error("failed to update default task", slog.String("err", err.Error()))
		return err
	}

	return tx.Commit()
}

func (s *TaskService) DeleteDefaultTask(id int) error {
	_, err := s.db.Exec("DELETE FROM `default_tasks` WHERE `id` = ?", id)
	if err != nil {
		s.logger.Error("failed to delete default task", slog.String("err", err.Error()))
	}
	return err
}

// ========================================
// Holdings (開催) - CRUD
// ========================================

func (s *TaskService) CreateHolding(holding models.Holding) (int, error) {
	tx, err := s.db.Beginx()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	result, err := tx.Exec(
		"INSERT INTO `holdings` (`event_id`, `name`, `date`, `channel_id`, `mention`) VALUES (?, ?, ?, ?, ?)",
		holding.EventID,
		holding.Name,
		holding.Date,
		holding.ChannelID,
		holding.Mention,
	)
	if err != nil {
		s.logger.Error("failed to create holding", slog.String("err", err.Error()))
		return 0, err
	}

	holdingID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	// DefaultTasksをコピーしてHoldingTasksを作成
	defaultTasks, err := s.GetDefaultTasks(holding.EventID)
	if err != nil {
		s.logger.Error("failed to get default tasks", slog.String("err", err.Error()))
		return 0, err
	}

	for _, task := range defaultTasks {
		_, err = tx.Exec(
			"INSERT INTO `tasks` (`holding_id`, `name`, `days_before`, `description`) VALUES (?, ?, ?, ?)",
			holdingID,
			task.Name,
			task.DaysBefore,
			task.Description,
		)
		if err != nil {
			s.logger.Error("failed to copy task to holding", slog.String("err", err.Error()))
			return 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return int(holdingID), nil
}

func (s *TaskService) GetHoldingByID(id int) (models.Holding, error) {
	var holding models.Holding
	err := s.db.Get(&holding, "SELECT * FROM `holdings` WHERE `id` = ?", id)
	return holding, err
}

func (s *TaskService) GetHoldingsByEventID(eventID int) ([]models.Holding, error) {
	var holdings []models.Holding
	err := s.db.Select(&holdings, "SELECT * FROM `holdings` WHERE `event_id` = ? ORDER BY `date` DESC", eventID)
	return holdings, err
}

func (s *TaskService) GetAllHoldings() ([]models.Holding, error) {
	var holdings []models.Holding
	err := s.db.Select(&holdings, "SELECT * FROM `holdings` ORDER BY `date` DESC")
	return holdings, err
}

func (s *TaskService) UpdateHolding(id int, holding models.Holding) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		"UPDATE `holdings` SET `name` = ?, `date` = ?, `channel_id` = ?, `mention` = ? WHERE `id` = ?",
		holding.Name,
		holding.Date,
		holding.ChannelID,
		holding.Mention,
		id,
	)
	if err != nil {
		s.logger.Error("failed to update holding", slog.String("err", err.Error()))
		return err
	}

	return tx.Commit()
}

func (s *TaskService) DeleteHolding(id int) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec("DELETE FROM `holdings` WHERE `id` = ?", id)
	if err != nil {
		s.logger.Error("failed to delete holding", slog.String("err", err.Error()))
		return err
	}

	return tx.Commit()
}

// ========================================
// Tasks (開催タスク / HoldingTasks) - CRUD
// ========================================

func (s *TaskService) CreateTask(task models.Task) (int, error) {
	tx, err := s.db.Beginx()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	result, err := tx.Exec(
		"INSERT INTO `tasks` (`holding_id`, `name`, `days_before`, `description`) VALUES (?, ?, ?, ?)",
		task.HoldingID,
		task.Name,
		task.DaysBefore,
		task.Description,
	)
	if err != nil {
		s.logger.Error("failed to create task", slog.String("err", err.Error()))
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return int(id), nil
}

func (s *TaskService) GetTaskByID(id int) (models.Task, error) {
	var task models.Task
	err := s.db.Get(&task, "SELECT * FROM `tasks` WHERE `id` = ?", id)
	return task, err
}

func (s *TaskService) GetTasksByHoldingID(holdingID int) ([]models.Task, error) {
	var tasks []models.Task
	err := s.db.Select(&tasks, "SELECT * FROM `tasks` WHERE `holding_id` = ? ORDER BY `days_before` DESC", holdingID)
	return tasks, err
}

func (s *TaskService) GetAllTasks() ([]models.Task, error) {
	var tasks []models.Task
	err := s.db.Select(&tasks, "SELECT * FROM `tasks` ORDER BY `id` DESC")
	return tasks, err
}

func (s *TaskService) UpdateTask(id int, task models.Task) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		"UPDATE `tasks` SET `name` = ?, `days_before` = ?, `description` = ? WHERE `id` = ?",
		task.Name,
		task.DaysBefore,
		task.Description,
		id,
	)
	if err != nil {
		s.logger.Error("failed to update task", slog.String("err", err.Error()))
		return err
	}

	return tx.Commit()
}

func (s *TaskService) DeleteTask(id int) error {
	_, err := s.db.Exec("DELETE FROM `tasks` WHERE `id` = ?", id)
	if err != nil {
		s.logger.Error("failed to delete task", slog.String("err", err.Error()))
	}
	return err
}

// ========================================
// リマインド機能用のヘルパー
// ========================================

// Bot用: リマインドすべきタスクを取得
func (s *TaskService) GetTasksToRemind() ([]models.Task, error) {
	now := time.Now()
	var tasks []models.Task
	query := `
		SELECT t.*
		FROM tasks t
		INNER JOIN holdings h ON t.holding_id = h.id
		WHERE DATE_SUB(h.date, INTERVAL t.days_before DAY) <= ? AND t.reminded = false
	`
	err := s.db.Select(&tasks, query, now)
	return tasks, err
}

func (s *TaskService) UpdateTaskAsReminded(id int) error {
	_, err := s.db.Exec("UPDATE `tasks` SET `reminded` = 1 WHERE `id` = ?", id)
	return err
}
