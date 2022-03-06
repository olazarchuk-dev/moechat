package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nekonako/moechat/app/client/events/ws"
)

type MyUser struct {
	UserId   string
	RoomName string
}

func CreateUser(ctx *fiber.Ctx, hub *ws.Hub) error {

	myUser := new(MyUser)

	if err := ctx.BodyParser(myUser); err != nil {
		panic(err)
	}

	hub.Users[myUser.UserId] = &ws.User{
		UserId:     myUser.UserId,
		RoomName:   myUser.RoomName,
		WsServices: make(map[string]*ws.WsService),
	}

	return ctx.JSON(myUser)

}
