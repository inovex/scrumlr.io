package scheduler

import (
	"fmt"
	"github.com/go-co-op/gocron/v2"
	"log"
	"math/rand"
	"time"
)

func initScheduler() {
	s, err := gocron.NewScheduler()
	if err != nil {
		log.Fatal(err, "Could not initialize scheduler")
	}
	executeAt := time.Date(time.Now().Year(), time.Now().Month(), time.Now().Day(), 2, 0, 0, 0, time.Local)
	delay := rand.Intn(61)
	executeAt.Add(time.Duration(delay))

	j, err := s.NewJob(

		gocron.DailyJob(1, gocron.NewAtTimes(gocron.NewAtTime(uint(executeAt.Hour()), uint(executeAt.Minute()), uint(executeAt.Minute())))),
		//gocron.new
		gocron.NewTask(func() {
			// todo: create function to delete unused boards
		}),
	)
	if err != nil {
		// todo: handle error
	}
	fmt.Println(s.Jobs())
	fmt.Println(j.ID())
	s.Start()

	select {
	case <-ctx.Done():

	}

	if err != nil {
		// todo: handle error
	}

}

//ctx, cancel := context.WithCancel(context.Background())
//
//	go initScheduler(ctx)
//	time.Sleep(10 * time.Second)
//	// cancel to shut down scheduler
//	cancel()
//	fmt.Println("cancel")
//	select {}
