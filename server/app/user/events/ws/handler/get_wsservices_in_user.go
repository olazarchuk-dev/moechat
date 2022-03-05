package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/nekonako/moechat/app/user/events/ws"
	"github.com/nekonako/moechat/model/api"
)

type WsServiceList struct {
	*api.BaseResponse
	Data []WsServiceInUser `json:"data"`
}

type WsServiceInUser struct {
	ClientId string `json:"clientId"`
	Username string `json:"username"`
	RoomId   string `json:"roomId"`
}

func GetWsServiceInUser(ctx *fiber.Ctx, hub *ws.Hub) error {

	var wsServices []WsServiceInUser
	roomId := ctx.Params("roomId")
	fmt.Println(roomId)

	if _, isExist := hub.Rooms[roomId]; !isExist {
		res := WsServiceList{
			BaseResponse: &api.BaseResponse{
				Success: true,
				Code:    200,
				Message: "no wsService",
			},
			Data: make([]WsServiceInUser, 0),
		}
		return ctx.JSON(res)
	}

	if len(hub.Rooms[roomId].WsServices) == 0 {
		res := WsServiceList{
			BaseResponse: &api.BaseResponse{
				Success: true,
				Code:    200,
				Message: "no wsService",
			},
			Data: make([]WsServiceInUser, 0),
		}
		return ctx.JSON(res)
	}

	for _, wsService := range hub.Rooms[roomId].WsServices {
		wsServices = append(wsServices, WsServiceInUser{
			ClientId: wsService.ClientId,
			Username: wsService.Username,
			RoomId:   wsService.RoomId,
		})
	}

	res := WsServiceList{
		BaseResponse: &api.BaseResponse{
			Success: true,
			Code:    200,
			Message: "success get wsServices this user",
		},
		Data: wsServices,
	}

	return ctx.JSON(res)
}
