package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nekonako/moechat/app/client/events/ws"
)

type MyUser struct {
	UserId   string
	UserName string
}

func CreateUser(ctx *fiber.Ctx, hub *ws.Hub) error {

	myUser := new(MyUser)

	if err := ctx.BodyParser(myUser); err != nil {
		panic(err)
	}

	hub.Users[myUser.UserId] = &ws.User{
		UserId:     myUser.UserId,
		UserName:   myUser.UserName,
		WsServices: make(map[string]*ws.WsService),
	}

	return ctx.JSON(myUser)

}
