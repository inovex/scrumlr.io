package database

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
)

// User model of the application
type User struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID     `bun:"type:uuid"`
	Avatar        *types.Avatar `bun:"type:jsonb,nullzero"`
	Name          string
	AccountType   types.AccountType
	KeyMigration  *time.Time
	CreatedAt     time.Time
}

// UserInsert the insert type for a new User
type UserInsert struct {
	bun.BaseModel `bun:"table:users"`
	Name          string
	AccountType   types.AccountType
}

type UserUpdate struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID `bun:"type:uuid"`
	Name          string
	Avatar        *types.Avatar `bun:"type:jsonb,nullzero"`
}

// CreateAnonymousUser creates a new anonymous user by the specified name
func (d *Database) CreateAnonymousUser(name string) (User, error) {
	if err := validateUsername(name); err != nil {
		return User{}, err
	}
	var user User
	insert := UserInsert{Name: strings.TrimSpace(name), AccountType: types.AccountTypeAnonymous}
	_, err := d.writeDB.NewInsert().Model(&insert).Returning("*").Exec(context.Background(), &user)
	return user, err
}

func (d *Database) CreateGitHubUser(id, name, avatarUrl string) (User, error) {
	return d.createExternalUser(id, name, avatarUrl, types.AccountTypeGitHub, "github_users")
}

func (d *Database) CreateGoogleUser(id, name, avatarUrl string) (User, error) {
	return d.createExternalUser(id, name, avatarUrl, types.AccountTypeGoogle, "google_users")
}

func (d *Database) CreateMicrosoftUser(id, name, avatarUrl string) (User, error) {
	return d.createExternalUser(id, name, avatarUrl, types.AccountTypeMicrosoft, "microsoft_users")
}

func (d *Database) CreateAzureAdUser(id, name, avatarUrl string) (User, error) {
	return d.createExternalUser(id, name, avatarUrl, types.AccountTypeAzureAd, "azure_ad_users")
}

func (d *Database) CreateAppleUser(id, name, avatarUrl string) (User, error) {
	return d.createExternalUser(id, name, avatarUrl, types.AccountTypeApple, "apple_users")
}

func (d *Database) createExternalUser(id, name, avatarUrl string, accountType types.AccountType, table string) (User, error) {
	if err := validateUsername(name); err != nil {
		return User{}, err
	}

	existingUser := d.readDB.NewSelect().TableExpr(table).ColumnExpr("*").Where("id = ?", id)
	existsCheck := d.readDB.NewSelect().ColumnExpr("CASE WHEN (SELECT COUNT(*) as count FROM \"existing_user\")=1 THEN true ELSE false END AS user_exists")
	updateName := d.writeDB.NewUpdate().Model((*User)(nil)).Column("name").Set("name = ?", name).Where("(SELECT user_exists FROM exists_check)").Where("id=(SELECT \"user\" FROM \"existing_user\")").Where("name=(SELECT name FROM \"existing_user\")")
	createNewUser := d.writeDB.NewInsert().Model((*User)(nil)).ColumnExpr("name, account_type").TableExpr(fmt.Sprintf("(SELECT ? as name, '%s'::account_type as account_type) as sub_query WHERE (SELECT NOT user_exists FROM exists_check)", accountType), name).Returning("id")
	selectUser := d.writeDB.NewSelect().ColumnExpr("CASE WHEN (SELECT user_exists FROM exists_check) IS TRUE THEN (SELECT \"user\" FROM \"existing_user\") ELSE (SELECT id FROM \"create_new_user\") END AS id")
	insertExternalUser := d.writeDB.NewInsert().TableExpr(table).ColumnExpr("\"user\", id, name, avatar_url").TableExpr("(SELECT (SELECT id::uuid FROM select_user) as \"user\", ? as id, ? as name, ? as avatar_url) as sub_query", id, name, avatarUrl).On("CONFLICT (id) DO UPDATE SET name=?, avatar_url=?", name, avatarUrl)
	selectExistingUser := d.readDB.NewSelect().Model((*User)(nil)).Where("id=(SELECT id FROM select_user)")

	var user User
	err := d.readDB.NewSelect().
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

// GetUser returns the user by the specified id
func (d *Database) GetUser(id uuid.UUID) (User, error) {
	var user User
	err := d.readDB.NewSelect().Model(&user).Where("id = ?", id).Scan(context.Background())
	return user, err
}

func (d *Database) IsUserAnonymous(id uuid.UUID) (bool, error) {
	count, err := d.readDB.NewSelect().
		Table("users").
		Column("role").
		Where("id = ?", id).
		Where("account_type = ?", types.AccountTypeAnonymous).
		Count(context.Background())
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (d *Database) IsUserAvailableForKeyMigration(id uuid.UUID) (bool, error) {
	count, err := d.readDB.NewSelect().
		Table("users").
		Column("role").
		Where("id = ?", id).
		Where("account_type = ?", types.AccountTypeAnonymous).
		Where("key_migration IS NULL").
		Count(context.Background())
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (d *Database) SetKeyMigration(id uuid.UUID) (User, error) {
	var user User
	_, err := d.writeDB.NewUpdate().
		Table("users").
		Set("key_migration = ?", time.Now()).
		Where("id = ?", id).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d), &user)
	return user, err
}

func (d *Database) UpdateUser(update UserUpdate) (User, error) {
	if err := validateUsername(update.Name); err != nil {
		return User{}, err
	}
	update.Name = strings.TrimSpace(update.Name)
	var user User
	_, err := d.writeDB.NewUpdate().
		Model(&update).
		Where("id = ?", update.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d), &user)
	return user, err
}

func validateUsername(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("name may not be empty")
	}
	if strings.Contains(name, "\n") {
		return errors.New("name may not contain newline characters")
	}
	return nil
}
