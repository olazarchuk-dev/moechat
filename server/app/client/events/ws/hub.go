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
			fmt.Println("Register wsService")
			if _, isUserExist := hub.Users[wsService.UserId]; !isUserExist {
				hub.Users[wsService.UserId] = &User{
					UserId:     wsService.UserId,
					WsServices: make(map[string]*WsService),
				}
			}
			user := hub.Users[wsService.UserId]
			if _, isCLientExist := user.WsServices[wsService.ClientId]; !isCLientExist {
				user.WsServices[wsService.ClientId] = wsService
			}

		case wsService := <-hub.Unregister:

			if _, isCLientExist := hub.Users[wsService.UserId].WsServices[wsService.ClientId]; isCLientExist {
				fmt.Println("delete connection")
				if len(hub.Users[wsService.UserId].WsServices) != 0 {
					hub.Broadcast <- &Something{
						ClientId:   wsService.ClientId,
						UserId:     wsService.UserId,
						Username:   wsService.Username,
						MessageTxt: "disconnect_client",
					}
				}
				delete(hub.Users[wsService.UserId].WsServices, wsService.ClientId)
				close(wsService.Something)
			}

			// remove client if no one wsService
			wsServices := hub.Users[wsService.UserId].WsServices
			if len(wsServices) == 0 {
				delete(hub.Users, wsService.UserId)
			}

		case something := <-hub.Broadcast:
			if _, exist := hub.Users[something.UserId]; exist {
				for _, client := range hub.Users[something.UserId].WsServices {
					if client.UserId == something.UserId {
						client.Something <- something // TODO: MessageTxt, MessageState, ClientId, UserId, Username
						//fmt.Println(something)
						fmt.Println("Receive <<<  User_ID = '" + something.UserId + "'  |  Client_ID = '" + something.Username + "'  |  FormData_TXT = '" + something.MessageTxt + "'  |  FormData_STATE = " + strconv.Itoa(something.MessageState))
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
