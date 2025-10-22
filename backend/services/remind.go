package services

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/traPtitech/go-traq"
)

type RemindService struct {
	ts     *TaskService
	client *traq.APIClient
	logger *slog.Logger
	conf   RemindConfig
}

type RemindConfig struct {
	TraqToken string
	ChannelID string
	Interval  time.Duration
}

func NewRemindService(ts *TaskService, logger *slog.Logger, client *traq.APIClient, conf RemindConfig) *RemindService {
	return &RemindService{
		ts:     ts,
		client: client,
		logger: logger,
		conf:   conf,
	}
}

func (rs *RemindService) Start() {
	ticker := time.NewTicker(rs.conf.Interval)
	for range ticker.C {
		reminds, err := []Remind{}, (error)(nil) // TODO
		if err != nil {
			rs.logger.Error("failed to get pending reminds", slog.String("err", err.Error()))
			continue
		}

		for _, remind := range reminds {
			err := rs.sendRemind(remind)
			if err != nil {
				rs.logger.Error("failed to send remind", slog.String("err", err.Error()))
			}
		}
	}
}

type Remind struct {
	channelID string
	mention   string
	taskID    int
}

func (rs *RemindService) sendRemind(remind Remind) error {
	task, err := rs.ts.GetTaskByID(remind.taskID)
	if err != nil {
		return err
	}

	auth := context.WithValue(context.Background(), traq.ContextAccessToken, rs.conf.TraqToken)
	_, _, err = rs.client.MessageApi.
		PostMessage(auth, rs.conf.ChannelID).
		PostMessageRequest(traq.PostMessageRequest{
			Content: fmt.Sprintf("@%s %s", remind.mention, task.Name),
			Embed:   newBool(true),
		}).Execute()
	if err != nil {
		return err
	}

	return nil
}

func newBool(b bool) *bool {
	return &b
}
