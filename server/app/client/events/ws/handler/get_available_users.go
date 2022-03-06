package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nekonako/moechat/app/client/events/ws"
	"github.com/nekonako/moechat/model/api"
)

type Res struct {
	*api.BaseResponse
	Data *[]UserList `json:"data"`
}

type UserList struct {
	UserId   string `json:"userId"`
	RoomName string `json:"roomName"`
}

func GetAvailableUsers(ctx *fiber.Ctx, hub *ws.Hub) error {

	users := make([]UserList, 0)

	for _, user := range hub.Users {
		users = append(users, UserList{
			UserId:   user.UserId,
			RoomName: user.RoomName,
		})
	}

	res := Res{
		BaseResponse: &api.BaseResponse{
			Success: true,
			Code:    200,
			Message: "success get users",
		},
		Data: &users,
	}

	return ctx.JSON(&res)
}
