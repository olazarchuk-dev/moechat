package ws

import (
	"fmt"
	"strconv"
)

type Hub struct {
	Broadcast  chan *Message
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
					hub.Broadcast <- &Message{
						MessageTxt: "disconnect_client",
						ClientId:   wsService.ClientId,
						UserId:     wsService.UserId,
						Username:   wsService.Username,
					}
				}
				delete(hub.Users[wsService.UserId].WsServices, wsService.ClientId)
				close(wsService.Message)
			}

			// remove client if no one wsService
			wsServices := hub.Users[wsService.UserId].WsServices
			if len(wsServices) == 0 {
				delete(hub.Users, wsService.UserId)
			}

		case message := <-hub.Broadcast:
			if _, exist := hub.Users[message.UserId]; exist {
				for _, client := range hub.Users[message.UserId].WsServices {
					if client.UserId == message.UserId {
						client.Message <- message // TODO: MessageTxt, MessageState, ClientId, UserId, Username
						//fmt.Println(message)
						fmt.Println("Receive <<<  User_ID = '" + message.UserId + "'  |  Client_ID = '" + message.Username + "'  |  Message_TXT = '" + message.MessageTxt + "'  |  Message_STATE = " + strconv.Itoa(message.MessageState))
					}
				}

			}
		}
	}
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan *Message, 5),
		Register:   make(chan *WsService),
		Unregister: make(chan *WsService),
		Users:      make(map[string]*User),
	}
}
