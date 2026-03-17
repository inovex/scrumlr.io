package users

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type DB struct {
	db *bun.DB
}

func NewUserDatabase(database *bun.DB) UserDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (db *DB) CreateAnonymousUser(ctx context.Context, name string) (DatabaseUser, error) {
	var user DatabaseUser
	insert := DatabaseUserInsert{Name: strings.TrimSpace(name), AccountType: common.Anonymous}
	_, err := db.db.NewInsert().
		Model(&insert).
		Returning("*").
		Exec(ctx, &user)

	return user, err
}

func (db *DB) CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(ctx, id, name, avatarUrl, common.Apple, "apple_users")
}

func (db *DB) CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(ctx, id, name, avatarUrl, common.AzureAd, "azure_ad_users")
}

func (db *DB) CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(ctx, id, name, avatarUrl, common.GitHub, "github_users")
}

func (db *DB) CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(ctx, id, name, avatarUrl, common.Google, "google_users")
}

func (db *DB) CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(ctx, id, name, avatarUrl, common.Microsoft, "microsoft_users")
}

func (db *DB) CreateOIDCUser(ctx context.Context, id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(ctx, id, name, avatarUrl, common.TypeOIDC, "oidc_users")
}

func (db *DB) UpdateUser(ctx context.Context, update DatabaseUserUpdate) (DatabaseUser, error) {
	update.Name = strings.TrimSpace(update.Name)
	var user DatabaseUser
	_, err := db.db.NewUpdate().
		Model(&update).
		Where("id = ?", update.ID).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", db), &user)

	return user, err
}

func (db *DB) GetUser(ctx context.Context, id uuid.UUID) (DatabaseUser, error) {
	var user DatabaseUser
	err := db.db.NewSelect().
		Model((*DatabaseUser)(nil)).
		Where("id = ?", id).
		Scan(ctx, &user)

	return user, err
}

func (db *DB) GetUsers(ctx context.Context, boardID uuid.UUID) ([]DatabaseUser, error) {
	var users []DatabaseUser

	err := db.db.NewSelect().
		Model((*DatabaseUser)(nil)).
		Join("JOIN board_sessions AS s ON s.user = id").
		Where("s.board = ?", boardID).
		Scan(ctx, &users)

	if err != nil {
		return []DatabaseUser{}, err
	}
	return users, err

}

func (db *DB) IsUserAnonymous(ctx context.Context, id uuid.UUID) (bool, error) {
	count, err := db.db.NewSelect().
		Table("users").
		Column("role").
		Where("id = ?", id).
		Where("account_type = ?", common.Anonymous).
		Count(ctx)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (db *DB) IsUserAvailableForKeyMigration(ctx context.Context, id uuid.UUID) (bool, error) {
	count, err := db.db.NewSelect().
		Table("users").
		Column("role").
		Where("id = ?", id).
		Where("account_type = ?", common.Anonymous).
		Where("key_migration IS NULL").
		Count(ctx)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (db *DB) SetKeyMigration(ctx context.Context, id uuid.UUID) (DatabaseUser, error) {
	var user DatabaseUser
	_, err := db.db.NewUpdate().
		Table("users").
		Set("key_migration = ?", time.Now()).
		Where("id = ?", id).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", db), &user)

	return user, err
}

func (db *DB) createExternalUser(ctx context.Context, id, name, avatarUrl string, accountType common.AccountType, table string) (DatabaseUser, error) {
	name = strings.TrimSpace(name)
	var user DatabaseUser
	err := db.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		var extUser struct {
			UserID uuid.UUID `bun:"user"`
			Name   string    `bun:"name"`
		}
		err := tx.NewSelect().
			Table(table).
			Column("user", "name").
			Where("id = ?", id).
			Scan(ctx, &extUser)

		if err == nil { // external user exists
			err = tx.NewSelect().
				Model((*DatabaseUser)(nil)).
				Where("id = ?", extUser.UserID).
				Scan(ctx, &user)

			if err != nil {
				return err
			}

			if extUser.Name == user.Name && user.Name != name {
				_, err = tx.NewUpdate().
					Table("users").
					Set("name = ?", name).
					Where("id = ?", extUser.UserID).
					Returning("*").
					Exec(common.ContextWithValues(ctx, "Database", db), &user)
				if err != nil {
					return err
				}
			}

			_, err = tx.NewUpdate().
				Table(table).
				Set("name = ?", name).
				Set("avatar_url = ?", avatarUrl).
				Where("id = ?", id).
				Exec(ctx)

			return err
		}

		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		// add new external user to the database
		insert := DatabaseUserInsert{Name: name, AccountType: accountType}
		_, err = tx.NewInsert().
			Model(&insert).
			Returning("*").
			Exec(ctx, &user)

		if err != nil {
			return err
		}

		_, err = tx.NewRaw(
			fmt.Sprintf("INSERT INTO %s (\"user\", id, name, avatar_url) VALUES (?, ?, ?, ?)", table),
			user.ID, id, name, avatarUrl,
		).Exec(ctx)

		return err
	})

	return user, err
}

func (db *DB) DeleteUser(ctx context.Context, id uuid.UUID) error {
	_, err := db.db.NewDelete().
		Model((*DatabaseUser)(nil)).
		Where("id = ?", id).
		Exec(ctx)

	return err
}
