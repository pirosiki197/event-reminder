package main

import (
	"cmp"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/pirosiki197/event_reminder/handler"
	"github.com/pirosiki197/event_reminder/services"
	"github.com/traPtitech/go-traq"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	traqConf := traq.NewConfiguration()
	traqConf.DefaultHeader = map[string]string{
		"Authorization": fmt.Sprintf("Bearer %s", os.Getenv("TRAQ_TOKEN")),
	}
	traqClient := traq.NewAPIClient(traqConf)

	dbConf := mysql.Config{
		User:                 os.Getenv("DB_USER"),
		Passwd:               os.Getenv("DB_PASSWORD"),
		Net:                  "tcp",
		Addr:                 os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT"),
		DBName:               os.Getenv("DB_NAME"),
		ParseTime:            true,
		AllowNativePasswords: true,
	}
	db, err := sqlx.Open("mysql", dbConf.FormatDSN())
	if err != nil {
		panic(err)
	}
	if err := db.Ping(); err != nil {
		panic(err)
	}

	taskService := services.NewTaskService(db, logger)
	traqService := services.NewTraQService(traqClient)

	interval, err := time.ParseDuration(cmp.Or(os.Getenv("REMIND_INTERVAL"), "12h"))
	if err != nil {
		panic(err)
	}
	_ = services.NewRemindService(taskService, logger, traqClient, services.RemindConfig{
		TraqToken: os.Getenv("TRAQ_TOKEN"),
		ChannelID: os.Getenv("REMIND_CHANNEL_ID"),
		Interval:  interval,
	})
	// go remindService.Start()

	h := handler.New(taskService, traqService, logger)
	r := chi.NewRouter()
	h.SetupRoutes(r)
	logger.Info("server started")
	http.ListenAndServe(":8080", r)
}
