package scheduler

import (
	"github.com/go-co-op/gocron/v2"
	"scrumlr.io/server/database"
	"time"
)

func StartScheduler(s gocron.Scheduler, db *database.Database) {

	defer func() { _ = s.Shutdown() }()

	_, _ = s.NewJob(
		gocron.CronJob("*/20 * * * * *", true),
		gocron.NewTask(deleteUnusedBoards, db),
	)
}

//	func (s *BoardService) initScheduler(ctx context.Context) {
//		log := logger.FromContext(ctx)
//		scheduler, err := gocron.NewScheduler(gocron.WithLogger(slog.Default()))
//
//		if err != nil {
//			log.Errorw("Could no create scheduler", err)
//		}
//		defer func() { _ = scheduler.Shutdown() }()
//
//		//Use https://cron.help/ to decode
//		//crontab := fmt.Sprintf("%d 3 * * *", rand.Intn(60))
//		_, err = scheduler.NewJob(
//
//			//gocron.CronJob(crontab, false),
//			gocron.CronJob("*/20 * * * * *", true),
//			gocron.NewTask(deleteUnusedBoards, s, log),
//		)
//		if err != nil {
//			log.Errorw("Could no create new CronJob", err)
//		}
//
//		scheduler.Start()
//		select {
//		case <-ctx.Done():
//
//		}
//
// }
func deleteUnusedBoards(db *database.Database) {
	//todo: insert correct date before
	sessions, err := db.GetSessionsOlderThan(time.Now().AddDate(0, 0, -12).Add(time.Hour*-5), 5)
	if err != nil {
		//log.Errorw("Could not get sessions older ")

	}
	for _, session := range sessions {
		err := db.DeleteBoard(session.Board)
		if err != nil {
			//log.Errorw("unable to delete board", "board", session.Board, "error", err)

		}
	}
}
