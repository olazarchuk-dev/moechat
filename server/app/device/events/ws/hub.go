package ws

import (
	"fmt"
	"strconv"
)

type Hub struct {
	Broadcast  chan *Something
	Register   chan *WsService
	Unregister chan *WsService
	Users      map[string]*User
}

func (hub *Hub) Run() {
	for {
		select {
		case wsService := <-hub.Register:
			if _, isUsernameExist := hub.Users[wsService.Username]; !isUsernameExist {
				fmt.Println(" ...Hub.Register: isUsernameExist <<<", wsService)
				hub.Users[wsService.Username] = &User{
					Username:   wsService.Username,
					WsServices: make(map[string]*WsService),
				}
			}
			user := hub.Users[wsService.Username]
			if _, isIdExist := user.WsServices[wsService.Id]; !isIdExist {
				fmt.Println(" ...Hub.Register: isIdExist <<<", wsService)
				user.WsServices[wsService.Id] = wsService
			}

		case wsService := <-hub.Unregister:
			if _, isWsServiceExist := hub.Users[wsService.Username].WsServices[wsService.Id]; isWsServiceExist {
				fmt.Println(" ...Hub.Unregister: delete Connection")
				if len(hub.Users[wsService.Username].WsServices) != 0 {
					hub.Broadcast <- &Something{
						Id:          wsService.Id,
						Username:    wsService.Username,
						DeviceName:  wsService.DeviceName,
						AppTextarea: "disconnect_device",
					}
				}
				delete(hub.Users[wsService.Username].WsServices, wsService.Id)
				close(wsService.Something)
			}

			// remove device if no one wsService
			wsServices := hub.Users[wsService.Username].WsServices
			if len(wsServices) == 0 {
				delete(hub.Users, wsService.Username)
			}

		case something := <-hub.Broadcast:
			if _, exist := hub.Users[something.Username]; exist {
				for _, wsService := range hub.Users[something.Username].WsServices {
					if wsService.Username == something.Username {
						wsService.Something <- something // TODO: Username, DeviceName, AppTextarea, AppRange
						fmt.Println(" ...Hub.Broadcast something <<<", "Username='" + something.Username + "'", "DeviceName='" + something.DeviceName + "'", "AppTextarea='"+something.AppTextarea+ "'", "AppRange='" + strconv.Itoa(something.AppRange) + "'")
					}
				}
			}
		}
	}
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan *Something, 5),
		Register:   make(chan *WsService),
		Unregister: make(chan *WsService),
		Users:      make(map[string]*User),
	}
}
