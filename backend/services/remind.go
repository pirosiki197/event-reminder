package services

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/pirosiki197/event_reminder/models"
	"github.com/robfig/cron/v3"
	"github.com/traPtitech/go-traq"
)

type RemindService struct {
	taskSvc *TaskService
	traqSvc *TraQService
	client  *traq.APIClient
	logger  *slog.Logger
	conf    RemindConfig
}

type RemindConfig struct {
	TraqToken string
	ChannelID string
	Interval  time.Duration
}

func NewRemindService(ts *TaskService, logger *slog.Logger, client *traq.APIClient, conf RemindConfig) *RemindService {
	return &RemindService{
		taskSvc: ts,
		client:  client,
		logger:  logger,
		conf:    conf,
	}
}

func (rs *RemindService) Start() {
	c := cron.New()
	c.AddFunc("0 8 * * *", func() {
		tasks, err := rs.taskSvc.GetTasksToRemind()
		if err != nil {
			rs.logger.Error("failed to get pending reminds", slog.String("err", err.Error()))
			return
		}

		for _, task := range tasks {
			event, err := rs.taskSvc.GetHoldingByID(task.HoldingID)
			if err != nil {
				rs.logger.Error("failed to get holding info", slog.String("err", err.Error()))
				continue
			}
			err = rs.sendRemind(context.Background(), task, event)
			if err != nil {
				rs.logger.Error("failed to send remind", slog.String("err", err.Error()))
				continue
			}
			err = rs.taskSvc.UpdateTaskAsReminded(task.ID)
			if err != nil {
				rs.logger.Error("failed to update task status", slog.String("err", err.Error()))
				continue
			}
		}
	})
}

func (rs *RemindService) sendRemind(ctx context.Context, task models.Task, holding models.Holding) error {
	content := fmt.Sprintf("@%s %s", holding.Mention, task.Name)
	err := rs.traqSvc.PostMessage(ctx, holding.ChannelID, content)
	if err != nil {
		return err
	}

	return nil
}

func newBool(b bool) *bool {
	return &b
}
