package ws

import (
	"fmt"
	"strconv"
)

type Hub struct {
	Broadcast  chan *Message
	Register   chan *WsService
	Unregister chan *WsService
	Rooms      map[string]*Room
}

func (hub *Hub) Run() {
	for {
		select {
		case wsService := <-hub.Register:
			fmt.Println("Register wsService")
			if _, isRoomExist := hub.Rooms[wsService.RoomId]; !isRoomExist {
				hub.Rooms[wsService.RoomId] = &Room{
					RoomId:     wsService.RoomId,
					WsServices: make(map[string]*WsService),
				}
			}
			room := hub.Rooms[wsService.RoomId]
			if _, isCLientExist := room.WsServices[wsService.ClientId]; !isCLientExist {
				room.WsServices[wsService.ClientId] = wsService
			}

		case wsService := <-hub.Unregister:

			if _, isCLientExist := hub.Rooms[wsService.RoomId].WsServices[wsService.ClientId]; isCLientExist {
				fmt.Println("delete connection")
				if len(hub.Rooms[wsService.RoomId].WsServices) != 0 {
					hub.Broadcast <- &Message{
						MessageTxt: "disconnect_user",
						ClientId:   wsService.ClientId,
						RoomId:     wsService.RoomId,
						Username:   wsService.Username,
					}
				}
				delete(hub.Rooms[wsService.RoomId].WsServices, wsService.ClientId)
				close(wsService.Message)
			}

			// remove user if no one wsService
			wsServices := hub.Rooms[wsService.RoomId].WsServices
			if len(wsServices) == 0 {
				delete(hub.Rooms, wsService.RoomId)
			}

		case message := <-hub.Broadcast:
			if _, exist := hub.Rooms[message.RoomId]; exist {
				for _, client := range hub.Rooms[message.RoomId].WsServices {
					if client.RoomId == message.RoomId {
						client.Message <- message // TODO: MessageTxt, MessageState, ClientId, RoomId, Username
						//fmt.Println(message)
						fmt.Println("Receive <<<  User_ID = '" + message.RoomId + "'  |  Client_ID = '" + message.Username + "'  |  Message_TXT = '" + message.MessageTxt + "'  |  Message_STATE = " + strconv.Itoa(message.MessageState))
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
		Rooms:      make(map[string]*Room),
	}
}
