package database

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/uptrace/bun"
	"log"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/votings"
	"time"

	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/notes"

	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"

	"os"
	"testing"

	"github.com/uptrace/bun/dbfixture"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
)

var testDb *bun.DB
var boardDb boards.BoardDatabase
var notesDb notes.NotesDatabase
var reactionDb reactions.ReactionDatabase
var sessionDb sessions.SessionDatabase
var sessionRequestDb sessionrequests.SessionRequestDatabase
var userDb users.UserDatabase
var columnDb columns.ColumnDatabase
var votingDb votings.VotingDatabase
var columnTemplateDb columntemplates.ColumnTemplateDatabase
var boardTemplatesDb boardtemplates.BoardTemplateDatabase
var fixture *dbfixture.Fixture

const DatabaseUsernameAndPassword = "dbtest"
const DatabaseName = "database_test"

func TestMain(m *testing.M) {
	defer os.Exit(testMainWithDefer(m))
}

func testMainWithDefer(m *testing.M) int {
	databaseUrl, closeDatabase, err := initDatabase()
	if err != nil {
		return 1
	}

	exitCode := 0
	database, err := initialize.InitializeDatabase(databaseUrl)
	if err != nil {
		println(fmt.Sprintf("unable to migrate database scheme: %s", err))
		exitCode = 1
	}

	bun := initialize.InitializeBun(database, true)
	testDb = bun

	boardDb = boards.NewBoardDatabase(bun)
	reactionDb = reactions.NewReactionsDatabase(bun)
	sessionDb = sessions.NewSessionDatabase(bun)
	sessionRequestDb = sessionrequests.NewSessionRequestDatabase(bun)
	userDb = users.NewUserDatabase(bun)
	notesDb = notes.NewNotesDatabase(bun)
	votingDb = votings.NewVotingDatabase(bun)
	columnDb = columns.NewColumnsDatabase(bun)
	columnTemplateDb = columntemplates.NewColumnTemplateDatabase(bun)
	boardTemplatesDb = boardtemplates.NewBoardTemplateDatabase(bun)

	err = loadTestdata()
	if err != nil {
		println(fmt.Sprintf("unable to load testdata: %s", err))
		exitCode = 1
	}

	if exitCode == 0 {
		exitCode = m.Run()
	}

	closeDatabase()

	return exitCode
}

func initDatabase() (string, func(), error) {
	// uses a sensible default on windows (tcp/http) and linux/osx (socket)
	pool, err := dockertest.NewPool("")
	if err != nil {
		log.Fatalf("Could not connect to docker: %s", err)
	}

	// pulls an image, creates a container based on it and runs it
	resource, err := pool.RunWithOptions(&dockertest.RunOptions{
		Repository: "postgres",
		Tag:        "16.4",
		Env: []string{
			fmt.Sprintf("POSTGRES_PASSWORD=%s", DatabaseUsernameAndPassword),
			fmt.Sprintf("POSTGRES_USER=%s", DatabaseUsernameAndPassword),
			fmt.Sprintf("POSTGRES_DB=%s", DatabaseName),
			"listen_addresses = '*'",
		},
	}, func(config *docker.HostConfig) {
		// set AutoRemove to true so that stopped container goes away by itself
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{Name: "no"}
	})
	if err != nil {
		log.Fatalf("Could not start resource: %s", err)
	}

	hostAndPort := resource.GetHostPort("5432/tcp")
	databaseUrl := fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=disable", DatabaseUsernameAndPassword, DatabaseUsernameAndPassword, hostAndPort, DatabaseName)
	log.Println("Connecting to database on url: ", databaseUrl)

	_ = resource.Expire(120) // Tell docker to hard kill the container in 120 seconds

	// exponential backoff-retry, because the application in the container might not be ready to accept connections yet
	pool.MaxWait = 120 * time.Second
	if err = pool.Retry(func() error {
		db, err := sql.Open("postgres", databaseUrl)
		if err != nil {
			return err
		}
		return db.Ping()
	}); err != nil {
		log.Fatalf("Could not connect to docker: %s", err)
	}

	return databaseUrl, func() {
		// You can't defer this because os.Exit doesn't care for defer
		if err := pool.Purge(resource); err != nil {
			log.Fatalf("Could not purge resource: %s", err)
		}
	}, err
}

func loadTestdata() error {
	testDb.RegisterModel(
		(*users.DatabaseUser)(nil),
		(*boards.DatabaseBoard)(nil),
		(*sessions.DatabaseBoardSessionInsert)(nil),
		(*columns.DatabaseColumn)(nil),
		(*notes.NoteDB)(nil),
		(*votings.VotingDB)(nil),
		(*votings.VoteDB)(nil),
		(*reactions.DatabaseReaction)(nil),
		(*boardtemplates.DatabaseBoardTemplate)(nil),
		(*columntemplates.DatabaseColumnTemplate)(nil),
	)
	fixture = dbfixture.New(testDb)
	return fixture.Load(context.Background(), os.DirFS("testdata"), "fixture.yml")
}
