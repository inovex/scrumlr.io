package sessions

import (
	"context"
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

func (db *DB) CreateAnonymousUser(name string) (DatabaseUser, error) {
	var user DatabaseUser
	insert := DatabaseUserInsert{Name: strings.TrimSpace(name), AccountType: common.Anonymous}
	_, err := db.db.NewInsert().Model(&insert).Returning("*").Exec(context.Background(), &user)

	return user, err
}

func (db *DB) CreateAppleUser(id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(id, name, avatarUrl, common.Apple, "apple_users")
}

func (db *DB) CreateAzureAdUser(id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(id, name, avatarUrl, common.AzureAd, "azure_ad_users")
}

func (db *DB) CreateGitHubUser(id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(id, name, avatarUrl, common.GitHub, "github_users")
}

func (db *DB) CreateGoogleUser(id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(id, name, avatarUrl, common.Google, "google_users")
}

func (db *DB) CreateMicrosoftUser(id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(id, name, avatarUrl, common.Microsoft, "microsoft_users")
}

func (db *DB) CreateOIDCUser(id, name, avatarUrl string) (DatabaseUser, error) {
	return db.createExternalUser(id, name, avatarUrl, common.TypeOIDC, "oidc_users")
}

func (db *DB) UpdateUser(update DatabaseUserUpdate) (DatabaseUser, error) {
	update.Name = strings.TrimSpace(update.Name)
	var user DatabaseUser
	_, err := db.db.NewUpdate().
		Model(&update).
		Where("id = ?", update.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", db), &user)

	return user, err
}

func (db *DB) GetUser(id uuid.UUID) (DatabaseUser, error) {
	var user DatabaseUser
	err := db.db.NewSelect().Model(&user).Where("id = ?", id).Scan(context.Background())
	return user, err
}

func (db *DB) IsUserAnonymous(id uuid.UUID) (bool, error) {
	count, err := db.db.NewSelect().
		Table("users").
		Column("role").
		Where("id = ?", id).
		Where("account_type = ?", common.Anonymous).
		Count(context.Background())

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (db *DB) IsUserAvailableForKeyMigration(id uuid.UUID) (bool, error) {
	count, err := db.db.NewSelect().
		Table("users").
		Column("role").
		Where("id = ?", id).
		Where("account_type = ?", common.Anonymous).
		Where("key_migration IS NULL").
		Count(context.Background())

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (db *DB) SetKeyMigration(id uuid.UUID) (DatabaseUser, error) {
	var user DatabaseUser
	_, err := db.db.NewUpdate().
		Table("users").
		Set("key_migration = ?", time.Now()).
		Where("id = ?", id).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", db), &user)

	return user, err
}

func (db *DB) createExternalUser(id, name, avatarUrl string, accountType common.AccountType, table string) (DatabaseUser, error) {
	name = strings.TrimSpace(name)
	existingUser := db.db.NewSelect().
		TableExpr(table).
		ColumnExpr("*").
		Where("id = ?", id)

	existsCheck := db.db.NewSelect().
		ColumnExpr("CASE WHEN (SELECT COUNT(*) as count FROM \"existing_user\")=1 THEN true ELSE false END AS user_exists")

	updateName := db.db.NewUpdate().
		Model((*DatabaseUser)(nil)).
		Column("name").Set("name = ?", name).
		Where("(SELECT user_exists FROM exists_check)").
		Where("id=(SELECT \"user\" FROM \"existing_user\")").
		Where("name=(SELECT name FROM \"existing_user\")")

	createNewUser := db.db.NewInsert().
		Model((*DatabaseUser)(nil)).
		ColumnExpr("name, account_type").
		TableExpr(fmt.Sprintf("(SELECT ? as name, '%s'::account_type as account_type) as sub_query WHERE (SELECT NOT user_exists FROM exists_check)", accountType), name).
		Returning("id")

	selectUser := db.db.NewSelect().
		ColumnExpr("CASE WHEN (SELECT user_exists FROM exists_check) IS TRUE THEN (SELECT \"user\" FROM \"existing_user\") ELSE (SELECT id FROM \"create_new_user\") END AS id")

	insertExternalUser := db.db.NewInsert().
		TableExpr(table).
		ColumnExpr("\"user\", id, name, avatar_url").
		TableExpr("(SELECT (SELECT id::uuid FROM select_user) as \"user\", ? as id, ? as name, ? as avatar_url) as sub_query", id, name, avatarUrl).
		On("CONFLICT (id) DO UPDATE SET name=?, avatar_url=?", name, avatarUrl)

	selectExistingUser := db.db.NewSelect().
		Model((*DatabaseUser)(nil)).
		Where("id=(SELECT id FROM select_user)")

	var user DatabaseUser
	err := db.db.NewSelect().
		With("existing_user", existingUser).
		With("exists_check", existsCheck).
		With("update_name", updateName).
		With("create_new_user", createNewUser).
		With("select_user", selectUser).
		With("insert_external_user", insertExternalUser).
		With("select_existing_user", selectExistingUser).
		TableExpr("select_existing_user").
		ColumnExpr("*").
		Join("FULL JOIN \"create_new_user\" ON true").
		Scan(context.Background(), &user)

	return user, err
}
