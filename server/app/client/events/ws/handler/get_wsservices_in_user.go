package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/nekonako/moechat/app/client/events/ws"
	"github.com/nekonako/moechat/model/api"
)

type WsServiceList struct {
	*api.BaseResponse
	Data []WsServiceInUser `json:"data"`
}

type WsServiceInUser struct {
	ClientId string `json:"clientId"`
	UserId   string `json:"userId"`
	Username string `json:"username"`
}

func GetWsServiceInUser(ctx *fiber.Ctx, hub *ws.Hub) error {

	var wsServices []WsServiceInUser
	userId := ctx.Params("userId")
	fmt.Println(userId)

	if _, isExist := hub.Users[userId]; !isExist {
		res := WsServiceList{
			BaseResponse: &api.BaseResponse{
				Success: true,
				Code:    200,
				Message: "no WebSocket-Service",
			},
			Data: make([]WsServiceInUser, 0),
		}
		return ctx.JSON(res)
	}

	if len(hub.Users[userId].WsServices) == 0 {
		res := WsServiceList{
			BaseResponse: &api.BaseResponse{
				Success: true,
				Code:    200,
				Message: "no WebSocket-Service",
			},
			Data: make([]WsServiceInUser, 0),
		}
		return ctx.JSON(res)
	}

	for _, wsService := range hub.Users[userId].WsServices {
		wsServices = append(wsServices, WsServiceInUser{
			ClientId: wsService.ClientId,
			Username: wsService.Username,
			UserId:   wsService.UserId,
		})
	}

	res := WsServiceList{
		BaseResponse: &api.BaseResponse{
			Success: true,
			Code:    200,
			Message: "success get wsServices this client",
		},
		Data: wsServices,
	}

	return ctx.JSON(res)
}
