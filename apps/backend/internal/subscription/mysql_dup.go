package subscription

import (
	"errors"

	"github.com/go-sql-driver/mysql"
)

func isMySQLDuplicateKey(err error) bool {
	var me *mysql.MySQLError
	return errors.As(err, &me) && me.Number == 1062
}
